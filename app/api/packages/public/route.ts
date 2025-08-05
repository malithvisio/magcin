import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import {
  createRootUserFilter,
  isValidRootUserId,
} from '@/util/root-user-config';

// GET - Get public packages (no authentication required)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const id = searchParams.get('id');
    const rootUserId = searchParams.get('rootUserId');

    console.log('=== PUBLIC PACKAGES API DEBUG ===');
    console.log('Requested ID:', id);
    console.log('Root User ID:', rootUserId || 'default');

    // Validate rootUserId if provided
    if (rootUserId && !isValidRootUserId(rootUserId)) {
      return NextResponse.json(
        { error: 'Invalid root user ID' },
        { status: 400 }
      );
    }

    // Build query for public packages
    let query: any = { published: true };

    // Add root user filter if provided, otherwise use default
    if (rootUserId) {
      query.rootUserId = rootUserId;
    } else {
      // Use default root user filter
      const defaultFilter = createRootUserFilter();
      query.rootUserId = defaultFilter.rootUserId;
    }

    // If ID is provided, fetch specific package
    if (id) {
      // Check if the ID looks like a MongoDB ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

      if (isObjectId) {
        // It's a valid ObjectId, search by _id
        query.$or = [{ _id: id }, { id: id }];
      } else {
        // It's not a valid ObjectId, search by id field only
        query.id = id;
      }
    } else {
      // Add category filter only if not fetching by ID
      if (category && category !== 'All') {
        query.category = category;
      }

      // Add search filter only if not fetching by ID
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }
    }

    console.log('Final Query:', JSON.stringify(query, null, 2));

    // Get total count
    const total = await Package.countDocuments(query);
    console.log('Total packages found:', total);

    // Get packages with pagination and populate category
    const packages = await Package.find(query)
      .populate('category', 'name') // Populate category with name field
      .sort({ position: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('Packages returned:', packages.length);
    if (packages.length > 0) {
      console.log('First package:', {
        _id: packages[0]._id,
        id: packages[0].id,
        name: packages[0].name,
        title: packages[0].title,
      });
    }

    return NextResponse.json({
      packages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      rootUserId: query.rootUserId,
    });
  } catch (error) {
    console.error('GET public packages error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch packages',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
