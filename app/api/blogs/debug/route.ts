import { NextRequest, NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import { connectToDatabase } from '@/lib/mongodb';
import { getCurrentRootUserId } from '@/util/root-user-config';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get all blogs with their rootUserId
    const allBlogs = await Blog.find({})
      .select('title rootUserId published createdAt')
      .lean();

    // Get current root user ID from config
    const currentRootUserId = getCurrentRootUserId();

    // Get blogs for current root user
    const currentUserBlogs = await Blog.find({ rootUserId: currentRootUserId })
      .select('title rootUserId published createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        currentRootUserId,
        totalBlogs: allBlogs.length,
        currentUserBlogs: currentUserBlogs.length,
        allBlogs: allBlogs,
        currentUserBlogsData: currentUserBlogs,
      },
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch debug data' },
      { status: 500 }
    );
  }
}
