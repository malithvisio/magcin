import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogCategory from '@/models/BlogCategory';
import { getUserContext } from '@/util/tenantContext';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for authentication
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get all categories (for debugging)
    const allCategories = await BlogCategory.find({}).sort({ createdAt: 1 });

    // Get categories for current user
    const userCategories = await BlogCategory.find({
      rootUserId: userContext.rootUserId,
    }).sort({ createdAt: 1 });

    // Get database indexes
    const indexes = await BlogCategory.collection.indexes();

    return NextResponse.json(
      {
        message: 'Blog categories debug info',
        currentUser: {
          userId: userContext.userId,
          rootUserId: userContext.rootUserId,
          email: userContext.email,
        },
        allCategories: allCategories.map(cat => ({
          _id: cat._id,
          name: cat.name,
          rootUserId: cat.rootUserId,
          createdAt: cat.createdAt,
        })),
        userCategories: userCategories.map(cat => ({
          _id: cat._id,
          name: cat.name,
          rootUserId: cat.rootUserId,
          createdAt: cat.createdAt,
        })),
        indexes: indexes.map(idx => ({
          name: idx.name,
          key: idx.key,
          unique: idx.unique,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Failed to get debug info' },
      { status: 500 }
    );
  }
}
