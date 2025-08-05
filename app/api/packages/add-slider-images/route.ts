import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/util/tenantContext';
import { connectToDatabase } from '@/lib/mongodb';
import Package from '@/models/Package';

export async function POST(request: NextRequest) {
  try {
    console.log('Add slider images API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);
    console.log('User context:', {
      userId: userContext.userId,
      companyId: userContext.companyId,
    });

    const { packageId, imageUrls, imageAlts } = await request.json();

    if (!packageId) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      );
    }

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return NextResponse.json(
        { success: false, error: 'Image URLs array is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Find the package
    const packageData = await Package.findById(packageId);

    if (!packageData) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    // Convert URLs to slider image objects
    const sliderImages = imageUrls.map((url: string, index: number) => ({
      url: url,
      alt:
        imageAlts && imageAlts[index]
          ? imageAlts[index]
          : `Slider Image ${index + 1}`,
      uploaded: true,
    }));

    // Update the package with the new slider images array
    const updateResult = await Package.updateOne(
      { _id: packageId },
      { $set: { instructionSliderImages: sliderImages } }
    );

    console.log('Add slider images result:', updateResult);

    return NextResponse.json({
      success: true,
      message: 'Slider images added successfully',
      added: true,
      sliderImagesCount: sliderImages.length,
    });
  } catch (error: any) {
    console.error('Error adding slider images:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed to add slider images: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
