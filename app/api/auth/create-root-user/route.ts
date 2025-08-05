import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getApartmentConfig, getCompanyId } from '@/util/apartment-config';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get apartment configuration
    const apartmentConfig = getApartmentConfig();
    const companyId = getCompanyId();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      companyId: companyId,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique tenantId
    const tenantId = `tenant_${email.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;

    // Create root user
    const rootUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'root_user',
      isRootUser: true,
      rootUserId: null, // Ensure root users have rootUserId set to null
      companyId: companyId,
      tenantId: tenantId,
      subscriptionPlan: apartmentConfig.subscriptionPlan,
      subscriptionStatus: 'active',
      isActive: true,
      isVerified: true,
      companyName: apartmentConfig.companyName,
      companyDescription: apartmentConfig.companyDescription,
      phoneNumber: apartmentConfig.contact.phone,
      whatsappNumber: apartmentConfig.contact.whatsapp,
      website: apartmentConfig.domain,
      apartmentName: apartmentConfig.companyName,
      apartmentDescription: apartmentConfig.companyDescription,
    });

    // Save user to database
    await rootUser.save();

    // Return success response (without password)
    const userResponse = {
      id: rootUser._id,
      name: rootUser.name,
      email: rootUser.email,
      role: rootUser.role,
      isRootUser: rootUser.isRootUser,
      companyId: rootUser.companyId,
      tenantId: rootUser.tenantId,
      subscriptionPlan: rootUser.subscriptionPlan,
      createdAt: rootUser.createdAt,
    };

    return NextResponse.json(
      {
        message: 'Root user created successfully',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create root user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
