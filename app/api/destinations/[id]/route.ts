import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Destination from '@/models/Destination';
import {
  getUserContext,
  createTenantFilter,
  decrementUsage,
} from '@/util/tenantContext';

// PUT endpoint to update a destination
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Destination ID is required' },
        { status: 400 }
      );
    }

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Connect to database
    await connectDB();

    // Parse the request body
    const updateData = await request.json();

    // Find and update destination with root user filtering
    const updatedDestination = await Destination.findOneAndUpdate(
      {
        _id: id,
        rootUserId: userContext.rootUserId, // Filter by root user ID
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDestination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Destination updated successfully',
      destination: updatedDestination,
    });
  } catch (error: any) {
    console.error('Update destination error:', error);

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
      { error: 'Failed to update destination' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a destination
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Destination ID is required' },
        { status: 400 }
      );
    }

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Connect to database
    await connectDB();

    // Find and delete destination with root user filtering
    const deletedDestination = await Destination.findOneAndDelete({
      _id: id,
      rootUserId: userContext.rootUserId, // Filter by root user ID
    });

    if (!deletedDestination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    // Decrement usage if destination was published
    if (deletedDestination.published) {
      await decrementUsage(userContext.userId, 'destinations');
    }

    return NextResponse.json({
      message: 'Destination deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete destination error:', error);

    // Handle authentication errors
    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete destination' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch a single destination by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Destination ID is required' },
        { status: 400 }
      );
    }

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return 404 (for security)
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    console.log('Single Destination API - User Context:', {
      userId: userContext.userId,
      rootUserId: userContext.rootUserId,
      companyId: userContext.companyId,
      tenantId: userContext.tenantId,
    });

    console.log('Single Destination API - Looking for destination ID:', id);

    // Connect to database
    await connectDB();

    // Find the destination with root user filtering
    const destination = await Destination.findOne({
      _id: id,
      rootUserId: userContext.rootUserId, // Filter by root user ID
    });

    console.log(
      'Single Destination API - Found destination:',
      destination ? 'Yes' : 'No'
    );

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ destination }, { status: 200 });
  } catch (error) {
    console.error('Get destination error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
