import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import { getUserContext } from '@/util/tenantContext';

// Migration endpoint to fix team members without rootUserId
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for authentication
    const userContext = await getUserContext(request);

    console.log('=== TEAM MIGRATION DEBUG ===');
    console.log('User context:', {
      userId: userContext.userId,
      rootUserId: userContext.rootUserId,
      email: userContext.email,
    });

    // Find all team members that don't have rootUserId set
    const orphanedTeamMembers = await Team.find({
      $or: [{ rootUserId: { $exists: false } }, { rootUserId: null }],
    });

    console.log('Found orphaned team members:', orphanedTeamMembers.length);

    if (orphanedTeamMembers.length > 0) {
      // Update all orphaned team members to have the current rootUserId
      const updateResult = await Team.updateMany(
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
        message: 'No orphaned team members found',
        migrated: 0,
        total: 0,
      });
    }
  } catch (error) {
    console.error('Team migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
