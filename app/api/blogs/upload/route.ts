import { NextRequest, NextResponse } from 'next/server';
import {
  uploadFile,
  deleteFile,
  extractStoragePath,
} from '@/util/firebase-storage';
import { getUserContext } from '@/util/tenantContext';

export async function POST(request: NextRequest) {
  try {
    console.log('Blog upload API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);
    console.log('User context:', {
      userId: userContext.userId,
      companyId: userContext.companyId,
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const blogId = formData.get('blogId') as string;
    const oldImageUrl = formData.get('oldImageUrl') as string;

    console.log('Form data:', {
      hasFile: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      blogId,
      hasOldImage: !!oldImageUrl,
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
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

    // Delete old image if it exists and is from Firebase Storage
    if (oldImageUrl) {
      const oldPath = extractStoragePath(oldImageUrl);
      if (oldPath) {
        await deleteFile(oldPath);
      }
    }

    // Upload new image
    const path = `blogs/${blogId}/`;
    console.log('Uploading to path:', path);

    const result = await uploadFile(file, path);
    console.log('Upload successful:', { url: result.url, path: result.path });

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
    });
  } catch (error: any) {
    console.error('Error uploading blog image:', error);

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
