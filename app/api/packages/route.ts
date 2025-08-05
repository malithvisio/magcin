import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import {
  getUserContext,
  canCreateContent,
  incrementUsage,
} from '@/util/tenantContext';

// GET - Get all packages for this root user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return empty array (for public access)
      return NextResponse.json({ packages: [] }, { status: 200 });
    }

    // Build query with root user filtering
    let query: any = { rootUserId: userContext.rootUserId };

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const published = searchParams.get('published');
    const category = searchParams.get('category');

    console.log('=== PACKAGES API DEBUG ===');
    console.log('User context:', {
      userId: userContext.userId,
      rootUserId: userContext.rootUserId,
      email: userContext.email,
    });
    console.log('Root user filter:', { rootUserId: userContext.rootUserId });
    console.log('Category parameter:', category);

    // Add category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Add published filter
    if (published !== null) {
      query.published = published === 'true';
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    // Get total count
    const total = await Package.countDocuments(query);
    console.log('Total packages found:', total);

    // Get packages with pagination
    const packages = await Package.find(query)
      .sort({ position: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('rootUserId', 'name email');

    console.log('Packages returned:', packages.length);
    console.log(
      'Package IDs:',
      packages.map(p => p._id)
    );

    return NextResponse.json({
      packages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET packages error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch packages',
      },
      { status: 500 }
    );
  }
}

// POST - Create new package for this root user
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Check if user can create packages
    const quotaCheck = await canCreateContent(
      userContext.rootUserId,
      'packages'
    );
    if (!quotaCheck.canCreate) {
      return NextResponse.json(
        {
          error: `Package limit reached. You can create ${quotaCheck.remaining} more packages. Please upgrade your subscription.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check if this is a draft save
    const isDraft = body.isDraft === true;

    // Only validate required fields if not saving as draft
    if (!isDraft) {
      // Validate required fields for publishing
      if (!body.name || !body.title || !body.image) {
        return NextResponse.json(
          { error: 'Name, title, and image are required' },
          { status: 400 }
        );
      }
    }

    // Prepare package data with root user context
    const packageData = {
      ...body,
      rootUserId: userContext.rootUserId,
      published: isDraft
        ? false
        : body.published !== undefined
          ? body.published
          : true,
    };

    // For draft saves, provide default values for required fields to avoid MongoDB validation errors
    if (isDraft) {
      // Set default values for required fields to allow partial saves
      const defaults = {
        id: body.id || `package_${Date.now()}`,
        name: body.name || 'Draft Package',
        title: body.title || 'Draft Package',
        image: body.image || '',
        summery: body.summery || 'Draft package summary',
        location: body.location || 'Draft location',
        duration: body.duration || 'Draft duration',
        days: body.days || '1',
        nights: body.nights || '1',
        destinations: body.destinations || '1',
        type: body.type || 'tour',
        mini_discription: body.mini_discription || 'Draft mini description',
        description: body.description || 'Draft description',
        highlights:
          body.highlights && body.highlights.length > 0
            ? body.highlights
            : ['Draft highlight'],
        inclusions:
          body.inclusions && body.inclusions.length > 0
            ? body.inclusions
            : ['Draft inclusion'],
        exclusions:
          body.exclusions && body.exclusions.length > 0
            ? body.exclusions
            : ['Draft exclusion'],
        category: body.category || '65f1a2b3c4d5e6f7a8b9c0d1', // Default category ID
        itinerary: body.itinerary || [],
        locations: body.locations || [],
        accommodationPlaces: body.accommodationPlaces || [],
        guidelinesFaqs: body.guidelinesFaqs || [],
        packageReviews: body.packageReviews || [],
      };

      // Merge with provided data, keeping provided values over defaults
      Object.assign(packageData, defaults);
    }

    console.log('=== CREATE PACKAGE DEBUG ===');
    console.log('Package data:', JSON.stringify(packageData, null, 2));
    console.log('User context:', userContext);

    const newPackage = await Package.create(packageData);

    console.log('Created package:', newPackage);

    // Increment usage only if not a draft
    if (!isDraft) {
      await incrementUsage(userContext.rootUserId, 'packages');
    }

    return NextResponse.json(
      {
        message: isDraft
          ? 'Package saved as draft successfully'
          : 'Package created successfully',
        package: newPackage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST packages error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: `Validation error: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }

    // Handle authentication errors
    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create package',
      },
      { status: 500 }
    );
  }
}
