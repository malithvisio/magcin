import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogCategory from '@/models/BlogCategory';
import { getUserContext } from '@/util/tenantContext';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for authentication
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Starting blog categories migration...');

    // Drop all existing indexes
    await BlogCategory.collection.dropIndexes();
    console.log('Dropped all existing indexes');

    // Create new indexes with correct constraints
    await BlogCategory.collection.createIndex(
      { name: 1, rootUserId: 1 },
      { unique: true, name: 'name_rootUserId_unique' }
    );
    console.log('Created unique index: name + rootUserId');

    await BlogCategory.collection.createIndex(
      { position: 1, rootUserId: 1 },
      { name: 'position_rootUserId' }
    );
    console.log('Created index: position + rootUserId');

    await BlogCategory.collection.createIndex(
      { isActive: 1, rootUserId: 1 },
      { name: 'isActive_rootUserId' }
    );
    console.log('Created index: isActive + rootUserId');

    await BlogCategory.collection.createIndex(
      { isFeatured: 1, rootUserId: 1 },
      { name: 'isFeatured_rootUserId' }
    );
    console.log('Created index: isFeatured + rootUserId');

    await BlogCategory.collection.createIndex(
      { slug: 1, rootUserId: 1 },
      { name: 'slug_rootUserId' }
    );
    console.log('Created index: slug + rootUserId');

    await BlogCategory.collection.createIndex(
      { createdAt: 1, rootUserId: 1 },
      { name: 'createdAt_rootUserId' }
    );
    console.log('Created index: createdAt + rootUserId');

    // List all indexes to verify
    const indexes = await BlogCategory.collection.indexes();
    console.log(
      'Current indexes:',
      indexes.map(idx => idx.name)
    );

    return NextResponse.json(
      {
        message: 'Blog categories migration completed successfully',
        indexes: indexes.map(idx => idx.name),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Blog categories migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate blog categories' },
      { status: 500 }
    );
  }
}
