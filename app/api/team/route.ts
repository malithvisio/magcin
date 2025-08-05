import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import {
  getUserContext,
  canCreateContent,
  incrementUsage,
} from '@/util/tenantContext';

// POST endpoint to create a new team member
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    console.log('=== TEAM CREATION DEBUG ===');
    console.log('User context:', {
      userId: userContext.userId,
      rootUserId: userContext.rootUserId,
      email: userContext.email,
    });
    console.log(
      'Request headers:',
      Object.fromEntries(request.headers.entries())
    );

    // Parse the request body properly
    let teamData;
    try {
      const rawBody = await request.text();
      console.log('Raw request body:', rawBody);

      teamData = JSON.parse(rawBody);
      console.log('Parsed team data:', teamData);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON data received' },
        { status: 400 }
      );
    }

    console.log('Raw team data received:', JSON.stringify(teamData, null, 2));

    // Check if this is a draft save
    const isDraft = teamData.isDraft === true;

    // Validate required fields if not saving as draft
    if (!isDraft) {
      console.log('=== VALIDATION DEBUG ===');
      console.log('Name:', teamData.name);
      console.log('Position:', teamData.position);
      console.log('Name type:', typeof teamData.name);
      console.log('Position type:', typeof teamData.position);

      // Validate required fields
      if (
        !teamData.name ||
        typeof teamData.name !== 'string' ||
        teamData.name.trim() === ''
      ) {
        console.log('Name validation failed');
        return NextResponse.json(
          { error: 'Name is required and cannot be empty' },
          { status: 400 }
        );
      }

      if (
        !teamData.position ||
        typeof teamData.position !== 'string' ||
        teamData.position.trim() === ''
      ) {
        console.log('Position validation failed');
        return NextResponse.json(
          { error: 'Position is required and cannot be empty' },
          { status: 400 }
        );
      }

      // Clean the data - trim whitespace but don't force default values
      teamData.name = teamData.name.trim();
      teamData.position = teamData.position.trim();

      // Handle image URL - only include if provided
      if (
        teamData.image &&
        typeof teamData.image === 'string' &&
        teamData.image.trim() !== ''
      ) {
        teamData.image = teamData.image.trim();
      } else {
        delete teamData.image; // Remove empty image field
      }

      console.log('=== CLEANED DATA ===');
      console.log('Final team data:', JSON.stringify(teamData, null, 2));
    }

    // Check quota (uncomment when ready to enable)
    /*
    const quotaCheck = await canCreateContent(
      userContext.rootUserId,
      'teamMembers'
    );
    if (!quotaCheck.canCreate) {
      return NextResponse.json(
        {
          error: `Team member limit reached. You can create ${quotaCheck.remaining} more team members. Please upgrade your subscription.`,
        },
        { status: 403 }
      );
    }
    */

    // Prepare team data with root user context
    const teamWithRootUser = {
      ...teamData,
      rootUserId: userContext.rootUserId,
      published: isDraft
        ? false
        : teamData.published !== undefined
          ? teamData.published
          : true,
    };

    // For draft saves, provide default values for required fields to avoid MongoDB validation errors
    if (isDraft) {
      const defaults = {
        name: teamData.name || 'Draft Team Member',
        position: teamData.position || 'Draft Position',
      };

      // Merge with provided data, keeping provided values over defaults
      Object.assign(teamWithRootUser, defaults);
    }

    console.log('=== SAVING TO DATABASE ===');
    console.log(
      'Team data with rootUserId:',
      JSON.stringify(teamWithRootUser, null, 2)
    );

    const newTeamMember = await Team.create(teamWithRootUser);

    console.log('=== TEAM MEMBER CREATED ===');
    console.log('New team member:', JSON.stringify(newTeamMember, null, 2));

    // Increment usage if not a draft (uncomment when ready to enable)
    /*
    if (!isDraft) {
      await incrementUsage(userContext.rootUserId, 'teamMembers');
    }
    */

    return NextResponse.json(
      {
        message: isDraft
          ? 'Team member saved as draft successfully'
          : 'Team member created successfully',
        teamMember: newTeamMember,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create team member error:', error);

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
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch all team members
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET TEAM MEMBERS DEBUG ===');
    console.log(
      'Request headers:',
      Object.fromEntries(request.headers.entries())
    );

    await connectDB();

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
      // If no authentication, return empty array (for public access)
      return NextResponse.json({ teamMembers: [] }, { status: 200 });
    }

    // Build query with root user filtering
    const query = { rootUserId: userContext.rootUserId };
    console.log('Team members query:', query);

    const teamMembers = await Team.find(query).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    console.log('Found team members:', teamMembers.length);

    return NextResponse.json({ teamMembers }, { status: 200 });
  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
