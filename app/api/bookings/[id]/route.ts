import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET - Fetch a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const booking = await Booking.findOne({
      _id: params.id,
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT - Update a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      packageName,
      startDate,
      endDate,
      numberOfPeople,
      totalAmount,
      status,
      paymentStatus,
      specialRequirements,
      adminNotes,
      paymentMethod,
      transactionId,
    } = body;

    // Find and update the booking
    const booking = await Booking.findOneAndUpdate(
      {
        _id: params.id,
      },
      {
        ...(customerName && { customerName }),
        ...(customerEmail && { customerEmail }),
        ...(customerPhone !== undefined && { customerPhone }),
        ...(packageName && { packageName }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(numberOfPeople !== undefined && { numberOfPeople }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(specialRequirements !== undefined && { specialRequirements }),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(paymentMethod && { paymentMethod }),
        ...(transactionId && { transactionId }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const booking = await Booking.findOneAndDelete({
      _id: params.id,
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
