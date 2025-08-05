import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import { getUserContext, decrementUsage } from '@/util/tenantContext';

// DELETE endpoint to delete a team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Connect to database
    await connectDB();

    // Find and delete team member with root user filtering
    const deletedTeamMember = await Team.findOneAndDelete({
      _id: id,
      rootUserId: userContext.rootUserId,
    });

    if (!deletedTeamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Decrement usage if team member was published
    if (deletedTeamMember.published) {
      await decrementUsage(userContext.rootUserId, 'teamMembers');
    }

    return NextResponse.json({
      message: 'Team member deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete team member error:', error);

    // Handle authentication errors
    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch a single team member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('=== GET TEAM MEMBER DEBUG ===');
    console.log('Team member ID:', id);
    console.log(
      'Request headers:',
      Object.fromEntries(request.headers.entries())
    );

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
      console.log('User context obtained:', {
        userId: userContext.userId,
        rootUserId: userContext.rootUserId,
        email: userContext.email,
      });
    } catch (error) {
      console.error('Authentication error:', error);
      // If no authentication, return 404 (for security)
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Connect to database
    await connectDB();

    console.log('Searching for team member with criteria:', {
      _id: id,
      rootUserId: userContext.rootUserId,
    });

    // Find the team member with root user filtering
    const teamMember = await Team.findOne({
      _id: id,
      rootUserId: userContext.rootUserId,
    });

    console.log('Database query result:', teamMember ? 'Found' : 'Not found');

    if (!teamMember) {
      console.log('Team member not found in database');
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ teamMember }, { status: 200 });
  } catch (error) {
    console.error('Get team member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a team member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Connect to database
    await connectDB();

    // Parse the request body
    const updateData = await request.json();

    // Find and update team member with root user filtering
    const updatedTeamMember = await Team.findOneAndUpdate(
      {
        _id: id,
        rootUserId: userContext.rootUserId,
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTeamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Team member updated successfully',
      teamMember: updatedTeamMember,
    });
  } catch (error: any) {
    console.error('Update team member error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: `Validation error: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }

    // Handle authentication errors
    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}
