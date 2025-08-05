import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Destination from '@/models/Destination';
import {
  createRootUserFilter,
  isValidRootUserId,
} from '@/util/root-user-config';

// GET - Get public destinations (no authentication required)
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

    // Validate rootUserId if provided
    if (rootUserId && !isValidRootUserId(rootUserId)) {
      return NextResponse.json(
        { error: 'Invalid root user ID' },
        { status: 400 }
      );
    }

    // Build query for public destinations
    let query: any = { published: true };

    // Add root user filter if provided, otherwise use default
    if (rootUserId) {
      query.rootUserId = rootUserId;
    } else {
      // Use default root user ID directly (avoiding localStorage access on server)
      query.rootUserId = '68786e17d6e23d3a8ec0fe2f'; // Default root user ID
    }

    // If ID is provided, fetch specific destination
    if (id) {
      // For specific ID lookup, try multiple fields and don't require rootUserId
      // Check if the ID is a valid ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

      if (isValidObjectId) {
        query = {
          published: true,
          $or: [{ _id: id }, { id: id }],
        };
      } else {
        // If not a valid ObjectId, search by string ID only
        query = {
          published: true,
          id: id,
        };
      }
    } else {
      // Add root user filter for list queries
      if (rootUserId) {
        query.rootUserId = rootUserId;
      } else {
        // Use default root user ID directly (avoiding localStorage access on server)
        query.rootUserId = '68786e17d6e23d3a8ec0fe2f'; // Default root user ID
      }

      // Add search filter only if not fetching by ID
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
    }

    console.log('=== PUBLIC DESTINATIONS API DEBUG ===');
    console.log('ID parameter:', id);
    console.log('Root User ID:', rootUserId || 'default');
    console.log('Query:', JSON.stringify(query, null, 2));

    // Get total count
    const total = await Destination.countDocuments(query);
    console.log('Total destinations found:', total);

    // Get destinations with pagination
    const destinations = await Destination.find(query)
      .sort({ position: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('Destinations returned:', destinations.length);

    return NextResponse.json({
      destinations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      rootUserId: query.rootUserId,
    });
  } catch (error) {
    console.error('GET public destinations error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch destinations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
