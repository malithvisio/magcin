import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Gallery from '@/models/Gallery';
import { getUserContext } from '@/util/tenantContext';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    console.log('Gallery reorder API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);

    const body = await request.json();
    const { galleryId, images } = body;

    if (!galleryId) {
      return NextResponse.json(
        { success: false, error: 'Gallery ID is required' },
        { status: 400 }
      );
    }

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { success: false, error: 'Images array is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if gallery exists and belongs to user
    const gallery = await Gallery.findOne({
      _id: new ObjectId(galleryId),
      rootUserId: userContext.userId,
    });

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery not found' },
        { status: 404 }
      );
    }

    // Update image orders
    const updatedImages = images.map((image: any, index: number) => ({
      ...image,
      order: index + 1,
    }));

    // Update gallery with new image order
    gallery.images = updatedImages;
    await gallery.save();

    console.log('Gallery image order updated successfully');

    return NextResponse.json({
      success: true,
      gallery,
    });
  } catch (error: any) {
    console.error('Error reordering gallery images:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to reorder images: ${error.message}` },
      { status: 500 }
    );
  }
}
