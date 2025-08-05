import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, role = 'admin' } = await request.json();

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

    // Update user role (this will add the role field if it doesn't exist)
    user.role = role;
    await user.save();

    return NextResponse.json(
      {
        message: 'User role updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also provide a GET endpoint to update all existing users
export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Find all users without role field and update them
    const users = await User.find({});
    let updatedCount = 0;

    for (const user of users) {
      if (!user.role) {
        user.role = 'admin'; // Set all existing users as admin
        await user.save();
        updatedCount++;
      }
    }

    return NextResponse.json(
      {
        message: `Updated ${updatedCount} users with admin role`,
        updatedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update all users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
