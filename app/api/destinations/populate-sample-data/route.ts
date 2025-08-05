import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Destination from '@/models/Destination';
import { destinationPackages } from '@/data/destinations';
import type { Document } from 'mongoose';

// Define the Destination document interface
interface IDestination extends Document {
  id: string;
  name: string;
  images: string[];
  to_do: string;
  Highlight: string[];
  call_tagline: string;
  background: string;
  location: string;
  mini_description: string;
  description: string;
  moredes?: string;
  position: number;
  published: boolean;
  highlight: boolean;
  userId: string;
  rootUserId: string;
  companyId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const rootUserId = '68786e17d6e23d3a8ec0fe2f'; // Default root user ID
    const userId = '68786e17d6e23d3a8ec0fe2f'; // Default user ID
    const companyId = 'tours-trails-main'; // Default company ID
    const tenantId = 'tours-trails-main'; // Default tenant ID

    console.log('=== POPULATING DESTINATIONS SAMPLE DATA ===');
    console.log('Root User ID:', rootUserId);

    // Create destinations from sample data
    const createdDestinations: IDestination[] = [];
    for (const destData of destinationPackages) {
      const existingDestination = await Destination.findOne({
        id: destData.id,
        rootUserId: rootUserId,
      });

      if (!existingDestination) {
        const destination: IDestination = new Destination({
          ...destData,
          userId: userId,
          rootUserId: rootUserId,
          companyId: companyId,
          tenantId: tenantId,
          published: true,
          position: createdDestinations.length + 1,
        });
        await destination.save();
        createdDestinations.push(destination);
        console.log('Created destination:', destination.name);
      } else {
        createdDestinations.push(existingDestination);
        console.log('Destination already exists:', existingDestination.name);
      }
    }

    return NextResponse.json({
      message: 'Destinations sample data populated successfully',
      destinations: {
        created: createdDestinations.length,
        total: await Destination.countDocuments({ rootUserId }),
      },
    });
  } catch (error) {
    console.error('Error populating destinations sample data:', error);
    return NextResponse.json(
      { error: 'Failed to populate destinations sample data' },
      { status: 500 }
    );
  }
}
