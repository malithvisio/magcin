import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogCategory from '@/models/BlogCategory';
import { getUserContext } from '@/util/tenantContext';

// GET endpoint to fetch a specific blog category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const category = await BlogCategory.findOne({
      _id: params.id,
      rootUserId: userContext.rootUserId,
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Blog category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    console.error('Get blog category error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog category' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a blog category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { name } = await request.json();

    // Get user context for multi-tenant authentication
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Blog category name is required' },
        { status: 400 }
      );
    }

    // Check if category exists and belongs to the user
    const existingCategory = await BlogCategory.findOne({
      _id: params.id,
      rootUserId: userContext.rootUserId,
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Blog category not found' },
        { status: 404 }
      );
    }

    // Check if new name conflicts with another category for the same root user
    const conflictingCategory = await BlogCategory.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      rootUserId: userContext.rootUserId,
      _id: { $ne: params.id },
    });

    if (conflictingCategory) {
      return NextResponse.json(
        {
          error: 'Blog category with this name already exists for your account',
        },
        { status: 409 }
      );
    }

    // Update the category
    const updatedCategory = await BlogCategory.findByIdAndUpdate(
      params.id,
      { name: name.trim() },
      { new: true }
    );

    return NextResponse.json({ category: updatedCategory }, { status: 200 });
  } catch (error) {
    console.error('Update blog category error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog category' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a blog category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if category exists and belongs to the user
    const existingCategory = await BlogCategory.findOne({
      _id: params.id,
      rootUserId: userContext.rootUserId,
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Blog category not found' },
        { status: 404 }
      );
    }

    // Delete the category
    await BlogCategory.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Blog category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete blog category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog category' },
      { status: 500 }
    );
  }
}
