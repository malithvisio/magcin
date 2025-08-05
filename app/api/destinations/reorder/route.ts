import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Destination from '@/models/Destination';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { destinationIds } = await request.json();

    if (!destinationIds || !Array.isArray(destinationIds)) {
      return NextResponse.json(
        { error: 'Destination IDs array is required' },
        { status: 400 }
      );
    }

    // Update the order of destinations by setting a position field
    const updatePromises = destinationIds.map(
      (destinationId: string, index: number) => {
        return Destination.findByIdAndUpdate(
          destinationId,
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

    // Fetch the updated destinations in the new order
    const updatedDestinations = await Destination.find({})
      .sort({ position: 1, createdAt: -1 })
      .select('name _id position');

    return NextResponse.json(
      {
        success: true,
        destinations: updatedDestinations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reorder destinations error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder destinations' },
      { status: 500 }
    );
  }
}
