import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserContext } from '@/util/tenantContext';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user context for authentication
    const userContext = await getUserContext(request);

    // Get full user details from database
    const user = await User.findById(userContext.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isRootUser: user.isRootUser,
      rootUserId: user.rootUserId,
      companyId: user.companyId,
      tenantId: user.tenantId,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      isActive: user.isActive,
      createdAt: user.createdAt,
      usageStats: user.usageStats,
    };

    return NextResponse.json({
      message: 'User authenticated successfully',
      user: userData,
    });
  } catch (error: any) {
    console.error('Check current user error:', error);

    if (error.message?.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
