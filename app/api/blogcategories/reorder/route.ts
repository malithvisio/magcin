import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogCategory from '@/models/BlogCategory';
import { getUserContext } from '@/util/tenantContext';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { categoryIds } = await request.json();

    // Get user context for multi-tenant authentication
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'Category IDs array is required' },
        { status: 400 }
      );
    }

    console.log('Reordering blog categories:', {
      categoryIds,
      rootUserId: userContext.rootUserId,
    });

    // Verify all categories belong to the user
    const categories = await BlogCategory.find({
      _id: { $in: categoryIds },
      rootUserId: userContext.rootUserId,
    });

    if (categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: 'Some categories not found or unauthorized' },
        { status: 403 }
      );
    }

    // Update positions based on the new order
    const updatePromises = categoryIds.map((categoryId, index) =>
      BlogCategory.findByIdAndUpdate(categoryId, { position: index })
    );

    await Promise.all(updatePromises);

    console.log('Blog categories reordered successfully');

    return NextResponse.json(
      { message: 'Blog categories reordered successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reorder blog categories error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder blog categories' },
      { status: 500 }
    );
  }
}
