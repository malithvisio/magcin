import { NextRequest, NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserContext } from '@/util/tenantContext';
import {
  getCurrentRootUserId,
  isValidRootUserId,
} from '@/util/root-user-config';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const published = searchParams.get('published');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'position';

    // Build query
    let query: any = {};

    // Get rootUserId from query parameters or use current root user ID
    const rootUserIdParam = searchParams.get('rootUserId');
    let rootUserId: string;

    if (rootUserIdParam && isValidRootUserId(rootUserIdParam)) {
      // Use the rootUserId from query parameters if it's valid
      rootUserId = rootUserIdParam;
      console.log(
        'Blogs API - Using rootUserId from query params:',
        rootUserId
      );
    } else {
      // Try to get user context for filtering, but don't fail if not authenticated
      try {
        const userContext = await getUserContext(request);
        rootUserId = userContext.rootUserId;
        console.log('Blogs API - Using user context rootUserId:', rootUserId);
      } catch (error) {
        // If no authentication, use the current root user ID from config
        rootUserId = getCurrentRootUserId();
        console.log(
          'Blogs API - Using current rootUserId from config:',
          rootUserId
        );
      }
    }

    query.rootUserId = rootUserId;

    if (category && category !== 'All') {
      query.category = category;
    }

    if (author && author !== 'All') {
      query.author = author;
    }

    if (published !== null) {
      query.published = published === 'true';
    }

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case 'position':
        sort.position = 1;
        break;
      case 'date':
        sort.createdAt = -1;
        break;
      case 'title':
        sort.title = 1;
        break;
      case 'author':
        sort.author = 1;
        break;
      default:
        sort.position = 1;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute query
    const blogs = await Blog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Blog.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and description are required',
        },
        { status: 400 }
      );
    }

    // Create new blog post with root user context
    const blog = new Blog({
      ...body,
      rootUserId: userContext.rootUserId,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      position: body.position || 0,
      published: body.published || false,
    });

    await blog.save();

    return NextResponse.json(
      {
        success: true,
        data: blog,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
