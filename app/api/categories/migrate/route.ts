import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { getUserContext } from '@/util/tenantContext';

// Migration endpoint to fix categories without rootUserId
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for authentication
    const userContext = await getUserContext(request);

    console.log('=== CATEGORY MIGRATION DEBUG ===');
    console.log('User context:', {
      userId: userContext.userId,
      rootUserId: userContext.rootUserId,
      email: userContext.email,
    });

    // Find all categories that don't have rootUserId set
    const orphanedCategories = await Category.find({
      $or: [{ rootUserId: { $exists: false } }, { rootUserId: null }],
    });

    console.log('Found orphaned categories:', orphanedCategories.length);

    if (orphanedCategories.length > 0) {
      // Update all orphaned categories to have the current rootUserId
      const updateResult = await Category.updateMany(
        {
          $or: [{ rootUserId: { $exists: false } }, { rootUserId: null }],
        },
        {
          $set: { rootUserId: userContext.rootUserId },
        }
      );

      console.log('Migration completed:', {
        matched: updateResult.matchedCount,
        modified: updateResult.modifiedCount,
      });

      return NextResponse.json({
        message: 'Migration completed successfully',
        migrated: updateResult.modifiedCount,
        total: updateResult.matchedCount,
      });
    } else {
      return NextResponse.json({
        message: 'No orphaned categories found',
        migrated: 0,
        total: 0,
      });
    }
  } catch (error) {
    console.error('Category migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
