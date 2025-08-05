import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { getUserContext, createTenantFilter } from '@/util/tenantContext';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { categoryIds } = await request.json();

    console.log('Reorder request received:', { categoryIds });

    if (!categoryIds || !Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'Category IDs array is required' },
        { status: 400 }
      );
    }

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // First, let's check if all categories exist for this tenant
    const existingCategories = await Category.find({
      _id: { $in: categoryIds },
      ...createTenantFilter(
        userContext.userId,
        userContext.tenantId,
        userContext.companyId
      ),
    });

    console.log('Found categories:', existingCategories.length);
    console.log(
      'Existing categories before update:',
      existingCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        position: cat.position,
      }))
    );

    if (existingCategories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: 'Some categories not found' },
        { status: 404 }
      );
    }

    // Update the order of categories by setting a position field
    const updatePromises = categoryIds.map(
      (categoryId: string, index: number) => {
        console.log(`Updating category ${categoryId} to position ${index}`);
        return Category.findByIdAndUpdate(
          categoryId,
          {
            $set: {
              position: index,
              updatedAt: new Date(),
            },
          },
          { new: true, runValidators: true }
        );
      }
    );

    const updatedCategories = await Promise.all(updatePromises);
    console.log('Updated categories:', updatedCategories.length);
    console.log(
      'Updated categories details:',
      updatedCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        position: cat.position,
      }))
    );

    // Verify the updates were actually saved by fetching again
    const verifyCategories = await Category.find({
      _id: { $in: categoryIds },
    }).select('name _id position createdAt');

    console.log(
      'Verification - categories after update:',
      verifyCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        position: cat.position,
      }))
    );

    // Fetch the updated categories in the new order
    const finalCategories = await Category.find(
      createTenantFilter(
        userContext.userId,
        userContext.tenantId,
        userContext.companyId
      )
    )
      .sort({ position: 1, createdAt: -1 })
      .select('name _id position createdAt');

    console.log('Final categories count:', finalCategories.length);
    console.log(
      'Final categories with positions:',
      finalCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        position: cat.position,
      }))
    );

    return NextResponse.json(
      {
        success: true,
        categories: finalCategories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reorder categories error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    );
  }
}
