import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';
import {
  createRootUserFilter,
  isValidRootUserId,
} from '@/util/root-user-config';

// GET - Get public activities (no authentication required)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const id = searchParams.get('id');
    const rootUserId = searchParams.get('rootUserId');

    console.log('=== PUBLIC ACTIVITIES API DEBUG ===');
    console.log('Requested ID:', id);
    console.log('Root User ID:', rootUserId || 'default');

    // Validate rootUserId if provided
    if (rootUserId && !isValidRootUserId(rootUserId)) {
      return NextResponse.json(
        { error: 'Invalid root user ID' },
        { status: 400 }
      );
    }

    // Build query for public activities
    let query: any = { published: true };

    // Add root user filter if provided, otherwise use default
    if (rootUserId) {
      query.rootUserId = rootUserId;
    } else {
      // Use default root user filter
      const defaultFilter = createRootUserFilter();
      query.rootUserId = defaultFilter.rootUserId;
    }

    // If ID is provided, fetch specific activity
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
      // Add search filter only if not fetching by ID
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
    }

    console.log('Final Query:', JSON.stringify(query, null, 2));

    // Get total count
    const total = await Activity.countDocuments(query);
    console.log('Total activities found:', total);

    // Get activities with pagination
    const activities = await Activity.find(query)
      .sort({ position: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('Activities returned:', activities.length);
    if (activities.length > 0) {
      console.log('First activity:', {
        _id: activities[0]._id,
        name: activities[0].name,
        title: activities[0].title,
      });
    }

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      rootUserId: query.rootUserId,
    });
  } catch (error) {
    console.error('GET public activities error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch activities',
      },
      { status: 500 }
    );
  }
}
