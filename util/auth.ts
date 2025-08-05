// Simple authentication utility for frontend
// This works with your existing bcrypt-based authentication

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isRootUser?: boolean;
  companyId?: string;
  tenantId: string;
  subscriptionPlan: string;
  companyName?: string;
}

class AuthService {
  private user: User | null = null;

  // Set user after login
  setUser(user: User) {
    this.user = user;
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Get current user
  getUser(): User | null {
    if (!this.user) {
      const stored = localStorage.getItem('user');
      if (stored) {
        this.user = JSON.parse(stored);
      }
    }
    return this.user;
  }

  // Get headers for API requests
  getHeaders(): HeadersInit {
    const user = this.getUser();
    if (!user) {
      return {};
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-user-id': user.id,
      'x-user-email': user.email,
      'x-tenant-id': user.tenantId,
    };

    // Add company ID if available
    if (user.companyId) {
      headers['x-company-id'] = user.companyId;
    }

    // Add root user ID if user is a root user
    if (user.isRootUser) {
      headers['x-root-user-id'] = user.id;
    }

    return headers;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }

  // Check if user is admin or root user
  isAdmin(): boolean {
    const user = this.getUser();
    return (
      user?.role === 'admin' ||
      user?.role === 'root_user' ||
      user?.role === 'super_admin'
    );
  }

  // Check if user is root user
  isRootUser(): boolean {
    const user = this.getUser();
    return user?.isRootUser === true || user?.role === 'root_user';
  }

  // Logout
  logout() {
    this.user = null;
    localStorage.removeItem('user');
  }

  // Login function
  async login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.setUser(data.user);
    return data.user;
  }

  // Make authenticated API request
  async authenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = this.getHeaders();

    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  }
}

// Export singleton instance
export const authService = new AuthService();

// Helper function to make authenticated requests
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return authService.authenticatedRequest(url, options);
}
