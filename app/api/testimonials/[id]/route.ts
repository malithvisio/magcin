import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { getUserContext, decrementUsage } from '@/util/tenantContext';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return 404 (for security)
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Find testimonial with root user filtering
    const testimonial = await Testimonial.findOne({
      _id: params.id,
      rootUserId: userContext.rootUserId,
    }).lean();

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonial' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);
    const data = await request.json();

    // Find and update testimonial with root user filtering
    const updatedTestimonial = await Testimonial.findOneAndUpdate(
      {
        _id: params.id,
        rootUserId: userContext.rootUserId,
      },
      data,
      { new: true, runValidators: true }
    );

    if (!updatedTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Testimonial updated successfully',
      testimonial: updatedTestimonial,
    });
  } catch (error: any) {
    console.error('Error updating testimonial:', error);

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
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Find and delete testimonial with root user filtering
    const deletedTestimonial = await Testimonial.findOneAndDelete({
      _id: params.id,
      rootUserId: userContext.rootUserId,
    });

    if (!deletedTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Decrement usage if testimonial was published
    if (deletedTestimonial.published) {
      await decrementUsage(userContext.rootUserId, 'testimonials');
    }

    return NextResponse.json({
      message: 'Testimonial deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting testimonial:', error);

    // Handle authentication errors
    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
