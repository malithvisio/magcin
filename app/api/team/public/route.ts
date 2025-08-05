import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';

// GET endpoint to fetch published team members for public access
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET PUBLIC TEAM MEMBERS DEBUG ===');

    await connectDB();

    // Get rootUserId from query parameters for multi-tenant filtering
    const { searchParams } = new URL(request.url);
    const rootUserId = searchParams.get('rootUserId');

    console.log('Root User ID from query:', rootUserId);

    if (!rootUserId) {
      console.log('No rootUserId provided, returning empty array');
      return NextResponse.json({ teamMembers: [] }, { status: 200 });
    }

    // Build query to find published team members for the specific root user
    const query = {
      rootUserId: rootUserId,
      published: true,
    };

    console.log('Public team members query:', query);

    const teamMembers = await Team.find(query).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    console.log('Found public team members:', teamMembers.length);

    return NextResponse.json({ teamMembers }, { status: 200 });
  } catch (error) {
    console.error('Get public team members error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
