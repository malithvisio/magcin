import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fix the user based on their role
    if (user.role === 'root_user') {
      user.isRootUser = true;
      user.rootUserId = null; // Root users don't have a parent
    } else if (user.role === 'admin') {
      user.isRootUser = false;
      // For admin users, we need to set rootUserId to the apartment owner
      // For now, we'll set it to null and they can be updated later
      user.rootUserId = null;
    } else {
      user.isRootUser = false;
      user.rootUserId = null;
    }

    await user.save();

    return NextResponse.json(
      {
        message: 'User fixed successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isRootUser: user.isRootUser,
          rootUserId: user.rootUserId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fix user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fix all users
export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Find all users and fix them
    const users = await User.find({});
    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;

      if (
        user.role === 'root_user' &&
        (!user.isRootUser || user.rootUserId !== null)
      ) {
        user.isRootUser = true;
        user.rootUserId = null;
        needsUpdate = true;
      } else if (
        user.role === 'admin' &&
        (user.isRootUser || user.rootUserId !== null)
      ) {
        user.isRootUser = false;
        user.rootUserId = null;
        needsUpdate = true;
      } else if (!user.role && !user.isRootUser) {
        // Legacy users without role
        user.role = 'admin';
        user.isRootUser = false;
        user.rootUserId = null;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        updatedCount++;
      }
    }

    return NextResponse.json(
      {
        message: `Fixed ${updatedCount} users`,
        updatedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fix all users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
