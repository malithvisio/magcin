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

    // Find blog by slug with root user filtering
    const blog = await Blog.findOne({
      slug: params.slug,
      rootUserId: rootUserId,
      published: true, // Only return published blogs for public access
    }).lean();

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}
