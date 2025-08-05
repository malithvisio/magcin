import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import {
  getApartmentConfig,
  getCompanyId,
  getApartmentErrorMessage,
} from '@/util/apartment-config';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await request.json();

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get apartment configuration
    const apartmentConfig = getApartmentConfig();
    const companyId = getCompanyId();

    // Check if user already exists for this apartment
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      companyId: companyId,
    });
    if (existingUser) {
      return NextResponse.json(
        {
          error: getApartmentErrorMessage(
            'User with this email already exists'
          ),
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique tenantId based on email
    const tenantId = `tenant_${email.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;

    // Check if there are any existing root users in this company
    const existingRootUsers = await User.findRootUsersByCompany(companyId);

    let isRootUser = false;
    let rootUserId = null;

    if (existingRootUsers.length === 0) {
      // No root users exist, make this user a root user
      isRootUser = true;
      rootUserId = null;
    } else {
      // Root users exist, assign this user to the first root user
      isRootUser = false;
      rootUserId = existingRootUsers[0]._id;
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: isRootUser ? 'root_user' : 'admin', // Set role based on root user status
      isRootUser: isRootUser,
      rootUserId: rootUserId,
      companyId: companyId, // Add required companyId
      tenantId: tenantId, // Add required tenantId
      subscriptionPlan: apartmentConfig.subscriptionPlan,
      subscriptionStatus: 'active',
      isActive: true,
      isVerified: true,
      companyName: apartmentConfig.companyName,
      companyDescription: apartmentConfig.companyDescription,
      phoneNumber: apartmentConfig.contact.phone,
      whatsappNumber: apartmentConfig.contact.whatsapp,
      website: apartmentConfig.domain,
      // Add apartment info if this is a root user
      ...(isRootUser && {
        apartmentName: apartmentConfig.companyName,
        apartmentDescription: apartmentConfig.companyDescription,
      }),
    });

    // Save user to database
    await user.save();

    // Return success response (without password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isRootUser: user.isRootUser,
      rootUserId: user.rootUserId,
      companyId: user.companyId,
      tenantId: user.tenantId,
      subscriptionPlan: user.subscriptionPlan,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      {
        message: isRootUser
          ? 'Root user registered successfully'
          : 'User registered successfully',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
