import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/util/tenantContext';
import { connectToDatabase } from '@/lib/mongodb';
import Package from '@/models/Package';

export async function POST(request: NextRequest) {
  try {
    console.log('Migrate slider images API called');

    // Get user context for authentication
    const userContext = await getUserContext(request);
    console.log('User context:', {
      userId: userContext.userId,
      companyId: userContext.companyId,
    });

    const { packageId } = await request.json();

    if (!packageId) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
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

    // Check if migration is needed
    const hasOldSliderImages =
      packageData.instructionSliderImage1 ||
      packageData.instructionSliderImage2;
    const hasNewSliderImages =
      packageData.instructionSliderImages &&
      packageData.instructionSliderImages.length > 0;

    if (!hasOldSliderImages) {
      return NextResponse.json({
        success: true,
        message: 'No old slider images to migrate',
        migrated: false,
      });
    }

    if (hasNewSliderImages) {
      return NextResponse.json({
        success: true,
        message: 'Already migrated to new format',
        migrated: false,
      });
    }

    // Migrate old individual fields to new array format
    const sliderImages = [];

    if (packageData.instructionSliderImage1) {
      sliderImages.push({
        url: packageData.instructionSliderImage1,
        alt: packageData.instructionSliderImage1Alt || '',
        uploaded: true,
      });
    }

    if (packageData.instructionSliderImage2) {
      sliderImages.push({
        url: packageData.instructionSliderImage2,
        alt: packageData.instructionSliderImage2Alt || '',
        uploaded: true,
      });
    }

    // Update the package with the new array format
    const updateResult = await Package.updateOne(
      { _id: packageId },
      {
        $set: { instructionSliderImages: sliderImages },
        $unset: {
          instructionSliderImage1: '',
          instructionSliderImage1Alt: '',
          instructionSliderImage2: '',
          instructionSliderImage2Alt: '',
        },
      }
    );

    console.log('Migration result:', updateResult);

    return NextResponse.json({
      success: true,
      message: 'Slider images migrated successfully',
      migrated: true,
      sliderImagesCount: sliderImages.length,
    });
  } catch (error: any) {
    console.error('Error migrating slider images:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed to migrate slider images: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
