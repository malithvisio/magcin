import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Package from '@/models/Package';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('packageId');

    if (!packageId) {
      return NextResponse.json({
        success: false,
        error: 'Package ID is required',
      });
    }

    const packageData = await Package.findById(packageId);

    if (!packageData) {
      return NextResponse.json({
        success: false,
        error: 'Package not found',
      });
    }

    return NextResponse.json({
      success: true,
      packageData: {
        _id: packageData._id,
        instructionImage1: packageData.instructionImage1,
        instructionImage1Alt: packageData.instructionImage1Alt,
        instructionSliderImage1: packageData.instructionSliderImage1,
        instructionSliderImage1Alt: packageData.instructionSliderImage1Alt,
        instructionSliderImage2: packageData.instructionSliderImage2,
        instructionSliderImage2Alt: packageData.instructionSliderImage2Alt,
        instructionSliderImages: packageData.instructionSliderImages,
      },
    });
  } catch (error) {
    console.error('Debug GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get package data',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json({
        success: false,
        error: 'Package ID is required',
      });
    }

    // Sample image URLs to add
    const sampleImages = [
      {
        url: 'https://firebasestorage.googleapis.com/v0/b/visiotourism.firebasestorage.app/o/packages%2F687e1831c81d886bba05db75%2Finstruction%2F1753097463121_WhatsApp%20Image%202025-07-04%20at%2015.15.00.jpeg?alt=media&token=60fe96c5-80e8-443b-916a-5610088be8d0',
        alt: 'WhatsApp Image 2025-07-04 at 15.15.00',
        uploaded: true,
      },
      {
        url: 'https://firebasestorage.googleapis.com/v0/b/visiotourism.firebasestorage.app/o/packages%2F687e1831c81d886bba05db75%2Finstruction%2F1753097463123_670fcb57a219e41ad264db63_622e0bc155115f64ba394589_elfsight-4%20(1).jpeg?alt=media&token=addfbab8-2e80-4d8e-b625-a4b1f526f57b',
        alt: '670fcb57a219e41ad264db63_622e0bc155115f64ba394589_elfsight-4 (1)',
        uploaded: true,
      },
    ];

    const updateResult = await Package.updateOne(
      { _id: packageId },
      {
        $set: {
          instructionSliderImages: sampleImages,
        },
      }
    );

    console.log('Debug update result:', updateResult);

    // Get updated package to verify
    const updatedPackage = await Package.findById(packageId);

    return NextResponse.json({
      success: true,
      message: 'Debug images added successfully',
      updateResult,
      instructionSliderImages: updatedPackage?.instructionSliderImages,
    });
  } catch (error) {
    console.error('Debug POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update package',
    });
  }
}
