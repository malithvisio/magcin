import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import Category from '@/models/Category';
import { createRootUserFilter } from '@/util/root-user-config';

// GET - Debug endpoint to check package and category data
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const rootUserId = searchParams.get('rootUserId');

    // Use default root user filter if not provided
    const defaultFilter = createRootUserFilter(rootUserId || undefined);
    const query = { published: true, rootUserId: defaultFilter.rootUserId };

    console.log('=== DEBUG PACKAGES AND CATEGORIES ===');
    console.log('Query:', JSON.stringify(query, null, 2));

    // Get categories
    const categories = await Category.find({
      rootUserId: defaultFilter.rootUserId,
      published: true,
    });
    console.log('Categories found:', categories.length);
    console.log(
      'Categories:',
      categories.map(c => ({ id: c._id, name: c.name }))
    );

    // Get packages with populated category
    const packages = await Package.find(query).populate('category', 'name');
    console.log('Packages found:', packages.length);
    console.log(
      'Packages:',
      packages.map(p => ({
        id: p._id,
        title: p.title,
        category: p.category,
        categoryName: p.category?.name,
      }))
    );

    // Test category matching
    const categoryMatches = categories.map(category => {
      const matchingPackages = packages.filter(
        pkg => pkg.category?.name === category.name
      );
      return {
        categoryName: category.name,
        categoryId: category._id,
        packageCount: matchingPackages.length,
        packages: matchingPackages.map(p => ({ id: p._id, title: p.title })),
      };
    });

    return NextResponse.json({
      rootUserId: defaultFilter.rootUserId,
      categories: categories.map(c => ({ id: c._id, name: c.name })),
      packages: packages.map(p => ({
        id: p._id,
        title: p.title,
        category: p.category,
      })),
      categoryMatches,
      summary: {
        totalCategories: categories.length,
        totalPackages: packages.length,
        categoriesWithPackages: categoryMatches.filter(
          cm => cm.packageCount > 0
        ).length,
      },
    });
  } catch (error) {
    console.error('DEBUG packages error:', error);
    return NextResponse.json(
      {
        error: 'Failed to debug packages',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
