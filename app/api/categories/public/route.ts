import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import {
  createRootUserFilter,
  isValidRootUserId,
} from '@/util/root-user-config';

// GET - Get public categories (no authentication required)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const rootUserId = searchParams.get('rootUserId');

    // Validate rootUserId if provided
    if (rootUserId && !isValidRootUserId(rootUserId)) {
      return NextResponse.json(
        { error: 'Invalid root user ID' },
        { status: 400 }
      );
    }

    // Build query for public categories
    let query: any = { published: true };

    // Add root user filter if provided, otherwise use default
    if (rootUserId) {
      query.rootUserId = rootUserId;
    } else {
      // Use default root user filter
      const defaultFilter = createRootUserFilter();
      query.rootUserId = defaultFilter.rootUserId;
    }

    // If ID is provided, fetch specific category
    if (id) {
      query.$or = [{ _id: id }, { id: id }];
    }

    console.log('=== PUBLIC CATEGORIES API DEBUG ===');
    console.log('Root User ID:', rootUserId || 'default');
    console.log('Query:', JSON.stringify(query, null, 2));

    // Get categories
    const categories = await Category.find(query).sort({
      position: 1,
      createdAt: -1,
    });

    console.log('Categories returned:', categories.length);

    return NextResponse.json({
      categories,
      rootUserId: query.rootUserId,
    });
  } catch (error) {
    console.error('GET public categories error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
