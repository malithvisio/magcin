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

    // Get all indexes
    const indexes = await BlogCategory.collection.indexes();

    // Get sample data to test uniqueness
    const sampleCategories = await BlogCategory.find({
      rootUserId: userContext.rootUserId,
    }).limit(5);

    return NextResponse.json(
      {
        message: 'Current blog category indexes',
        indexes: indexes.map(idx => ({
          name: idx.name,
          key: idx.key,
          unique: idx.unique,
          background: idx.background,
        })),
        sampleCategories: sampleCategories.map(cat => ({
          _id: cat._id,
          name: cat.name,
          rootUserId: cat.rootUserId,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test indexes error:', error);
    return NextResponse.json(
      { error: 'Failed to get indexes' },
      { status: 500 }
    );
  }
}
