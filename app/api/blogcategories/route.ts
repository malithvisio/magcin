import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogCategory from '@/models/BlogCategory';
import { getUserContext } from '@/util/tenantContext';

// GET endpoint to fetch all blog categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant filtering
    let userContext;
    let rootUserId;

    try {
      userContext = await getUserContext(request);
      rootUserId = userContext.rootUserId;
      console.log(
        'Blog categories API - Using authenticated user rootUserId:',
        rootUserId
      );
    } catch (error) {
      // If no authentication, use the default root user ID for admin access
      rootUserId = '68786e17d6e23d3a8ec0fe2f';
      console.log(
        'Blog categories API - Using default rootUserId for admin access:',
        rootUserId
      );
    }

    // Fetch categories for the user, sorted by position
    const blogCategories = await BlogCategory.find({
      rootUserId: rootUserId,
    }).sort({ position: 1, createdAt: 1 });

    console.log(
      'Blog categories API - Found categories:',
      blogCategories.length
    );

    return NextResponse.json({ blogCategories }, { status: 200 });
  } catch (error) {
    console.error('Get blog categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new blog category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name } = await request.json();

    console.log('=== CREATE BLOG CATEGORY DEBUG ===');
    console.log('Request body:', { name });

    // Get user context for multi-tenant authentication
    let userContext;
    try {
      userContext = await getUserContext(request);
      console.log('User context:', {
        userId: userContext.userId,
        rootUserId: userContext.rootUserId,
        email: userContext.email,
      });
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!name || !name.trim()) {
      console.log('Validation failed: name is empty');
      return NextResponse.json(
        { error: 'Blog category name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    console.log('Checking for existing category with name:', trimmedName);
    console.log('For rootUserId:', userContext.rootUserId);

    // Check if category with same name already exists for this root user
    const existingCategory = await BlogCategory.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      rootUserId: userContext.rootUserId,
    });

    console.log(
      'Existing category found:',
      existingCategory
        ? {
            _id: existingCategory._id,
            name: existingCategory.name,
            rootUserId: existingCategory.rootUserId,
          }
        : null
    );

    if (existingCategory) {
      console.log('Duplicate category detected - returning error');
      return NextResponse.json(
        {
          error: 'Blog category with this name already exists for your account',
        },
        { status: 409 }
      );
    }

    // Get the highest position to add new category at the end
    const lastCategory = await BlogCategory.findOne({
      rootUserId: userContext.rootUserId,
    }).sort({ position: -1 });

    const newPosition = lastCategory ? lastCategory.position + 1 : 0;
    console.log('New position:', newPosition);

    // Create the new category
    const newCategory = new BlogCategory({
      name: trimmedName,
      rootUserId: userContext.rootUserId,
      position: newPosition,
    });

    console.log('Attempting to save category:', {
      name: newCategory.name,
      rootUserId: newCategory.rootUserId,
      position: newCategory.position,
    });

    await newCategory.save();

    console.log('Blog category created successfully:', {
      id: newCategory._id,
      name: newCategory.name,
      rootUserId: newCategory.rootUserId,
    });

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Create blog category error:', error);

    // Check if it's a duplicate key error
    if ((error as any).code === 11000) {
      console.log('Duplicate key error detected');
      return NextResponse.json(
        {
          error: 'Blog category with this name already exists for your account',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create blog category' },
      { status: 500 }
    );
  }
}
