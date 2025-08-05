import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { getUserContext, createTenantFilter } from '@/util/tenantContext';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return empty array
      return NextResponse.json({ categories: [] }, { status: 200 });
    }

    // Get all categories with their current positions for this tenant
    const categories = await Category.find(
      createTenantFilter(
        userContext.userId,
        userContext.tenantId,
        userContext.companyId
      )
    ).sort({ createdAt: -1 });

    console.log(
      'Current categories and positions:',
      categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        position: cat.position,
        createdAt: cat.createdAt,
      }))
    );

    return NextResponse.json({
      message: 'Categories retrieved',
      categories: categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        position: cat.position,
        createdAt: cat.createdAt,
      })),
    });
  } catch (error) {
    console.error('Test positions error:', error);
    return NextResponse.json(
      { error: 'Failed to get categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    // Get all categories for this tenant
    const categories = await Category.find(
      createTenantFilter(
        userContext.userId,
        userContext.tenantId,
        userContext.companyId
      )
    ).sort({ createdAt: -1 });

    // Update positions based on current order
    const updatePromises = categories.map((category, index) => {
      console.log(`Setting position ${index} for category: ${category.name}`);
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

    const updatedCategories = await Promise.all(updatePromises);

    console.log(
      'Updated categories with new positions:',
      updatedCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        position: cat.position,
      }))
    );

    return NextResponse.json({
      message: 'Positions updated successfully',
      categories: updatedCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        position: cat.position,
      })),
    });
  } catch (error) {
    console.error('Update positions error:', error);
    return NextResponse.json(
      { error: 'Failed to update positions' },
      { status: 500 }
    );
  }
}
