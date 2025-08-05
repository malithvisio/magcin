import { NextRequest } from 'next/server';
import User from '@/models/User';

// Types for apartment management
export interface ApartmentContext {
  rootUserId: string;
  companyId: string;
  tenantId: string;
  isRootUser: boolean;
  userRole: string;
}

export interface ApartmentFilter {
  rootUserId: string;
  companyId: string;
  tenantId: string;
}

// Get apartment context from request headers or session
export async function getApartmentContext(
  req: NextRequest
): Promise<ApartmentContext | null> {
  try {
    // Get user info from headers or session
    const userId = req.headers.get('x-user-id');
    const companyId = req.headers.get('x-company-id');
    const tenantId = req.headers.get('x-tenant-id');

    if (!userId || !companyId || !tenantId) {
      return null;
    }

    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    return {
      rootUserId: user.getEffectiveRootUserId().toString(),
      companyId: user.companyId,
      tenantId: user.tenantId,
      isRootUser: user.isRootUser,
      userRole: user.role,
    };
  } catch (error) {
    console.error('Error getting apartment context:', error);
    return null;
  }
}

// Get apartment filter for database queries
export function getApartmentFilter(context: ApartmentContext): ApartmentFilter {
  return {
    rootUserId: context.rootUserId,
    companyId: context.companyId,
    tenantId: context.tenantId,
  };
}

// Check if user has access to apartment data
export function hasApartmentAccess(
  userContext: ApartmentContext,
  targetRootUserId: string
): boolean {
  return userContext.rootUserId === targetRootUserId;
}

// Validate apartment ownership
export async function validateApartmentOwnership(
  rootUserId: string,
  companyId: string
): Promise<boolean> {
  try {
    const rootUser = await User.findOne({
      _id: rootUserId,
      companyId,
      isRootUser: true,
    });
    return !!rootUser;
  } catch (error) {
    console.error('Error validating apartment ownership:', error);
    return false;
  }
}

// Get all members of an apartment
export async function getApartmentMembers(rootUserId: string): Promise<any[]> {
  try {
    return await User.find({
      rootUserId,
      isRootUser: false,
    }).select('-password');
  } catch (error) {
    console.error('Error getting apartment members:', error);
    return [];
  }
}

// Check if user can perform action in apartment
export function canPerformAction(
  context: ApartmentContext,
  action: string
): boolean {
  const { isRootUser, userRole } = context;

  switch (action) {
    case 'create_package':
    case 'edit_package':
    case 'delete_package':
    case 'create_destination':
    case 'edit_destination':
    case 'delete_destination':
    case 'create_blog':
    case 'edit_blog':
    case 'delete_blog':
    case 'create_team_member':
    case 'edit_team_member':
    case 'delete_team_member':
    case 'create_activity':
    case 'edit_activity':
    case 'delete_activity':
    case 'create_testimonial':
    case 'edit_testimonial':
    case 'delete_testimonial':
    case 'manage_settings':
      return isRootUser || userRole === 'admin';

    case 'view_analytics':
    case 'manage_members':
    case 'manage_subscription':
      return isRootUser;

    case 'view_data':
      return true; // All members can view data

    default:
      return false;
  }
}

// Get database query filter for apartment data
export function getApartmentDataFilter(
  context: ApartmentContext,
  additionalFilters: any = {}
) {
  return {
    rootUserId: context.rootUserId,
    companyId: context.companyId,
    tenantId: context.tenantId,
    ...additionalFilters,
  };
}

// Update usage stats for root user
export async function updateRootUserUsage(
  rootUserId: string,
  itemType: string,
  increment: boolean = true
): Promise<boolean> {
  try {
    const rootUser = await User.findById(rootUserId);
    if (!rootUser || !rootUser.isRootUser) {
      return false;
    }

    if (increment) {
      return rootUser.incrementUsage(itemType as any);
    } else {
      return rootUser.decrementUsage(itemType as any);
    }
  } catch (error) {
    console.error('Error updating root user usage:', error);
    return false;
  }
}

// Get apartment statistics
export async function getApartmentStats(rootUserId: string) {
  try {
    const rootUser = await User.findById(rootUserId);
    if (!rootUser || !rootUser.isRootUser) {
      return null;
    }

    const members = await User.countDocuments({
      rootUserId,
      isRootUser: false,
    });

    return {
      subscriptionPlan: rootUser.subscriptionPlan,
      subscriptionStatus: rootUser.subscriptionStatus,
      usageStats: rootUser.usageStats,
      memberCount: members,
      apartmentName: rootUser.apartmentName,
      apartmentDescription: rootUser.apartmentDescription,
    };
  } catch (error) {
    console.error('Error getting apartment stats:', error);
    return null;
  }
}

// Create apartment filter for API routes
export function createApartmentFilter(
  req: NextRequest
): ApartmentFilter | null {
  const rootUserId = req.headers.get('x-root-user-id');
  const companyId = req.headers.get('x-company-id');
  const tenantId = req.headers.get('x-tenant-id');

  if (!rootUserId || !companyId || !tenantId) {
    return null;
  }

  return {
    rootUserId,
    companyId,
    tenantId,
  };
}

// Validate apartment access for API routes
export async function validateApartmentAccess(
  req: NextRequest,
  targetRootUserId?: string
): Promise<{ valid: boolean; context?: ApartmentContext }> {
  const context = await getApartmentContext(req);

  if (!context) {
    return { valid: false };
  }

  if (targetRootUserId && !hasApartmentAccess(context, targetRootUserId)) {
    return { valid: false };
  }

  return { valid: true, context };
}
