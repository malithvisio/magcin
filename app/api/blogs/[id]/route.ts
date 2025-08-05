import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import {
  getUserContext,
  createRootUserFilter,
  decrementUsage,
} from '@/util/tenantContext';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Get user context for root user filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return 404 (for security)
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Find blog with root user filtering
    const blog = await Blog.findOne({
      _id: params.id,
      ...createRootUserFilter(userContext.rootUserId),
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
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

    // Get user context for root user authentication
    const userContext = await getUserContext(request);
    const data = await request.json();

    // Find and update blog with root user filtering
    const updatedBlog = await Blog.findOneAndUpdate(
      {
        _id: params.id,
        ...createRootUserFilter(userContext.rootUserId),
      },
      data,
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Blog updated successfully',
      blog: updatedBlog,
    });
  } catch (error: any) {
    console.error('Error updating blog:', error);

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
      { error: 'Failed to update blog' },
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

    // Get user context for root user authentication
    const userContext = await getUserContext(request);

    // Find and delete blog with root user filtering
    const deletedBlog = await Blog.findOneAndDelete({
      _id: params.id,
      ...createRootUserFilter(userContext.rootUserId),
    });

    if (!deletedBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Decrement usage
    await decrementUsage(userContext.rootUserId, 'blogs');

    return NextResponse.json({
      message: 'Blog deleted successfully',
      blog: deletedBlog,
    });
  } catch (error: any) {
    console.error('Error deleting blog:', error);

    // Handle authentication errors
    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
