import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { getUserContext, createRootUserFilter } from '@/util/tenantContext';

// GET - Retrieve settings
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return 404 (for security)
      return NextResponse.json(
        { message: 'No settings found' },
        { status: 404 }
      );
    }

    // Build query with root user filtering for apartment-based isolation
    const query = createRootUserFilter(userContext.rootUserId);

    // Get the first (and should be only) settings document for this root user
    const settings = await Settings.findOne(query).sort({ createdAt: -1 });

    if (!settings) {
      return NextResponse.json(
        { message: 'No settings found' },
        { status: 404 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Create or update settings
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);
    const body = await request.json();

    // Validate required fields
    if (!body.companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Filter out empty website entries
    const filteredWebsites =
      body.websites?.filter((website: any) => website.type && website.url) ||
      [];

    const settingsData = {
      ...body,
      websites: filteredWebsites,
      rootUserId: userContext.rootUserId, // Use rootUserId for apartment-based isolation
      companyId: userContext.companyId,
      tenantId: userContext.tenantId,
    };

    // Build query with root user filtering for apartment-based isolation
    const query = createRootUserFilter(userContext.rootUserId);

    // Check if settings already exist for this root user
    const existingSettings = await Settings.findOne(query).sort({
      createdAt: -1,
    });

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await Settings.findByIdAndUpdate(
        existingSettings._id,
        settingsData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new settings
      settings = await Settings.create(settingsData);
    }

    return NextResponse.json(
      { message: 'Settings saved successfully', settings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving settings:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Handle authentication errors
    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
