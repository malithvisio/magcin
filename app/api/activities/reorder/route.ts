import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { activityIds } = await request.json();

    if (!activityIds || !Array.isArray(activityIds)) {
      return NextResponse.json(
        { error: 'Activity IDs array is required' },
        { status: 400 }
      );
    }

    // Update the order of activities by setting a position field
    const updatePromises = activityIds.map(
      (activityId: string, index: number) => {
        return Activity.findByIdAndUpdate(
          activityId,
          {
            $set: {
              position: index,
              updatedAt: new Date(),
            },
          },
          { new: true }
        );
      }
    );

    await Promise.all(updatePromises);

    // Fetch the updated activities in the new order
    const updatedActivities = await Activity.find({})
      .sort({ position: 1, createdAt: -1 })
      .select('name published position _id');

    return NextResponse.json(
      {
        success: true,
        activities: updatedActivities,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reorder activities error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder activities' },
      { status: 500 }
    );
  }
}
