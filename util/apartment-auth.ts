import { NextRequest } from 'next/server';
import {
  getApartmentConfig,
  getCompanyId,
  getRootUser,
} from './apartment-config';
import User from '@/models/User';

export interface ApartmentUserContext {
  userId: string;
  companyId: string;
  tenantId: string;
  subscriptionPlan: string;
  role: string;
  email: string;
  name: string;
  apartmentConfig: any;
}

/**
 * Get apartment-specific user context from request
 * This ensures all data is filtered by the apartment's company ID
 */
export async function getApartmentUserContext(
  request: NextRequest
): Promise<ApartmentUserContext> {
  try {
    const apartmentConfig = getApartmentConfig();
    const companyId = getCompanyId();

    // Get user ID from headers (set during login)
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');

    if (!userId || !userEmail) {
      throw new Error('User authentication required');
    }

    // Find user and ensure they belong to this apartment
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify user belongs to this apartment
    if (user.companyId !== companyId) {
      throw new Error('User does not belong to this apartment');
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    return {
      userId: (user._id as any).toString(),
      companyId: user.companyId,
      tenantId: user.tenantId,
      subscriptionPlan: user.subscriptionPlan,
      role: user.role,
      email: user.email,
      name: user.name,
      apartmentConfig,
    };
  } catch (error) {
    throw new Error(
      `Apartment authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create apartment-specific filter for database queries
 * This ensures all data is filtered by the apartment's company ID
 */
export function createApartmentFilter(userId?: string) {
  const companyId = getCompanyId();

  if (userId) {
    return { companyId, userId };
  }

  return { companyId };
}

/**
 * Create apartment-specific pagination options
 */
export function createApartmentPaginationOptions(
  page: number = 1,
  limit: number = 10
) {
  return {
    skip: (page - 1) * limit,
    limit,
  };
}

/**
 * Check if user can create content based on apartment subscription
 */
export async function canCreateContent(
  contentType: string,
  userContext: ApartmentUserContext
): Promise<{ canCreate: boolean; reason?: string }> {
  const subscriptionLimits = {
    free: {
      packages: 3,
      destinations: 5,
      activities: 10,
      blogs: 5,
      teamMembers: 2,
      testimonials: 5,
    },
    pro: {
      packages: 15,
      destinations: 15,
      activities: 50,
      blogs: 25,
      teamMembers: 10,
      testimonials: 20,
    },
    pro_max: {
      packages: -1, // unlimited
      destinations: -1,
      activities: -1,
      blogs: -1,
      teamMembers: -1,
      testimonials: -1,
    },
  };

  const plan = userContext.subscriptionPlan;
  const limits = subscriptionLimits[plan as keyof typeof subscriptionLimits];

  if (!limits) {
    return { canCreate: false, reason: 'Invalid subscription plan' };
  }

  const limit = limits[contentType as keyof typeof limits];

  if (limit === -1) {
    return { canCreate: true }; // Unlimited
  }

  // Get current usage
  const user = await User.findById(userContext.userId);
  if (!user) {
    return { canCreate: false, reason: 'User not found' };
  }

  const currentUsage =
    user.usageStats[contentType as keyof typeof user.usageStats] || 0;

  if (currentUsage >= limit) {
    return {
      canCreate: false,
      reason: `You have reached your ${contentType} limit for the ${plan} plan. Please upgrade to create more content.`,
    };
  }

  return { canCreate: true };
}

/**
 * Increment usage for apartment user
 */
export async function incrementApartmentUsage(
  contentType: string,
  userContext: ApartmentUserContext
): Promise<void> {
  const user = await User.findById(userContext.userId);
  if (!user) {
    throw new Error('User not found');
  }

  const currentUsage =
    user.usageStats[contentType as keyof typeof user.usageStats] || 0;
  user.usageStats[contentType as keyof typeof user.usageStats] =
    currentUsage + 1;
  await user.save();
}

/**
 * Decrement usage for apartment user
 */
export async function decrementApartmentUsage(
  contentType: string,
  userContext: ApartmentUserContext
): Promise<void> {
  const user = await User.findById(userContext.userId);
  if (!user) {
    throw new Error('User not found');
  }

  const currentUsage =
    user.usageStats[contentType as keyof typeof user.usageStats] || 0;
  if (currentUsage > 0) {
    user.usageStats[contentType as keyof typeof user.usageStats] =
      currentUsage - 1;
    await user.save();
  }
}

/**
 * Get apartment-specific headers for API requests
 */
export function getApartmentHeaders(
  userContext: ApartmentUserContext
): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-id': userContext.userId,
    'x-user-email': userContext.email,
    'x-company-id': userContext.companyId,
    'x-tenant-id': userContext.tenantId,
    'x-apartment-domain': getApartmentConfig().domain,
  };
}

/**
 * Validate apartment access
 */
export function validateApartmentAccess(
  userContext: ApartmentUserContext
): boolean {
  const apartmentConfig = getApartmentConfig();
  return userContext.companyId === apartmentConfig.companyId;
}

/**
 * Get apartment-specific error messages
 */
export function getApartmentErrorMessage(error: string): string {
  const apartmentConfig = getApartmentConfig();

  const errorMessages: { [key: string]: string } = {
    'User authentication required': `Please log in to access ${apartmentConfig.companyName}`,
    'User not found': 'User account not found',
    'User does not belong to this apartment': `Access denied. This account does not belong to ${apartmentConfig.companyName}`,
    'User account is inactive':
      'Your account has been deactivated. Please contact support.',
    'Invalid subscription plan':
      'Your subscription plan is invalid. Please contact support.',
  };

  return errorMessages[error] || error;
}

/**
 * Check if feature is enabled for this apartment
 */
export function isFeatureEnabled(featureName: string): boolean {
  const apartmentConfig = getApartmentConfig();
  return (
    apartmentConfig.features[
      featureName as keyof typeof apartmentConfig.features
    ] || false
  );
}

/**
 * Get apartment branding information
 */
export function getApartmentBranding() {
  const apartmentConfig = getApartmentConfig();
  return apartmentConfig.branding;
}

/**
 * Get apartment contact information
 */
export function getApartmentContact() {
  const apartmentConfig = getApartmentConfig();
  return apartmentConfig.contact;
}

/**
 * Get apartment SEO information
 */
export function getApartmentSEO() {
  const apartmentConfig = getApartmentConfig();
  return apartmentConfig.seo;
}
