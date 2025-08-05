import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { getUserContext } from '@/util/tenantContext';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    // Get user context for root user filtering
    let userContext;
    let rootUserId;

    try {
      userContext = await getUserContext(request);
      rootUserId = userContext.rootUserId;
    } catch (error) {
      // If no authentication, use default root user ID for public access
      rootUserId = '68786e17d6e23d3a8ec0fe2f';
    }

    // First, get the current blog to find its category
    const currentBlog = await Blog.findOne({
      slug: params.slug,
      rootUserId: rootUserId,
      published: true,
    }).lean();

    if (!currentBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Find related blogs by category (excluding the current blog)
    const relatedBlogs = await Blog.find({
      category: (currentBlog as any).category,
      rootUserId: rootUserId,
      published: true,
      _id: { $ne: (currentBlog as any)._id }, // Exclude current blog
    })
      .sort({ position: 1, createdAt: -1 })
      .limit(3)
      .lean();

    return NextResponse.json({
      success: true,
      data: relatedBlogs,
    });
  } catch (error) {
    console.error('Error fetching related blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch related blogs' },
      { status: 500 }
    );
  }
}
