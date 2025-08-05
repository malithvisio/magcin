import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Gallery from '@/models/Gallery';
import { getUserContext } from '@/util/tenantContext';
import { ObjectId } from 'mongodb';

// GET - Fetch a specific gallery
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Get gallery API called for ID:', params.id);

    // Get user context for authentication
    const userContext = await getUserContext(request);

    await connectToDatabase();

    // Fetch the specific gallery
    const gallery = await Gallery.findOne({
      _id: new ObjectId(params.id),
      rootUserId: userContext.userId,
    }).lean();

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      gallery,
    });
  } catch (error: any) {
    console.error('Error fetching gallery:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to fetch gallery: ${error.message}` },
      { status: 500 }
    );
  }
}

// PUT - Update a gallery
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Update gallery API called for ID:', params.id);

    // Get user context for authentication
    const userContext = await getUserContext(request);

    const body = await request.json();
    const { name, description, published, position, images } = body;

    await connectToDatabase();

    // Check if gallery exists and belongs to user
    const existingGallery = await Gallery.findOne({
      _id: new ObjectId(params.id),
      rootUserId: userContext.userId,
    });

    if (!existingGallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery not found' },
        { status: 404 }
      );
    }

    // Check if name is being changed and if it conflicts with another gallery
    if (name && name.trim() !== existingGallery.name) {
      const nameConflict = await Gallery.findOne({
        rootUserId: userContext.userId,
        name: name.trim(),
        _id: { $ne: new ObjectId(params.id) },
      });

      if (nameConflict) {
        return NextResponse.json(
          { success: false, error: 'Gallery with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Update gallery
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || '';
    if (published !== undefined) updateData.published = published;
    if (position !== undefined) updateData.position = position;
    if (images !== undefined) updateData.images = images;

    const updatedGallery = await Gallery.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Gallery updated successfully');

    return NextResponse.json({
      success: true,
      gallery: updatedGallery,
    });
  } catch (error: any) {
    console.error('Error updating gallery:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to update gallery: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete a gallery
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Delete gallery API called for ID:', params.id);

    // Get user context for authentication
    const userContext = await getUserContext(request);

    await connectToDatabase();

    // Check if gallery exists and belongs to user
    const gallery = await Gallery.findOne({
      _id: new ObjectId(params.id),
      rootUserId: userContext.userId,
    });

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery not found' },
        { status: 404 }
      );
    }

    // Delete the gallery
    await Gallery.findByIdAndDelete(params.id);

    console.log('Gallery deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Gallery deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting gallery:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to delete gallery: ${error.message}` },
      { status: 500 }
    );
  }
}
