import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Clear existing test bookings
    await Booking.deleteMany({ customerName: { $regex: /^Test Customer/ } });

    // Create test bookings with different statuses
    const testBookings = [
      {
        userId: new mongoose.Types.ObjectId(),
        companyId: 'default-company',
        tenantId: 'default-tenant',
        bookingId: 'BK' + Date.now() + '001',
        customerName: 'Test Customer 1',
        customerEmail: 'test1@example.com',
        customerPhone: '+1234567890',
        packageName: 'Ella Adventure Package',
        packagePrice: 1500,
        numberOfPeople: 2,
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-03-18'),
        totalAmount: 1500,
        status: 'confirmed',
        paymentStatus: 'paid',
        specialRequirements: 'Vegetarian meals preferred',
        createdAt: new Date('2024-03-10'),
      },
      {
        userId: new mongoose.Types.ObjectId(),
        companyId: 'default-company',
        tenantId: 'default-tenant',
        bookingId: 'BK' + Date.now() + '002',
        customerName: 'Test Customer 2',
        customerEmail: 'test2@example.com',
        customerPhone: '+1234567891',
        packageName: 'Kandy Cultural Tour',
        packagePrice: 1200,
        numberOfPeople: 4,
        startDate: new Date('2024-03-20'),
        endDate: new Date('2024-03-22'),
        totalAmount: 1200,
        status: 'pending',
        paymentStatus: 'pending',
        specialRequirements: 'Wheelchair accessible',
        createdAt: new Date('2024-03-12'),
      },
      {
        userId: new mongoose.Types.ObjectId(),
        companyId: 'default-company',
        tenantId: 'default-tenant',
        bookingId: 'BK' + Date.now() + '003',
        customerName: 'Test Customer 3',
        customerEmail: 'test3@example.com',
        customerPhone: '+1234567892',
        packageName: 'Sigiriya Heritage Tour',
        packagePrice: 2000,
        numberOfPeople: 3,
        startDate: new Date('2024-03-25'),
        endDate: new Date('2024-03-28'),
        totalAmount: 2000,
        status: 'completed',
        paymentStatus: 'paid',
        specialRequirements: 'Photography tour',
        createdAt: new Date('2024-03-08'),
      },
      {
        userId: new mongoose.Types.ObjectId(),
        companyId: 'default-company',
        tenantId: 'default-tenant',
        bookingId: 'BK' + Date.now() + '004',
        customerName: 'Test Customer 4',
        customerEmail: 'test4@example.com',
        customerPhone: '+1234567893',
        packageName: 'Galle Fort Walk',
        packagePrice: 800,
        numberOfPeople: 2,
        startDate: new Date('2024-03-30'),
        endDate: new Date('2024-04-01'),
        totalAmount: 800,
        status: 'cancelled',
        paymentStatus: 'refunded',
        specialRequirements: 'Evening tour',
        createdAt: new Date('2024-03-05'),
      },
      {
        userId: new mongoose.Types.ObjectId(),
        companyId: 'default-company',
        tenantId: 'default-tenant',
        bookingId: 'BK' + Date.now() + '005',
        customerName: 'Test Customer 5',
        customerEmail: 'test5@example.com',
        customerPhone: '+1234567894',
        packageName: 'Nuwara Eliya Tea Tour',
        packagePrice: 1800,
        numberOfPeople: 5,
        startDate: new Date('2024-04-05'),
        endDate: new Date('2024-04-08'),
        totalAmount: 1800,
        status: 'confirmed',
        paymentStatus: 'paid',
        specialRequirements: 'Tea tasting included',
        createdAt: new Date('2024-03-14'),
      },
    ];

    const savedBookings = await Booking.insertMany(testBookings);

    return NextResponse.json({
      success: true,
      message: `Created ${savedBookings.length} test bookings`,
      bookings: savedBookings,
    });
  } catch (error) {
    console.error('Error creating test bookings:', error);
    return NextResponse.json(
      {
        error: 'Failed to create test bookings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
