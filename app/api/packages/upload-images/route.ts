import { NextRequest, NextResponse } from 'next/server';
import {
  uploadFile,
  deleteFile,
  extractStoragePath,
} from '@/util/firebase-storage';
import { getUserContext } from '@/util/tenantContext';
import { connectToDatabase } from '@/lib/mongodb';
import Package from '@/models/Package';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    console.log('Package images upload API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);
    console.log('User context:', {
      userId: userContext.userId,
      companyId: userContext.companyId,
    });

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const packageId = formData.get('packageId') as string;
    const imageType = formData.get('imageType') as string; // 'instruction', 'slider', 'accommodation', 'review'
    const altTexts = formData.getAll('altTexts') as string[];
    const accommodationIndex = formData.get('accommodationIndex') as string; // For accommodation images
    const reviewIndex = formData.get('reviewIndex') as string; // For review images

    console.log('Form data:', {
      filesCount: files.length,
      packageId,
      imageType,
      hasAltTexts: altTexts.length > 0,
      accommodationIndex,
      reviewIndex,
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

    // Connect to MongoDB
    await connectToDatabase();

    // Upload all files to Firebase Storage
    const uploadPromises = files.map(async (file, index) => {
      const path = `packages/${packageId}/${imageType}/`;
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
        fileName: file.name,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    console.log('All uploads completed:', uploadedImages.length);

    // Update MongoDB with the new image URLs
    let updateResult;
    const packageObjectId = new ObjectId(packageId);

    // Check if package exists
    const existingPackage = await Package.findById(packageObjectId);

    if (!existingPackage) {
      // Create a new package with basic structure if it doesn't exist
      const newPackage = {
        _id: packageObjectId,
        name: 'Temporary Package',
        type: 'tour',
        published: false,
        isDraft: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await Package.create(newPackage);
      console.log('Created new temporary package:', packageId);
    }

    switch (imageType) {
      case 'instruction':
        // Update instruction images
        const instructionUpdateData: any = {
          instructionImage1: uploadedImages[0]?.url || '',
          instructionImage1Alt: uploadedImages[0]?.alt || '',
        };

        console.log('Uploaded images:', uploadedImages);
        console.log('Number of uploaded images:', uploadedImages.length);

        // Save slider images to the new array field
        if (uploadedImages.length > 1) {
          const sliderImages = uploadedImages.slice(1).map(img => ({
            url: img.url,
            alt: img.alt,
            uploaded: true,
          }));

          console.log('Slider images to save:', sliderImages);

          // Use $set to create or replace the array
          instructionUpdateData.instructionSliderImages = sliderImages;

          console.log('Final update data:', instructionUpdateData);

          updateResult = await Package.updateOne(
            { _id: packageObjectId },
            { $set: instructionUpdateData },
            { upsert: true }
          );
        } else {
          updateResult = await Package.updateOne(
            { _id: packageObjectId },
            { $set: instructionUpdateData },
            { upsert: true }
          );
        }
        break;

      case 'accommodation':
        // Update accommodation images
        const accIndex = parseInt(accommodationIndex || '0');

        // Ensure accommodationPlaces array exists and has enough elements
        const accommodationUpdateData = {
          [`accommodationPlaces.${accIndex}.image1`]:
            uploadedImages[0]?.url || '',
          [`accommodationPlaces.${accIndex}.image1Alt`]:
            uploadedImages[0]?.alt || '',
        };

        // Add header image if it exists
        if (uploadedImages[1]) {
          accommodationUpdateData[
            `accommodationPlaces.${accIndex}.headerImage`
          ] = uploadedImages[1].url || '';
        }

        // Use upsert to ensure the array and element exist
        updateResult = await Package.updateOne(
          { _id: packageObjectId },
          {
            $set: accommodationUpdateData,
          },
          { upsert: true }
        );
        break;

      case 'review':
        // Update review images
        const revIndex = parseInt(reviewIndex || '0');

        // Ensure packageReviews array exists and has enough elements
        const reviewUpdateData = {
          [`packageReviews.${revIndex}.faceImageUrl`]:
            uploadedImages[0]?.url || '',
          [`packageReviews.${revIndex}.faceImageAlt`]:
            uploadedImages[0]?.alt || '',
        };

        // Add journey image if it exists
        if (uploadedImages[1]) {
          reviewUpdateData[`packageReviews.${revIndex}.journeyImageUrl`] =
            uploadedImages[1].url || '';
          reviewUpdateData[`packageReviews.${revIndex}.journeyImageAlt`] =
            uploadedImages[1].alt || '';
        }

        // Use upsert to ensure the array and element exist
        updateResult = await Package.updateOne(
          { _id: packageObjectId },
          {
            $set: reviewUpdateData,
          },
          { upsert: true }
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid image type' },
          { status: 400 }
        );
    }

    console.log('MongoDB update result:', updateResult);
    console.log('Modified count:', updateResult.modifiedCount);
    console.log('Matched count:', updateResult.matchedCount);

    // Verify the update by fetching the package
    const updatedPackage = await Package.findById(packageObjectId);
    console.log(
      'Updated package slider images:',
      updatedPackage?.instructionSliderImages
    );

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      updated: updateResult.modifiedCount > 0,
    });
  } catch (error: any) {
    console.error('Error uploading package images:', error);

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
    console.log('Delete package image API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);

    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');
    const packageId = searchParams.get('packageId');
    const imageType = searchParams.get('imageType');
    const fieldPath = searchParams.get('fieldPath'); // MongoDB field path to clear

    if (!imagePath || !packageId) {
      return NextResponse.json(
        { success: false, error: 'Image path and package ID are required' },
        { status: 400 }
      );
    }

    console.log('Deleting image:', {
      imagePath,
      packageId,
      imageType,
      fieldPath,
    });

    // Delete from Firebase Storage
    await deleteFile(imagePath);

    // Clear the URL from MongoDB if fieldPath is provided
    if (fieldPath) {
      await connectToDatabase();
      const packageObjectId = new ObjectId(packageId);

      await Package.updateOne(
        { _id: packageObjectId },
        { $unset: { [fieldPath]: '' } }
      );
    }

    console.log('Image deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting package image:', error);

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
