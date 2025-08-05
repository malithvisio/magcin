import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Package from '@/models/Package';
import {
  getUserContext,
  canCreateContent,
  incrementUsage,
  decrementUsage,
  createTenantFilter,
  getSubscriptionErrorMessage,
  validateSubscriptionStatus,
  getSubscriptionStatusError,
} from '@/util/tenantContext';

// GET - Fetch all packages for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Extract user context from JWT token
    const userContext = await getUserContext(request);

    // Validate subscription status
    if (!validateSubscriptionStatus(userContext.subscriptionStatus)) {
      const errorMessage = getSubscriptionStatusError(
        userContext.subscriptionStatus
      );
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const published = searchParams.get('published');

    // Build query filter
    let filter = createTenantFilter(userContext.userId, userContext.tenantId);

    // Add published filter if specified
    if (published !== null) {
      filter.published = published === 'true';
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const packages = await Package.find(filter)
      .sort({ position: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name');

    // Get total count for pagination
    const total = await Package.countDocuments(filter);

    return NextResponse.json({
      success: true,
      packages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch packages',
      },
      { status: 500 }
    );
  }
}

// POST - Create a new package for the authenticated user
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Extract user context from JWT token
    const userContext = await getUserContext(request);

    // Validate subscription status
    if (!validateSubscriptionStatus(userContext.subscriptionStatus)) {
      const errorMessage = getSubscriptionStatusError(
        userContext.subscriptionStatus
      );
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }

    // Check if user can create more packages
    const quotaCheck = await canCreateContent(userContext.userId, 'packages');

    if (!quotaCheck.canCreate) {
      return NextResponse.json(
        {
          error: getSubscriptionErrorMessage('packages'),
          quota: {
            remaining: quotaCheck.remaining,
            limit: quotaCheck.limit,
          },
        },
        { status: 403 }
      );
    }

    // Get package data from request
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'location', 'duration'];
    const missingFields = requiredFields.filter(field => !data[field]?.trim());

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create package with tenant context
    const packageData = {
      ...data,
      userId: userContext.userId,
      tenantId: userContext.tenantId,
      id: data.id || `package_${Date.now()}`,
      published: data.published || false,
      position: data.position || 0,
    };

    const newPackage = new Package(packageData);
    await newPackage.save();

    // Increment usage
    await incrementUsage(userContext.userId, 'packages');

    return NextResponse.json(
      {
        success: true,
        package: newPackage,
        message: 'Package created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create package',
      },
      { status: 500 }
    );
  }
}

// PUT - Update a package (only if it belongs to the user)
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    // Extract user context from JWT token
    const userContext = await getUserContext(request);

    // Validate subscription status
    if (!validateSubscriptionStatus(userContext.subscriptionStatus)) {
      const errorMessage = getSubscriptionStatusError(
        userContext.subscriptionStatus
      );
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }

    // Get package data from request
    const data = await request.json();
    const packageId = data._id;

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Find package and ensure it belongs to the user
    const existingPackage = await Package.findOne({
      _id: packageId,
      userId: userContext.userId,
      tenantId: userContext.tenantId,
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Package not found or access denied' },
        { status: 404 }
      );
    }

    // Update package
    Object.assign(existingPackage, data);
    await existingPackage.save();

    return NextResponse.json({
      success: true,
      package: existingPackage,
      message: 'Package updated successfully',
    });
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update package',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a package (only if it belongs to the user)
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    // Extract user context from JWT token
    const userContext = await getUserContext(request);

    // Validate subscription status
    if (!validateSubscriptionStatus(userContext.subscriptionStatus)) {
      const errorMessage = getSubscriptionStatusError(
        userContext.subscriptionStatus
      );
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }

    // Get package ID from request
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('id');

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Find and delete package, ensuring it belongs to the user
    const deletedPackage = await Package.findOneAndDelete({
      _id: packageId,
      userId: userContext.userId,
      tenantId: userContext.tenantId,
    });

    if (!deletedPackage) {
      return NextResponse.json(
        { error: 'Package not found or access denied' },
        { status: 404 }
      );
    }

    // Decrement usage
    await decrementUsage(userContext.userId, 'packages');

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete package',
      },
      { status: 500 }
    );
  }
}
