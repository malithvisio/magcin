import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import { getUserContext } from '@/util/tenantContext';

// Migration endpoint to fix packages without rootUserId
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for authentication
    const userContext = await getUserContext(request);

    console.log('=== PACKAGE MIGRATION DEBUG ===');
    console.log('User context:', {
      userId: userContext.userId,
      rootUserId: userContext.rootUserId,
      email: userContext.email,
    });

    // Find all packages that don't have rootUserId set
    const orphanedPackages = await Package.find({
      $or: [{ rootUserId: { $exists: false } }, { rootUserId: null }],
    });

    console.log('Found orphaned packages:', orphanedPackages.length);

    if (orphanedPackages.length > 0) {
      // Update all orphaned packages to have the current rootUserId
      const updateResult = await Package.updateMany(
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
        message: 'No orphaned packages found',
        migrated: 0,
        total: 0,
      });
    }
  } catch (error) {
    console.error('Package migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
