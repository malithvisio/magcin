import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import User, { subscriptionLimits } from '@/models/User';

export interface UserContext {
  userId: string;
  rootUserId: string; // Add rootUserId for multi-tenant isolation
  companyId: string;
  tenantId: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  role: string;
  email: string;
  name: string;
}

export interface SubscriptionLimits {
  packages: number;
  destinations: number;
  activities: number;
  blogs: number;
  teamMembers: number;
  testimonials: number;
}

/**
 * Extract user context from request headers
 * This is a simplified version that works with your current auth system
 */
export async function getUserContext(
  request: NextRequest
): Promise<UserContext> {
  try {
    // For now, we'll use a simple approach - you can enhance this later
    // This assumes you have user info in headers or cookies
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const rootUserId = request.headers.get('x-root-user-id');

    console.log('getUserContext - Headers received:', {
      userId,
      userEmail,
      rootUserId,
      allHeaders: Object.fromEntries(request.headers.entries()),
    });

    if (!userId || !userEmail) {
      throw new Error('User authentication required');
    }

    // Validate that userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid ObjectId format:', userId);
      throw new Error('Invalid user ID format');
    }

    const user = await User.findById(userId);

    if (!user) {
      console.error('User not found for ID:', userId);
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // Determine the effective root user ID
    let effectiveRootUserId: string;
    if (rootUserId) {
      // If rootUserId is provided in headers, use it
      effectiveRootUserId = rootUserId;
      console.log(
        'getUserContext - Using rootUserId from headers:',
        rootUserId
      );
    } else if (user.isRootUser) {
      // If user is a root user but no rootUserId in headers, use their own ID
      effectiveRootUserId = (user._id as any).toString();
      console.log(
        'getUserContext - Using user ID as rootUserId (user is root user):',
        effectiveRootUserId
      );
    } else {
      // Otherwise, use the effective root user ID from the user object
      effectiveRootUserId = user.getEffectiveRootUserId().toString();
      console.log(
        'getUserContext - Using effective root user ID from user object:',
        effectiveRootUserId
      );
    }

    console.log('getUserContext - User found:', {
      userId: (user._id as any).toString(),
      email: user.email,
      companyId: user.companyId,
      tenantId: user.tenantId,
      role: user.role,
      isRootUser: user.isRootUser,
      effectiveRootUserId: effectiveRootUserId,
    });

    // Validate that user has required fields
    if (!user.companyId) {
      console.error('User missing companyId:', user._id);
      throw new Error(
        'User account is missing company ID. Please contact support.'
      );
    }

    if (!user.tenantId) {
      console.error('User missing tenantId:', user._id);
      throw new Error(
        'User account is missing tenant ID. Please contact support.'
      );
    }

    return {
      userId: (user._id as any).toString(),
      rootUserId: effectiveRootUserId,
      companyId: user.companyId,
      tenantId: user.tenantId,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      role: user.role,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    console.error('getUserContext - Error:', error);
    throw new Error(
      `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if user can create a specific type of content
 */
export async function canCreateContent(
  rootUserId: string,
  contentType: keyof SubscriptionLimits
): Promise<{
  canCreate: boolean;
  remaining: number | string;
  limit: number | string;
}> {
  const user = await User.findById(rootUserId);

  if (!user) {
    throw new Error('Root user not found');
  }

  const canCreate = user.canCreateItem(contentType);
  const remaining = user.getRemainingQuota(contentType);
  const limit =
    user.subscriptionPlan === 'pro_max'
      ? 'Unlimited'
      : subscriptionLimits[
          user.subscriptionPlan as keyof typeof subscriptionLimits
        ][contentType];

  return {
    canCreate,
    remaining,
    limit,
  };
}

/**
 * Increment usage for a specific content type
 */
export async function incrementUsage(
  rootUserId: string,
  contentType: keyof SubscriptionLimits
): Promise<boolean> {
  const user = await User.findById(rootUserId);

  if (!user) {
    throw new Error('Root user not found');
  }

  return user.incrementUsage(contentType);
}

/**
 * Decrement usage for a specific content type
 */
export async function decrementUsage(
  rootUserId: string,
  contentType: keyof SubscriptionLimits
): Promise<boolean> {
  const user = await User.findById(rootUserId);

  if (!user) {
    throw new Error('Root user not found');
  }

  return user.decrementUsage(contentType);
}

/**
 * Get user's current usage statistics
 */
export async function getUserUsageStats(rootUserId: string) {
  const user = await User.findById(rootUserId);

  if (!user) {
    throw new Error('Root user not found');
  }

  const limits =
    subscriptionLimits[
      user.subscriptionPlan as keyof typeof subscriptionLimits
    ];

  return {
    currentUsage: user.usageStats,
    limits,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus,
  };
}

/**
 * Check if user has super admin privileges
 */
export function isSuperAdmin(role: string): boolean {
  return role === 'super_admin';
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(role: string): boolean {
  return role === 'admin' || role === 'super_admin';
}

/**
 * Validate tenant access for super admin operations
 */
export async function validateSuperAdminAccess(
  superAdminId: string,
  targetCompanyId: string
): Promise<boolean> {
  const superAdmin = await User.findById(superAdminId);

  if (!superAdmin || superAdmin.role !== 'super_admin') {
    return false;
  }

  // Super admins can access any company
  return true;
}

/**
 * Generate company-specific query filter
 */
export function createCompanyFilter(companyId: string) {
  return {
    companyId,
  };
}

/**
 * Generate user-specific query filter within company
 */
export function createUserFilter(userId: string, companyId: string) {
  return {
    userId,
    companyId,
  };
}

/**
 * Create tenant filter for data isolation
 * This ensures all data belongs to the specific tenant/user
 */
export function createTenantFilter(
  userId: string,
  tenantId: string,
  companyId?: string
) {
  const filter: any = {
    userId,
    tenantId,
  };

  if (companyId) {
    filter.companyId = companyId;
  }

  return filter;
}

/**
 * Create pagination options with company filtering
 */
export function createCompanyPaginationOptions(
  page: number = 1,
  limit: number = 10,
  companyId: string
) {
  return {
    filter: createCompanyFilter(companyId),
    options: {
      skip: (page - 1) * limit,
      limit,
      sort: { createdAt: -1 },
    },
  };
}

/**
 * Create pagination options with user filtering within company
 */
export function createUserPaginationOptions(
  page: number = 1,
  limit: number = 10,
  userId: string,
  companyId: string
) {
  return {
    filter: createUserFilter(userId, companyId),
    options: {
      skip: (page - 1) * limit,
      limit,
      sort: { createdAt: -1 },
    },
  };
}

/**
 * Create root user filter for data isolation
 * This ensures all data belongs to the specific root user
 */
export function createRootUserFilter(rootUserId: string) {
  return {
    rootUserId,
  };
}

/**
 * Create pagination options with root user filtering
 */
export function createRootUserPaginationOptions(
  page: number = 1,
  limit: number = 10,
  rootUserId: string
) {
  return {
    filter: createRootUserFilter(rootUserId),
    options: {
      skip: (page - 1) * limit,
      limit,
      sort: { createdAt: -1 },
    },
  };
}

/**
 * Get subscription error message
 */
export function getSubscriptionErrorMessage(
  contentType: keyof SubscriptionLimits
): string {
  const messages = {
    packages: 'Package limit reached. Please upgrade your subscription.',
    destinations:
      'Destination limit reached. Please upgrade your subscription.',
    activities: 'Activity limit reached. Please upgrade your subscription.',
    blogs: 'Blog limit reached. Please upgrade your subscription.',
    teamMembers: 'Team member limit reached. Please upgrade your subscription.',
    testimonials:
      'Testimonial limit reached. Please upgrade your subscription.',
  };

  return (
    messages[contentType] ||
    'Content limit reached. Please upgrade your subscription.'
  );
}

/**
 * Validate subscription status
 */
export function validateSubscriptionStatus(status: string): boolean {
  return ['active'].includes(status);
}

/**
 * Get subscription status error message
 */
export function getSubscriptionStatusError(status: string): string | null {
  const errorMessages = {
    inactive: 'Your subscription is inactive. Please contact support.',
    suspended: 'Your subscription is suspended. Please contact support.',
    cancelled: 'Your subscription is cancelled. Please renew to continue.',
  };

  return errorMessages[status as keyof typeof errorMessages] || null;
}
