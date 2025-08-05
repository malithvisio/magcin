import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import { createRootUserFilter } from '@/util/root-user-config';

// GET - Test endpoint to see what package IDs exist
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const rootUserId = searchParams.get('rootUserId');

    // Use default root user filter if not provided
    const defaultFilter = createRootUserFilter(rootUserId || undefined);
    const query = { published: true, rootUserId: defaultFilter.rootUserId };

    console.log('=== TEST PACKAGE IDS ===');
    console.log('Query:', JSON.stringify(query, null, 2));

    // Get all packages with just the essential fields
    const packages = await Package.find(query)
      .select('_id id name title')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('Found packages:', packages.length);

    const packageList = packages.map(pkg => ({
      _id: pkg._id.toString(),
      id: pkg.id,
      name: pkg.name,
      title: pkg.title,
    }));

    return NextResponse.json({
      rootUserId: defaultFilter.rootUserId,
      totalPackages: packages.length,
      packages: packageList,
    });
  } catch (error) {
    console.error('TEST package IDs error:', error);
    return NextResponse.json(
      {
        error: 'Failed to test package IDs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
