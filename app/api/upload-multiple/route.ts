import { NextRequest, NextResponse } from 'next/server';
import {
  uploadFile,
  deleteFile,
  extractStoragePath,
} from '@/util/firebase-storage';
import { getUserContext } from '@/util/tenantContext';

export async function POST(request: NextRequest) {
  try {
    console.log('Multiple upload API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);
    console.log('User context:', {
      userId: userContext.userId,
      companyId: userContext.companyId,
    });

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const activityId = formData.get('activityId') as string;
    const type = formData.get('type') as string; // 'inside'
    const altTexts = formData.getAll('altTexts') as string[];

    console.log('Form data:', {
      filesCount: files.length,
      type,
      activityId,
      hasAltTexts: altTexts.length > 0,
    });

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (const file of files) {
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

      // Validate file size (max 5MB per file)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: 'File size too large. Maximum size is 5MB per file.',
          },
          { status: 400 }
        );
      }
    }

    // Upload all files
    const uploadPromises = files.map(async (file, index) => {
      const path = `activities/${activityId}/${type}/`;
      console.log(`Uploading file ${index + 1}/${files.length}:`, file.name);

      const result = await uploadFile(file, path);
      console.log(`Upload successful for ${file.name}:`, {
        url: result.url,
        path: result.path,
      });

      // Use custom alt text if provided, otherwise use filename
      const customAltText =
        altTexts[index] || file.name.replace(/\.[^/.]+$/, '');

      return {
        url: result.url,
        path: result.path,
        alt: customAltText,
        order: index,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    console.log('All uploads completed:', uploadedImages.length);

    return NextResponse.json({
      success: true,
      images: uploadedImages,
    });
  } catch (error: any) {
    console.error('Error uploading multiple images:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to upload images: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Remove individual image
export async function DELETE(request: NextRequest) {
  try {
    console.log('Delete image API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);

    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');
    const activityId = searchParams.get('activityId');

    if (!imagePath || !activityId) {
      return NextResponse.json(
        { success: false, error: 'Image path and activity ID are required' },
        { status: 400 }
      );
    }

    console.log('Deleting image:', { imagePath, activityId });

    // Delete from Firebase Storage
    await deleteFile(imagePath);

    console.log('Image deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting image:', error);

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
