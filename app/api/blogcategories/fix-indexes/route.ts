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

    console.log('Fixing blog category indexes...');

    // Get current indexes
    const currentIndexes = await BlogCategory.collection.indexes();
    console.log(
      'Current indexes:',
      currentIndexes.map(idx => idx.name)
    );

    // Drop the old unique index if it exists
    try {
      await BlogCategory.collection.dropIndex('name_1_companyId_1');
      console.log('Dropped old index: name_1_companyId_1');
    } catch (error) {
      console.log('Old index not found or already dropped');
    }

    // Create the new unique index
    try {
      await BlogCategory.collection.createIndex(
        { name: 1, rootUserId: 1 },
        { unique: true, name: 'name_1_rootUserId_1' }
      );
      console.log('Created new unique index: name_1_rootUserId_1');
    } catch (error) {
      console.log('Index might already exist:', error);
    }

    // Get updated indexes
    const updatedIndexes = await BlogCategory.collection.indexes();
    console.log(
      'Updated indexes:',
      updatedIndexes.map(idx => idx.name)
    );

    return NextResponse.json(
      {
        message: 'Blog category indexes fixed successfully',
        oldIndexes: currentIndexes.map(idx => idx.name),
        newIndexes: updatedIndexes.map(idx => idx.name),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fix indexes error:', error);
    return NextResponse.json(
      { error: 'Failed to fix indexes' },
      { status: 500 }
    );
  }
}
