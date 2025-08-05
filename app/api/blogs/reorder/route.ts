import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const { blogs } = await request.json();

    // Update positions for all blogs
    const updatePromises = blogs.map((blog: any) =>
      Blog.findByIdAndUpdate(blog._id, { position: blog.position })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Blogs reordered successfully' });
  } catch (error) {
    console.error('Error reordering blogs:', error);
    return NextResponse.json(
      { error: 'Failed to reorder blogs' },
      { status: 500 }
    );
  }
}
