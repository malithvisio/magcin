import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

// GET - Fetch all published galleries for a specific root user
export async function GET(request: NextRequest) {
  try {
    console.log('Public gallery API called');

    await connectToDatabase();

    // Get rootUserId from query parameters
    const { searchParams } = new URL(request.url);
    const rootUserId = searchParams.get('rootUserId');

    if (!rootUserId) {
      return NextResponse.json(
        { success: false, error: 'Root User ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching galleries for rootUserId: ${rootUserId}`);

    // Fetch published galleries for the specific root user
    const galleries = await Gallery.find({
      published: true,
      rootUserId: rootUserId,
    })
      .sort({ position: 1, createdAt: -1 })
      .select('name description images')
      .lean();

    console.log(
      `Found ${galleries.length} published galleries for rootUserId: ${rootUserId}`
    );

    return NextResponse.json({
      success: true,
      galleries,
    });
  } catch (error: any) {
    console.error('Error fetching public galleries:', error);

    return NextResponse.json(
      { success: false, error: `Failed to fetch galleries: ${error.message}` },
      { status: 500 }
    );
  }
}
