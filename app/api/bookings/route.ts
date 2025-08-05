import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

// GET - Fetch all bookings for the current user/tenant
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build query based on filters (for now, get all bookings)
    let query: any = {};

    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { packageName: { $regex: search, $options: 'i' } },
        { bookingId: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch bookings with pagination
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    console.log('Starting booking creation...');
    await connectToDatabase();
    console.log('Database connected successfully');

    const body = await request.json();
    console.log('Request body:', body);

    const {
      packageName,
      checkin,
      checkout,
      guests,
      firstName,
      lastName,
      contactNumber,
      email,
      message,
    } = body;

    // Validate required fields
    if (
      !packageName ||
      !checkin ||
      !checkout ||
      !guests ||
      !firstName ||
      !lastName ||
      !contactNumber ||
      !email
    ) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Validation passed, creating booking...');

    // Generate unique booking ID
    const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create new booking (using default values for multi-tenant fields)
    const bookingData = {
      userId: new mongoose.Types.ObjectId(), // Generate new ObjectId
      companyId: 'default-company',
      tenantId: 'default-tenant',
      bookingId,
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      customerPhone: contactNumber,
      packageId: new mongoose.Types.ObjectId(), // Generate new ObjectId for package
      packageName,
      packagePrice: 0, // Default price, would be calculated based on package
      numberOfPeople: parseInt(guests),
      startDate: new Date(checkin),
      endDate: new Date(checkout),
      specialRequirements: message || '',
      status: 'pending',
      paymentStatus: 'pending',
      totalAmount: 0, // This would be calculated based on package price
    };

    console.log('Booking data to save:', bookingData);

    let savedBooking;
    try {
      const booking = new Booking(bookingData);
      console.log('Booking model created, saving...');

      savedBooking = await booking.save();
      console.log('Booking saved successfully:', savedBooking._id);
    } catch (saveError) {
      console.error('Error saving booking:', saveError);
      const errorMessage =
        saveError instanceof Error ? saveError.message : 'Unknown error';
      return NextResponse.json(
        { error: `Failed to save booking: ${errorMessage}` },
        { status: 500 }
      );
    }

    // Send WhatsApp message (existing functionality)
    const whatsappMessage = `
      🧳 *New Booking Received*:
      
      - Booking ID: ${bookingId}
      - Tour Package: ${packageName}
      - Check-in: ${checkin}
      - Check-out: ${checkout}
      - Guests: ${guests}
      - Name: ${firstName} ${lastName}
      - Contact: ${contactNumber}
      - Email: ${email}
      - Message: ${message || 'No message'}
    `;

    const phoneNumber = '94761578032';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    return NextResponse.json({
      success: true,
      booking: savedBooking,
      whatsappURL,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
