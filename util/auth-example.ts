// Example of how to use the authentication service in your frontend
// This shows how to integrate with your existing login system

import { authService, apiRequest } from './auth';

// Example login component
export async function handleLogin(email: string, password: string) {
  try {
    const user = await authService.login(email, password);
    console.log('Login successful:', user);

    // Redirect to admin dashboard or show success message
    window.location.href = '/admin';
  } catch (error) {
    console.error('Login failed:', error);
    // Show error message to user
  }
}

// Example of making authenticated API requests
export async function fetchPackages() {
  try {
    const response = await apiRequest('/api/packages');
    if (response.ok) {
      const data = await response.json();
      return data.packages;
    } else {
      throw new Error('Failed to fetch packages');
    }
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
}

// Example of creating a package with authentication
export async function createPackage(packageData: any) {
  try {
    const response = await apiRequest('/api/packages', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });

    if (response.ok) {
      const data = await response.json();
      return data.package;
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create package');
    }
  } catch (error) {
    console.error('Error creating package:', error);
    throw error;
  }
}

// Example of updating a package
export async function updatePackage(id: string, packageData: any) {
  try {
    const response = await apiRequest(`/api/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });

    if (response.ok) {
      const data = await response.json();
      return data.package;
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update package');
    }
  } catch (error) {
    console.error('Error updating package:', error);
    throw error;
  }
}

// Example of deleting a package
export async function deletePackage(id: string) {
  try {
    const response = await apiRequest(`/api/packages/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      return true;
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete package');
    }
  } catch (error) {
    console.error('Error deleting package:', error);
    throw error;
  }
}

// Example logout function
export function handleLogout() {
  authService.logout();
  // Redirect to login page
  window.location.href = '/signin';
}

// Example of checking if user is authenticated
export function checkAuth() {
  if (!authService.isAuthenticated()) {
    // Redirect to login if not authenticated
    window.location.href = '/signin';
    return false;
  }
  return true;
}

// Example of getting user info
export function getUserInfo() {
  return authService.getUser();
}
