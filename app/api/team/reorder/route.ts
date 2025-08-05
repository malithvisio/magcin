import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import { getUserContext } from '@/util/tenantContext';

export async function PUT(request: NextRequest) {
  try {
    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    const { teamMembers } = await request.json();

    // Validate input
    if (!Array.isArray(teamMembers)) {
      return NextResponse.json(
        { error: 'Team members array is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Update sortOrder for each team member with root user filtering
    const updatePromises = teamMembers.map((member: any, index: number) => {
      return Team.findOneAndUpdate(
        {
          _id: member._id,
          rootUserId: userContext.rootUserId, // Ensure only team members from this root user
        },
        { sortOrder: index + 1 },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    return NextResponse.json(
      { message: 'Team members reordered successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reorder team members error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
