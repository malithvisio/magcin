import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Package from '@/models/Package';
import {
  getApartmentContext,
  getApartmentDataFilter,
  canPerformAction,
} from '@/util/apartment-utils';

// Example API route showing apartment-based data filtering
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get apartment context from request
    const apartmentContext = await getApartmentContext(req);
    if (!apartmentContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid apartment context' },
        { status: 401 }
      );
    }

    // Check if user can view data
    if (!canPerformAction(apartmentContext, 'view_data')) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get apartment filter for database query
    const apartmentFilter = getApartmentDataFilter(apartmentContext);

    // Get packages for this apartment
    const packages = await Package.find(apartmentFilter)
      .sort({ position: 1, createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: packages,
      apartmentContext: {
        rootUserId: apartmentContext.rootUserId,
        isRootUser: apartmentContext.isRootUser,
        userRole: apartmentContext.userRole,
      },
    });
  } catch (error) {
    console.error('Error fetching apartment packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get apartment context from request
    const apartmentContext = await getApartmentContext(req);
    if (!apartmentContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid apartment context' },
        { status: 401 }
      );
    }

    // Check if user can create packages
    if (!canPerformAction(apartmentContext, 'create_package')) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Create new package with apartment context
    const newPackage = new Package({
      ...body,
      rootUserId: apartmentContext.rootUserId,
      companyId: apartmentContext.companyId,
      tenantId: apartmentContext.tenantId,
    });

    await newPackage.save();

    return NextResponse.json({
      success: true,
      data: newPackage,
      message: 'Package created successfully',
    });
  } catch (error) {
    console.error('Error creating apartment package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
