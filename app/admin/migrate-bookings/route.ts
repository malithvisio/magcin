import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { getUserContext } from '@/util/tenantContext';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get user context for authentication
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find bookings that don't have rootUserId
    const bookingsWithoutRootUserId = await Booking.find({
      $or: [
        { rootUserId: { $exists: false } },
        { rootUserId: null },
        { rootUserId: '' },
      ],
    });

    console.log(
      `Found ${bookingsWithoutRootUserId.length} bookings without rootUserId`
    );

    let updatedCount = 0;
    let skippedCount = 0;

    for (const booking of bookingsWithoutRootUserId) {
      try {
        // Try to find the user associated with this booking
        const user = await User.findById(booking.userId);

        if (user) {
          // Get the effective root user ID
          const rootUserId = user.getEffectiveRootUserId().toString();

          // Update the booking with rootUserId
          await Booking.findByIdAndUpdate(booking._id, {
            rootUserId: rootUserId,
          });

          updatedCount++;
          console.log(
            `Updated booking ${booking.bookingId} with rootUserId: ${rootUserId}`
          );
        } else {
          // If user not found, use the current user's rootUserId as fallback
          await Booking.findByIdAndUpdate(booking._id, {
            rootUserId: userContext.rootUserId,
          });

          updatedCount++;
          console.log(
            `Updated booking ${booking.bookingId} with fallback rootUserId: ${userContext.rootUserId}`
          );
        }
      } catch (error) {
        console.error(`Error updating booking ${booking.bookingId}:`, error);
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. Updated: ${updatedCount}, Skipped: ${skippedCount}`,
      totalBookings: bookingsWithoutRootUserId.length,
      updatedCount,
      skippedCount,
    });
  } catch (error) {
    console.error('Error during booking migration:', error);
    return NextResponse.json(
      { error: 'Failed to migrate bookings' },
      { status: 500 }
    );
  }
}
