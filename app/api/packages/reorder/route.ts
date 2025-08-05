import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import { getUserContext } from '@/util/tenantContext';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    const { categoryId, packageIds } = await request.json();

    if (!categoryId || !packageIds || !Array.isArray(packageIds)) {
      return NextResponse.json(
        { error: 'Category ID and package IDs array are required' },
        { status: 400 }
      );
    }

    // Update the order of packages by setting a position field
    // This approach allows for flexible ordering
    const updatePromises = packageIds.map(
      (packageId: string, index: number) => {
        return Package.findOneAndUpdate(
          {
            _id: packageId,
            rootUserId: userContext.rootUserId, // Ensure only packages from this root user
          },
          {
            $set: {
              position: index,
              updatedAt: new Date(),
            },
          },
          { new: true }
        );
      }
    );

    await Promise.all(updatePromises);

    // Fetch the updated packages in the new order
    const updatedPackages = await Package.find({
      category: categoryId,
      rootUserId: userContext.rootUserId, // Filter by root user
    })
      .sort({ position: 1, createdAt: -1 })
      .select('name published position _id');

    return NextResponse.json(
      {
        success: true,
        packages: updatedPackages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reorder packages error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder packages' },
      { status: 500 }
    );
  }
}
