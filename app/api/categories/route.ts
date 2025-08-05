import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { getUserContext } from '@/util/tenantContext';

// GET endpoint to fetch all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return empty array (for public access)
      return NextResponse.json({ categories: [] }, { status: 200 });
    }

    // Build query with root user filtering
    const query = { rootUserId: userContext.rootUserId };

    const categories = await Category.find(query).sort({
      position: 1,
      createdAt: -1,
    });

    console.log(
      'GET categories - fetched categories with positions:',
      categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        position: cat.position,
      }))
    );

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name } = await request.json();

    console.log('=== CATEGORY CREATION DEBUG ===');
    console.log(
      'Request headers:',
      Object.fromEntries(request.headers.entries())
    );
    console.log('Request body:', { name });
    console.log('Request URL:', request.url);

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Get user context for multi-tenant authentication
    let userContext;
    try {
      userContext = await getUserContext(request);
      console.log('User context retrieved successfully:', {
        userId: userContext.userId,
        rootUserId: userContext.rootUserId,
        email: userContext.email,
        role: userContext.role,
      });
    } catch (error) {
      console.error('Failed to get user context:', error);
      return NextResponse.json(
        { error: 'Authentication required. Please log in again.' },
        { status: 401 }
      );
    }

    console.log('Creating category for user context:', {
      userId: userContext.userId,
      rootUserId: userContext.rootUserId,
      categoryName: name.trim(),
    });

    // Check if category with same name already exists for this specific root user
    // Only check within the same root user context, not across all tenants
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      rootUserId: userContext.rootUserId,
    });

    if (existingCategory) {
      console.log('Category already exists for this root user:', {
        existingId: existingCategory._id,
        existingName: existingCategory.name,
        rootUserId: existingCategory.rootUserId,
      });
      return NextResponse.json(
        { error: 'Category with this name already exists for your account' },
        { status: 409 }
      );
    }

    // Also check for any orphaned categories (without rootUserId) that might conflict
    // This handles the case where old categories exist without rootUserId
    const orphanedCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      $or: [{ rootUserId: { $exists: false } }, { rootUserId: null }],
    });

    if (orphanedCategory) {
      console.log('Found orphaned category that might conflict:', {
        existingId: orphanedCategory._id,
        existingName: orphanedCategory.name,
        rootUserId: orphanedCategory.rootUserId,
      });
      // Update the orphaned category to have the current rootUserId
      await Category.findByIdAndUpdate(orphanedCategory._id, {
        rootUserId: userContext.rootUserId,
      });
      console.log('Updated orphaned category with rootUserId');
    }

    // Get the highest position number for this specific root user
    const lastCategory = await Category.findOne({
      rootUserId: userContext.rootUserId,
    }).sort({ position: -1 });

    const nextPosition = lastCategory ? lastCategory.position + 1 : 0;

    // Create the new category
    const categoryData = {
      name: name.trim(),
      position: nextPosition,
      rootUserId: userContext.rootUserId,
    };

    console.log('Creating category with data:', categoryData);

    try {
      const category = await Category.create(categoryData);

      console.log('Category created successfully:', {
        id: category._id,
        name: category.name,
        position: category.position,
        rootUserId: category.rootUserId,
      });

      return NextResponse.json({ category }, { status: 201 });
    } catch (createError) {
      console.error('Category creation failed:', createError);

      // Check if it's a validation error
      if (
        createError instanceof Error &&
        createError.message.includes('validation failed')
      ) {
        console.error('Validation error details:', createError);
        return NextResponse.json(
          { error: 'Invalid category data provided' },
          { status: 400 }
        );
      }

      // Check if it's a duplicate key error
      if (
        createError instanceof Error &&
        createError.message.includes('duplicate key')
      ) {
        console.error('Duplicate key error:', createError);
        return NextResponse.json(
          { error: 'Category with this name already exists for your account' },
          { status: 409 }
        );
      }

      throw createError; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error('Create category error:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });

      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: 'Invalid category data provided' },
          { status: 400 }
        );
      }
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Category with this name already exists for your account' },
          { status: 409 }
        );
      }
      if (error.message.includes('User authentication required')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
