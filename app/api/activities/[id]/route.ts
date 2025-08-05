import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';
import {
  getUserContext,
  createTenantFilter,
  decrementUsage,
} from '@/util/tenantContext';
import { deleteFile, extractStoragePath } from '@/util/firebase-storage';

// GET - Fetch single activity by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return 404 (for security)
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Find activity with root user filtering
    const activity = await Activity.findOne({
      _id: params.id,
      $or: [
        { rootUserId: userContext.rootUserId },
        {
          userId: userContext.userId,
          companyId: userContext.companyId,
          rootUserId: { $exists: false },
        },
      ],
    }).lean();

    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      activity: activity,
    });
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

// PUT - Update activity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);
    const data = await request.json();

    // Debug logging
    console.log('PUT request data:', {
      activityId: params.id,
      data: data,
      hasInsideImages: !!data.insideImages,
      insideImagesLength: data.insideImages?.length || 0,
    });

    // Get the current activity to check for old images
    const currentActivity = await Activity.findOne({
      _id: params.id,
      $or: [
        { rootUserId: userContext.rootUserId },
        {
          userId: userContext.userId,
          companyId: userContext.companyId,
          rootUserId: { $exists: false },
        },
      ],
    });

    if (!currentActivity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if images are being updated and delete old ones from Firebase Storage
    if (data.imageUrl && data.imageUrl !== currentActivity.imageUrl) {
      const oldPath = extractStoragePath(currentActivity.imageUrl);
      if (oldPath) {
        await deleteFile(oldPath);
      }
    }

    if (
      data.insideImageUrl &&
      data.insideImageUrl !== currentActivity.insideImageUrl
    ) {
      const oldPath = extractStoragePath(currentActivity.insideImageUrl);
      if (oldPath) {
        await deleteFile(oldPath);
      }
    }

    // Find and update activity with root user filtering
    const updatedActivity = await Activity.findOneAndUpdate(
      {
        _id: params.id,
        $or: [
          { rootUserId: userContext.rootUserId },
          {
            userId: userContext.userId,
            companyId: userContext.companyId,
            rootUserId: { $exists: false },
          },
        ],
      },
      data,
      { new: true, runValidators: true }
    );

    if (!updatedActivity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Debug logging after update
    console.log('Activity updated successfully:', {
      activityId: params.id,
      updatedInsideImages: updatedActivity.insideImages,
      insideImagesLength: updatedActivity.insideImages?.length || 0,
    });

    return NextResponse.json({
      success: true,
      activity: updatedActivity,
      message: 'Activity updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating activity:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationErrors.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Handle authentication errors
    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// DELETE - Delete activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Find and delete activity with root user filtering
    const deletedActivity = await Activity.findOneAndDelete({
      _id: params.id,
      $or: [
        { rootUserId: userContext.rootUserId },
        {
          userId: userContext.userId,
          companyId: userContext.companyId,
          rootUserId: { $exists: false },
        },
      ],
    });

    if (!deletedActivity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Delete associated images from Firebase Storage
    if (deletedActivity.imageUrl) {
      const imagePath = extractStoragePath(deletedActivity.imageUrl);
      if (imagePath) {
        await deleteFile(imagePath);
      }
    }

    if (deletedActivity.insideImageUrl) {
      const insideImagePath = extractStoragePath(
        deletedActivity.insideImageUrl
      );
      if (insideImagePath) {
        await deleteFile(insideImagePath);
      }
    }

    // Delete multiple inside images
    if (
      deletedActivity.insideImages &&
      deletedActivity.insideImages.length > 0
    ) {
      const deletePromises = deletedActivity.insideImages.map(
        async (image: any) => {
          if (image.path) {
            await deleteFile(image.path);
          }
        }
      );
      await Promise.all(deletePromises);
    }

    // Decrement usage if activity was published
    if (deletedActivity.published) {
      await decrementUsage(userContext.userId, 'activities');
    }

    return NextResponse.json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting activity:', error);

    // Handle authentication errors
    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
