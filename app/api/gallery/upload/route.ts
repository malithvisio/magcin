import { NextRequest, NextResponse } from 'next/server';
import {
  uploadFile,
  deleteFile,
  extractStoragePath,
} from '@/util/firebase-storage';
import { getUserContext } from '@/util/tenantContext';
import { connectToDatabase } from '@/lib/mongodb';
import Gallery from '@/models/Gallery';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    console.log('Gallery upload API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);
    console.log('User context:', {
      userId: userContext.userId,
      companyId: userContext.companyId,
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const galleryId = formData.get('galleryId') as string;
    const topic = formData.get('topic') as string;
    const altText = formData.get('altText') as string;

    console.log('Form data:', {
      hasFile: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      galleryId,
      topic,
      altText,
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!galleryId) {
      return NextResponse.json(
        { success: false, error: 'Gallery ID is required' },
        { status: 400 }
      );
    }

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: 'Image topic is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 5MB.' },
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

    // Upload image to Firebase Storage
    const path = `gallery/${galleryId}/`;
    console.log('Uploading to path:', path);

    const result = await uploadFile(file, path);
    console.log('Upload successful:', { url: result.url, path: result.path });

    // Get the highest order number for this gallery
    const maxOrder =
      gallery.images.length > 0
        ? Math.max(...gallery.images.map((img: any) => img.order))
        : 0;

    // Create image object
    const newImage = {
      url: result.url,
      path: result.path,
      alt: altText?.trim() || file.name.replace(/\.[^/.]+$/, ''),
      topic: topic.trim(),
      order: maxOrder + 1,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploaded: true,
    };

    // Add image to gallery
    gallery.images.push(newImage);
    await gallery.save();

    console.log('Image added to gallery successfully');

    return NextResponse.json({
      success: true,
      image: newImage,
      gallery,
    });
  } catch (error: any) {
    console.error('Error uploading gallery image:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to upload image: ${error.message}` },
      { status: 500 }
    );
  }
}

// PUT - Update image metadata
export async function PUT(request: NextRequest) {
  try {
    console.log('Update gallery image API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);

    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('galleryId');
    const imagePath = searchParams.get('imagePath');

    if (!galleryId || !imagePath) {
      return NextResponse.json(
        { success: false, error: 'Gallery ID and image path are required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { topic, altText } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: 'Image topic is required' },
        { status: 400 }
      );
    }

    console.log('Updating image:', {
      galleryId,
      imagePath,
      topic,
      altText,
    });

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

    // Find and update the image
    const imageIndex = gallery.images.findIndex(
      (img: any) => img.path === imagePath
    );
    if (imageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Image not found in gallery' },
        { status: 404 }
      );
    }

    // Update image metadata
    gallery.images[imageIndex].topic = topic.trim();
    gallery.images[imageIndex].alt =
      altText?.trim() || gallery.images[imageIndex].alt;

    await gallery.save();

    console.log('Image updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Image updated successfully',
      image: gallery.images[imageIndex],
      gallery,
    });
  } catch (error: any) {
    console.error('Error updating gallery image:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to update image: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Remove image from gallery
export async function DELETE(request: NextRequest) {
  try {
    console.log('Delete gallery image API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);

    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('galleryId');
    const imagePath = searchParams.get('imagePath');

    if (!galleryId || !imagePath) {
      return NextResponse.json(
        { success: false, error: 'Gallery ID and image path are required' },
        { status: 400 }
      );
    }

    console.log('Deleting image:', {
      galleryId,
      imagePath,
    });

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

    // Remove image from gallery
    gallery.images = gallery.images.filter(
      (img: any) => img.path !== imagePath
    );
    await gallery.save();

    // Delete from Firebase Storage
    await deleteFile(imagePath);

    console.log('Image deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      gallery,
    });
  } catch (error: any) {
    console.error('Error deleting gallery image:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to delete image: ${error.message}` },
      { status: 500 }
    );
  }
}
