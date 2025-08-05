import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Gallery from '@/models/Gallery';
import { getUserContext } from '@/util/tenantContext';

// GET - Fetch all galleries
export async function GET(request: NextRequest) {
  try {
    console.log('Gallery API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);
    console.log('User context:', {
      userId: userContext.userId,
      companyId: userContext.companyId,
    });

    await connectToDatabase();

    // Fetch galleries for the current user
    const galleries = await Gallery.find({ rootUserId: userContext.userId })
      .sort({ position: 1, createdAt: -1 })
      .lean();

    console.log(`Found ${galleries.length} galleries`);

    return NextResponse.json({
      success: true,
      galleries,
    });
  } catch (error: any) {
    console.error('Error fetching galleries:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to fetch galleries: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST - Create a new gallery
export async function POST(request: NextRequest) {
  try {
    console.log('Create gallery API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);
    console.log('User context:', {
      userId: userContext.userId,
      companyId: userContext.companyId,
    });

    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Gallery name is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if gallery with same name already exists
    const existingGallery = await Gallery.findOne({
      rootUserId: userContext.userId,
      name: name.trim(),
    });

    if (existingGallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery with this name already exists' },
        { status: 400 }
      );
    }

    // Get the highest position number
    const lastGallery = await Gallery.findOne({
      rootUserId: userContext.userId,
    })
      .sort({ position: -1 })
      .select('position');

    const newPosition = (lastGallery?.position || 0) + 1;

    // Create new gallery
    const gallery = new Gallery({
      rootUserId: userContext.userId,
      name: name.trim(),
      description: description?.trim() || '',
      position: newPosition,
      images: [],
    });

    await gallery.save();

    console.log('Gallery created successfully:', gallery._id);

    return NextResponse.json({
      success: true,
      gallery,
    });
  } catch (error: any) {
    console.error('Error creating gallery:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to create gallery: ${error.message}` },
      { status: 500 }
    );
  }
}
