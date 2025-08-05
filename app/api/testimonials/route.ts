import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import {
  getUserContext,
  canCreateContent,
  incrementUsage,
} from '@/util/tenantContext';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/testimonials - Starting request ===');
    await connectToDatabase();
    console.log('Database connected successfully');

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
      console.log('User context retrieved:', {
        userId: userContext.userId,
        rootUserId: userContext.rootUserId,
        email: userContext.email,
        role: userContext.role,
      });
    } catch (error) {
      console.log('No authentication found, returning empty array');
      // If no authentication, return empty array (for public access)
      return NextResponse.json({ testimonials: [] }, { status: 200 });
    }

    // Build query with root user filtering
    const query = { rootUserId: userContext.rootUserId };
    console.log('Query filter:', query);

    const testimonials = await Testimonial.find(query)
      .sort({ position: 1 })
      .lean();

    console.log('Found testimonials count:', testimonials.length);
    console.log(
      'Testimonials:',
      testimonials.map(t => ({
        id: t._id,
        name: t.name,
        rootUserId: t.rootUserId,
      }))
    );

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// Temporary debug endpoint to check database
export async function POST(request: NextRequest) {
  try {
    console.log('=== TESTIMONIALS API DEBUG ===');
    console.log(
      'Request headers:',
      Object.fromEntries(request.headers.entries())
    );

    await connectToDatabase();

    // Get user context for multi-tenant authentication
    console.log('Getting user context...');
    const userContext = await getUserContext(request);
    console.log('User context retrieved:', userContext);

    // Check if user can create more testimonials
    console.log('Checking quota...');
    const quotaCheck = await canCreateContent(
      userContext.rootUserId,
      'testimonials'
    );
    console.log('Quota check result:', quotaCheck);

    if (!quotaCheck.canCreate) {
      return NextResponse.json(
        {
          error: `Testimonial limit reached. You can create ${quotaCheck.remaining} more testimonials. Please upgrade your subscription.`,
        },
        { status: 403 }
      );
    }

    const data = await request.json();
    console.log('Request data:', data);

    // Check if this is a draft save
    const isDraft = data.isDraft === true;

    // Only validate required fields if not saving as draft
    if (!isDraft) {
      const requiredFields = ['name', 'review', 'rating'];
      const missingFields = requiredFields.filter(field => {
        const value = data[field];
        if (field === 'rating') {
          // Rating is a number, check if it exists and is valid
          return !value || typeof value !== 'number' || value < 1 || value > 5;
        } else {
          // String fields, check if they exist and are not empty
          return !value || typeof value !== 'string' || !value.trim();
        }
      });

      console.log('Required fields check:', { requiredFields, missingFields });

      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Missing required fields: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Prepare testimonial data with root user context
    const testimonialData = {
      ...data,
      rootUserId: userContext.rootUserId, // Use effective root user ID
      published: isDraft
        ? false
        : data.published !== undefined
          ? data.published
          : true,
    };

    // For draft saves, provide default values for required fields to avoid MongoDB validation errors
    if (isDraft) {
      const defaults = {
        name: data.name || 'Draft Testimonial',
        review: data.review || 'Draft review text',
        rating: data.rating || 5,
      };

      // Merge with provided data, keeping provided values over defaults
      Object.assign(testimonialData, defaults);
    }

    console.log('Testimonial data to create:', testimonialData);

    const newTestimonial = await Testimonial.create(testimonialData);
    console.log('Testimonial created successfully:', newTestimonial);

    // Increment usage if not a draft
    if (!isDraft) {
      await incrementUsage(userContext.rootUserId, 'testimonials');
    }

    return NextResponse.json({
      message: isDraft
        ? 'Testimonial saved as draft successfully'
        : 'Testimonial created successfully',
      testimonial: newTestimonial,
    });
  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    console.error('Error stack:', error.stack);

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

    // Handle duplicate key errors (unique constraint)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: 'A testimonial with this name already exists in your account.',
        },
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
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}
