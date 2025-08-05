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
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get apartment configuration
    const apartmentConfig = getApartmentConfig();
    const companyId = getCompanyId();

    console.log('Login attempt for email:', email.toLowerCase());
    console.log('Company ID:', companyId);

    // Find user by email and ensure they belong to this apartment
    const user = await User.findOne({
      email: email.toLowerCase(),
      companyId: companyId, // Only allow users from this apartment
    });

    if (!user) {
      console.log('User not found for email:', email.toLowerCase());
      return NextResponse.json(
        { error: getApartmentErrorMessage('User not found') },
        { status: 401 }
      );
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      isRootUser: user.isRootUser,
      rootUserId: user.rootUserId,
      companyId: user.companyId,
    });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', user.email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('User account inactive:', user.email);
      return NextResponse.json(
        { error: getApartmentErrorMessage('User account is inactive') },
        { status: 401 }
      );
    }

    // Fix user fields if needed
    let needsSave = false;

    // Add role field if it doesn't exist (backward compatibility)
    if (!user.role) {
      user.role = 'admin';
      needsSave = true;
    }

    // Add companyId if it doesn't exist (backward compatibility)
    if (!user.companyId) {
      user.companyId = companyId;
      needsSave = true;
    }

    // Add tenantId if it doesn't exist (backward compatibility)
    if (!user.tenantId) {
      user.tenantId = `tenant_${user._id}`;
      needsSave = true;
    }

    // Add subscription plan if it doesn't exist (backward compatibility)
    if (!user.subscriptionPlan) {
      user.subscriptionPlan = apartmentConfig.subscriptionPlan;
      needsSave = true;
    }

    // Fix root user fields if needed
    if (
      user.role === 'root_user' &&
      (!user.isRootUser || user.rootUserId !== null)
    ) {
      user.isRootUser = true;
      user.rootUserId = null;
      needsSave = true;
      console.log('Fixed root user fields for:', user.email);
    }

    // Save user if any fields were updated
    if (needsSave) {
      try {
        await user.save();
        console.log('User saved successfully:', user.email);
      } catch (saveError) {
        console.error('Error saving user:', saveError);
        return NextResponse.json(
          { error: 'Error updating user data' },
          { status: 500 }
        );
      }
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isRootUser: user.isRootUser,
      rootUserId: user.rootUserId, // Add rootUserId for multi-tenant filtering
      companyId: user.companyId,
      tenantId: user.tenantId,
      subscriptionPlan: user.subscriptionPlan,
      companyName: user.companyName,
      createdAt: user.createdAt,
      apartmentConfig: {
        companyName: apartmentConfig.companyName,
        domain: apartmentConfig.domain,
        branding: apartmentConfig.branding,
        contact: apartmentConfig.contact,
        features: apartmentConfig.features,
      },
    };

    console.log('Login successful for user:', user.email, 'Role:', user.role);

    // Create response with headers for apartment authentication
    const response = NextResponse.json(
      {
        message: `Login successful to ${apartmentConfig.companyName}`,
        user: userResponse,
      },
      { status: 200 }
    );

    // Set headers for apartment authentication
    response.headers.set('x-user-id', (user._id as any).toString());
    response.headers.set('x-user-email', user.email);
    response.headers.set('x-company-id', user.companyId);
    response.headers.set('x-tenant-id', user.tenantId);
    response.headers.set('x-apartment-domain', apartmentConfig.domain);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
