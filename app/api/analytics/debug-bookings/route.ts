import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking, { IBookingStats } from '@/models/Booking';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get all bookings to see what's in the database
    const allBookings = await Booking.find({}).lean();

    // Get stats for different company IDs
    const defaultCompanyStats = await (Booking as any).getStatsByCompany(
      'default-company'
    );

    // Try to get stats for any company ID that exists
    const uniqueCompanyIds = await Booking.distinct('companyId');

    const statsByCompany: Record<string, IBookingStats> = {};
    for (const companyId of uniqueCompanyIds) {
      statsByCompany[companyId] = await (Booking as any).getStatsByCompany(
        companyId
      );
    }

    return NextResponse.json({
      totalBookings: allBookings.length,
      allBookings: allBookings.slice(0, 5), // Show first 5 bookings
      uniqueCompanyIds,
      defaultCompanyStats,
      statsByCompany,
    });
  } catch (error) {
    console.error('Error debugging bookings:', error);
    return NextResponse.json(
      {
        error: 'Failed to debug bookings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
