// Root User Configuration for Multi-Tenant Data Filtering
// This file manages different root users and their data isolation

export interface RootUserConfig {
  rootUserId: string;
  name: string;
  description: string;
  isActive: boolean;
}

// Available Root Users Configuration
export const ROOT_USERS: RootUserConfig[] = [
  {
    rootUserId: '688b1b9f8210bd7e4dc87894',
    name: 'Mag SriLanka Tours ',
    description: 'Discover amazing travel stories',
    isActive: true,
  },
  // Example of how to add another root user
  // Uncomment and modify the following to add a new tourism company:
  // {
  //   rootUserId: '507f1f77bcf86cd799439011', // Replace with actual MongoDB ObjectId
  //   name: 'Adventure Tourism Co.',
  //   description: 'Adventure tourism company with exciting outdoor experiences',
  //   isActive: true,
  // },
  // {
  //   rootUserId: '507f1f77bcf86cd799439012', // Replace with actual MongoDB ObjectId
  //   name: 'Cultural Tours Ltd.',
  //   description: 'Cultural tourism company specializing in heritage tours',
  //   isActive: true,
  // },
];

// Default root user (first one in the list)
export const DEFAULT_ROOT_USER_ID =
  ROOT_USERS[0]?.rootUserId || '68786e4cd6e23d3a8ec0fe34';

// Get current root user ID from localStorage or use default
export function getCurrentRootUserId(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('currentRootUserId');
    if (stored && ROOT_USERS.some(user => user.rootUserId === stored)) {
      return stored;
    }
  }
  return DEFAULT_ROOT_USER_ID;
}

// Set current root user ID
export function setCurrentRootUserId(rootUserId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentRootUserId', rootUserId);
  }
}

// Get root user config by ID
export function getRootUserConfig(
  rootUserId: string
): RootUserConfig | undefined {
  return ROOT_USERS.find(user => user.rootUserId === rootUserId);
}

// Get all active root users
export function getActiveRootUsers(): RootUserConfig[] {
  return ROOT_USERS.filter(user => user.isActive);
}

// Validate root user ID
export function isValidRootUserId(rootUserId: string): boolean {
  return ROOT_USERS.some(
    user => user.rootUserId === rootUserId && user.isActive
  );
}

// Get root user name by ID
export function getRootUserName(rootUserId: string): string {
  const config = getRootUserConfig(rootUserId);
  return config?.name || 'Unknown User';
}

// Create database filter for root user
export function createRootUserFilter(rootUserId?: string): {
  rootUserId: string;
} {
  const currentRootUserId = rootUserId || getCurrentRootUserId();
  return { rootUserId: currentRootUserId };
}

// Create API query parameter for root user
export function createRootUserQueryParam(rootUserId?: string): string {
  const currentRootUserId = rootUserId || getCurrentRootUserId();
  return `rootUserId=${currentRootUserId}`;
}
