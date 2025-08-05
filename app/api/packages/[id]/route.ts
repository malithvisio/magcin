import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import { getUserContext, decrementUsage } from '@/util/tenantContext';

// GET endpoint to fetch a single package by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const packageId = params.id;

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return 404 (for security)
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Find package with root user filtering
    const packageData = await Package.findOne({
      _id: packageId,
      rootUserId: userContext.rootUserId,
    });

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({ package: packageData }, { status: 200 });
  } catch (error) {
    console.error('Get package error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a package
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    const packageId = params.id;
    const data = await request.json();

    // Check if this is a draft save
    const isDraft = data.isDraft === true;

    // Prepare update data
    let updateData = { ...data };

    // For draft saves, provide default values for required fields to avoid MongoDB validation errors
    if (isDraft) {
      // Set default values for required fields to allow partial saves
      const defaults = {
        name: data.name || 'Draft Package',
        title: data.title || 'Draft Package',
        image: data.image || '',
        summery: data.summery || 'Draft package summary',
        location: data.location || 'Draft location',
        duration: data.duration || 'Draft duration',
        days: data.days || '1',
        nights: data.nights || '1',
        destinations: data.destinations || '1',
        type: data.type || 'tour',
        mini_discription: data.mini_discription || 'Draft mini description',
        description: data.description || 'Draft description',
        highlights:
          data.highlights && data.highlights.length > 0
            ? data.highlights
            : ['Draft highlight'],
        inclusions:
          data.inclusions && data.inclusions.length > 0
            ? data.inclusions
            : ['Draft inclusion'],
        exclusions:
          data.exclusions && data.exclusions.length > 0
            ? data.exclusions
            : ['Draft exclusion'],
        category: data.category || '65f1a2b3c4d5e6f7a8b9c0d1', // Default category ID
        itinerary: data.itinerary || [],
        locations: data.locations || [],
        accommodationPlaces: data.accommodationPlaces || [],
        guidelinesFaqs: data.guidelinesFaqs || [],
        packageReviews: data.packageReviews || [],
        published: false, // Draft packages are not published
        rootUserId: userContext.rootUserId, // Add rootUserId from user context
      };

      // Merge with provided data, keeping provided values over defaults
      Object.assign(updateData, defaults);
    }

    console.log('=== UPDATE PACKAGE DEBUG ===');
    console.log('Package ID:', packageId);
    console.log('User context:', userContext);
    console.log('Update data:', JSON.stringify(updateData, null, 2));

    // Find and update package with root user filtering
    const updatedPackage = await Package.findOneAndUpdate(
      {
        _id: packageId,
        rootUserId: userContext.rootUserId,
      },
      updateData,
      {
        new: true,
        runValidators: !isDraft, // Skip validation for draft saves
      }
    );

    console.log('Update result:', updatedPackage);

    if (!updatedPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: isDraft
          ? 'Package saved as draft successfully'
          : 'Package updated successfully',
        package: updatedPackage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update package error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: `Validation error: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a package
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    const packageId = params.id;

    // Find and delete package with root user filtering
    const deletedPackage = await Package.findOneAndDelete({
      _id: packageId,
      rootUserId: userContext.rootUserId,
    });

    if (!deletedPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Decrement usage if package was published
    if (deletedPackage.published) {
      await decrementUsage(userContext.rootUserId, 'packages');
    }

    return NextResponse.json(
      {
        message: 'Package deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete package error:', error);
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update specific fields (like published status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    const packageId = params.id;
    const data = await request.json();

    // Find and update package with root user filtering
    const updatedPackage = await Package.findOneAndUpdate(
      {
        _id: packageId,
        rootUserId: userContext.rootUserId,
      },
      data,
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Package updated successfully',
        package: updatedPackage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update package error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: `Validation error: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    );
  }
}
