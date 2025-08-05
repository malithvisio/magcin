import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import Category from '@/models/Category';
import mongoose from 'mongoose';
import { getUserContext } from '@/util/tenantContext';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const categoryId = params.id;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    const deletedCategory = await Category.findOneAndDelete({
      _id: categoryId,
      rootUserId: userContext.rootUserId,
    });

    if (!deletedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const categoryId = params.id;
    const { name } = await request.json();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Check if another category with the same name exists for this root user (excluding current category)
    const existingCategory = await Category.findOne({
      _id: { $ne: categoryId },
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      rootUserId: userContext.rootUserId,
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      );
    }

    const updatedCategory = await Category.findOneAndUpdate(
      {
        _id: categoryId,
        rootUserId: userContext.rootUserId,
      },
      { name: name.trim() },
      { new: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category: updatedCategory }, { status: 200 });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

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
      // If no authentication, return 404 (for security)
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Find category with root user filtering
    const category = await Category.findOne({
      _id: params.id,
      rootUserId: userContext.rootUserId,
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
