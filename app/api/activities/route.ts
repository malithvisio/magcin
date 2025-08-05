import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';
import {
  getUserContext,
  canCreateContent,
  incrementUsage,
  createRootUserFilter,
} from '@/util/tenantContext';

// GET - Fetch all activities
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return empty array (for public access)
      return NextResponse.json({ activities: [] }, { status: 200 });
    }

    // Build query to include both activities with rootUserId and those without it (for migration)
    const baseQuery = {
      $or: [
        { rootUserId: userContext.rootUserId },
        {
          userId: userContext.userId,
          companyId: userContext.companyId,
          rootUserId: { $exists: false },
        },
      ],
    };

    // First, ensure all activities have a position field and rootUserId
    const activitiesWithoutPosition = await Activity.find({
      ...baseQuery,
      position: { $exists: false },
    });

    const activitiesWithoutRootUserId = await Activity.find({
      userId: userContext.userId,
      companyId: userContext.companyId,
      rootUserId: { $exists: false },
    });

    if (activitiesWithoutPosition.length > 0) {
      // Get the highest position number
      const lastActivity = await Activity.findOne({
        rootUserId: userContext.rootUserId,
      }).sort({ position: -1 });
      let nextPosition = lastActivity ? lastActivity.position + 1 : 0;

      // Update activities without position
      for (const activity of activitiesWithoutPosition) {
        await Activity.findByIdAndUpdate(activity._id, {
          position: nextPosition,
        });
        nextPosition++;
      }
    }

    // Update activities without rootUserId
    if (activitiesWithoutRootUserId.length > 0) {
      for (const activity of activitiesWithoutRootUserId) {
        await Activity.findByIdAndUpdate(activity._id, {
          rootUserId: userContext.rootUserId,
        });
      }
    }

    const activities = await Activity.find(baseQuery)
      .sort({ position: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      activities: activities,
    });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST - Create new activity
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Check if user can create more activities
    const quotaCheck = await canCreateContent(
      userContext.rootUserId,
      'activities'
    );
    if (!quotaCheck.canCreate) {
      return NextResponse.json(
        {
          success: false,
          error: `Activity limit reached. You can create ${quotaCheck.remaining} more activities. Please upgrade your subscription.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, published = true } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Activity name is required' },
        { status: 400 }
      );
    }

    // Check if activity with same name already exists for this root user
    const existingActivity = await Activity.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      rootUserId: userContext.rootUserId,
    });

    if (existingActivity) {
      return NextResponse.json(
        { success: false, error: 'Activity with this name already exists' },
        { status: 400 }
      );
    }

    // Get the highest position number for this root user
    const lastActivity = await Activity.findOne({
      rootUserId: userContext.rootUserId,
    }).sort({ position: -1 });
    const newPosition = lastActivity ? lastActivity.position + 1 : 0;

    // Create new activity with root user context
    const newActivity = new Activity({
      name: name.trim(),
      published,
      position: newPosition,
      userId: userContext.userId,
      rootUserId: userContext.rootUserId,
      companyId: userContext.companyId,
      tenantId: userContext.tenantId,
    });

    const savedActivity = await newActivity.save();

    // Increment usage if published
    if (published) {
      await incrementUsage(userContext.rootUserId, 'activities');
    }

    return NextResponse.json({
      success: true,
      activity: savedActivity,
      message: 'Activity created successfully',
    });
  } catch (error: any) {
    console.error('Error creating activity:', error);

    // Handle authentication errors
    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
