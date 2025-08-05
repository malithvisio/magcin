import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { getUserContext, createTenantFilter } from '@/util/tenantContext';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Get all categories first for this tenant
    const allCategories = await Category.find(
      createTenantFilter(
        userContext.userId,
        userContext.tenantId,
        userContext.companyId
      )
    ).sort({ createdAt: 1 });

    console.log(`Total categories found: ${allCategories.length}`);

    // Check for categories with invalid position values
    const categoriesNeedingPosition = allCategories.filter(
      cat =>
        cat.position === undefined ||
        cat.position === null ||
        cat.position === 0 ||
        typeof cat.position !== 'number'
    );

    console.log(
      `Found ${categoriesNeedingPosition.length} categories needing position values`
    );

    if (categoriesNeedingPosition.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'All categories already have valid position values',
          categories: await Category.find(
            createTenantFilter(
              userContext.userId,
              userContext.tenantId,
              userContext.companyId
            )
          ).sort({
            position: 1,
            createdAt: -1,
          }),
        },
        { status: 200 }
      );
    }

    // Update each category with a proper position based on creation date order
    const updatePromises = allCategories.map((category, index) => {
      console.log(
        `Setting position ${index} for category: ${category.name} (current position: ${category.position})`
      );
      return Category.findByIdAndUpdate(
        category._id,
        {
          $set: {
            position: index,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    // Fetch all categories to confirm the update
    const updatedCategories = await Category.find(
      createTenantFilter(
        userContext.userId,
        userContext.tenantId,
        userContext.companyId
      )
    )
      .sort({ position: 1, createdAt: -1 })
      .select('name _id position createdAt');

    console.log(
      'Updated categories with new positions:',
      updatedCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        position: cat.position,
      }))
    );

    return NextResponse.json(
      {
        success: true,
        message: `Initialized positions for ${categoriesNeedingPosition.length} categories. Total categories updated: ${allCategories.length}`,
        categories: updatedCategories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Initialize positions error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize positions' },
      { status: 500 }
    );
  }
}
