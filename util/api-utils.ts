/**
 * Utility functions for making authenticated API requests
 */

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Add authentication headers to API requests
 */
export function addAuthHeaders(
  user: any,
  existingHeaders: Record<string, string> = {}
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...existingHeaders,
  };

  console.log('=== AUTH HEADERS DEBUG ===');
  console.log('User object:', user);
  console.log('Existing headers:', existingHeaders);

  if (user) {
    // Handle both possible user ID field names
    const userId = user.id || user._id;
    const userEmail = user.email;

    if (userId) {
      headers['x-user-id'] = userId;
    }
    if (userEmail) {
      headers['x-user-email'] = userEmail;
    }
    if (user.companyId) {
      headers['x-company-id'] = user.companyId;
    }
    if (user.tenantId) {
      headers['x-tenant-id'] = user.tenantId;
    }

    // Handle rootUserId - for root users, use their own ID, for members use their rootUserId
    let rootUserId = user.rootUserId;
    if (user.isRootUser || user.role === 'root_user') {
      // For root users, rootUserId should be their own ID
      rootUserId = userId;
    }

    if (rootUserId) {
      headers['x-root-user-id'] = rootUserId;
    }
  }

  console.log('Final headers:', headers);
  return headers;
}

/**
 * Make an authenticated API request
 */
export async function authenticatedFetch(
  url: string,
  user: any,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const headers = addAuthHeaders(user, options.headers);

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
    ...options,
  };

  // Only stringify if the body is not already a string
  if (options.body) {
    if (typeof options.body === 'string') {
      fetchOptions.body = options.body;
    } else {
      fetchOptions.body = JSON.stringify(options.body);
    }
  }

  return fetch(url, fetchOptions);
}

/**
 * Get user context from localStorage for API requests
 */
export function getUserFromStorage(): any {
  if (typeof window === 'undefined') return null;

  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    localStorage.removeItem('user');
    return null;
  }
}

/**
 * Make API request with current user authentication
 */
export async function apiRequest(
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const user = getUserFromStorage();

  console.log('=== API REQUEST DEBUG ===');
  console.log('URL:', url);
  console.log('Options:', options);
  console.log('User from storage:', user);

  const response = await authenticatedFetch(url, user, options);

  console.log('Response status:', response.status);
  console.log(
    'Response headers:',
    Object.fromEntries(response.headers.entries())
  );

  return response;
}
