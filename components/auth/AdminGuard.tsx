'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAdmin, isRootUser, isLoading, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;

    // Wait for authentication to load
    if (isLoading) return;

    // Check if user is authenticated and has admin privileges
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/signin');
      return;
    }

    // Check if user has admin or root user privileges
    if (!isAdmin && !isRootUser) {
      console.log('User does not have admin privileges, redirecting to login');
      router.push('/signin');
      return;
    }

    // Log successful authentication
    console.log(
      'Admin access granted for user:',
      user.email,
      'Role:',
      user.role
    );
    console.log('Company ID:', user.companyId);
    console.log('Tenant ID:', user.tenantId);
  }, [user, isAdmin, isRootUser, isLoading, router, mounted]);

  // Prevent hydration mismatch by not rendering auth-dependent content on server
  if (!mounted) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!user || (!isAdmin && !isRootUser)) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has admin privileges
  return <>{children}</>;
}
