'use client';
import AdminLayout from '@/components/layout/AdminLayout';
import { useState } from 'react';

export default function TestAdmin() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<string>('');
  const [setupResult, setSetupResult] = useState<string>('');

  const checkUserData = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(JSON.stringify(user, null, 2));
      } else {
        setUserData('No user data found in localStorage');
      }
    } catch (error) {
      setUserData(`Error parsing user data: ${error}`);
    }
  };

  const setupTestUser = async () => {
    setSetupResult('Setting up test user...');
    try {
      const response = await fetch('/api/auth/create-root-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Admin User',
          email: 'test@tourstrails.com',
          password: 'TestUser2024!',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSetupResult(
          `✅ Test user created successfully!\nEmail: ${data.user.email}\nCompany ID: ${data.user.companyId}\nTenant ID: ${data.user.tenantId}\n\nPlease log in with:\nEmail: test@tourstrails.com\nPassword: TestUser2024!`
        );
      } else {
        setSetupResult(`❌ Error creating test user: ${data.error}`);
      }
    } catch (error) {
      setSetupResult(`❌ Network error: ${error}`);
    }
  };

  const testBlogCreation = async () => {
    setLoading(true);
    setTestResult('Testing blog creation...');

    try {
      // First check if user is authenticated
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setTestResult('❌ No user found in localStorage. Please log in first.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      setTestResult(
        `User found: ${user.email}\nCompany ID: ${user.companyId}\nTenant ID: ${user.tenantId}`
      );

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id,
          'x-user-email': user.email,
          'x-company-id': user.companyId,
          'x-tenant-id': user.tenantId,
        },
        body: JSON.stringify({
          title: 'Test Blog Post',
          description:
            'This is a test blog post to verify the API works correctly.',
          content: 'This is the full content of the test blog post.',
          author: 'Test Author',
          category: 'Test Category',
          tags: ['test', 'api'],
          published: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult(
          `✅ Blog created successfully! Blog ID: ${data.blog._id}`
        );
      } else {
        setTestResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAnalytics = async () => {
    setLoading(true);
    setTestResult('Testing analytics API...');

    try {
      // First check if user is authenticated
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setTestResult('❌ No user found in localStorage. Please log in first.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      setTestResult(
        `User found: ${user.email}\nCompany ID: ${user.companyId}\nTenant ID: ${user.tenantId}`
      );

      const response = await fetch('/api/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id,
          'x-user-email': user.email,
          'x-company-id': user.companyId,
          'x-tenant-id': user.tenantId,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult(
          `✅ Analytics fetched successfully!\n\nStats:\n` +
            `- Destinations: ${data.stats.destinations.total} (${data.stats.destinations.published} published)\n` +
            `- Packages: ${data.stats.packages.total} (${data.stats.packages.published} published)\n` +
            `- Activities: ${data.stats.activities.total} (${data.stats.activities.published} published)\n` +
            `- Blogs: ${data.stats.blogs.total} (${data.stats.blogs.published} published)\n` +
            `- Testimonials: ${data.stats.testimonials.total} (${data.stats.testimonials.published} published)\n` +
            `- Team: ${data.stats.team.total} (${data.stats.team.published} published)\n\n` +
            `Recent Activities: ${data.recentActivities.length} items`
        );
      } else {
        setTestResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <h1>Test Admin Page</h1>
        <p>If you can see this, the AdminLayout is working!</p>

        <div
          style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
          }}
        >
          <h2>Setup Test User</h2>
          <p>Create a test user with proper authentication:</p>

          <button
            onClick={setupTestUser}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            Setup Test User
          </button>

          {setupResult && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '4px',
                background: setupResult.includes('✅') ? '#d4edda' : '#f8d7da',
                color: setupResult.includes('✅') ? '#155724' : '#721c24',
                border: `1px solid ${setupResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                marginBottom: '1rem',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            >
              <strong>Setup Result:</strong>
              {setupResult}
            </div>
          )}
        </div>

        <div
          style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
          }}
        >
          <h2>User Authentication Test</h2>
          <p>Check the current user data:</p>

          <button
            onClick={checkUserData}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            Check User Data
          </button>

          {userData && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '4px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                marginBottom: '1rem',
                fontFamily: 'monospace',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
              }}
            >
              <strong>User Data:</strong>
              {userData}
            </div>
          )}
        </div>

        <div
          style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
          }}
        >
          <h2>Blog API Test</h2>
          <p>Test the blog creation functionality:</p>

          <button
            onClick={testBlogCreation}
            disabled={loading}
            style={{
              background: loading ? '#ccc' : '#2563eb',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
              marginRight: '0.5rem',
            }}
          >
            {loading ? 'Testing...' : 'Test Blog Creation'}
          </button>

          <button
            onClick={testAnalytics}
            disabled={loading}
            style={{
              background: loading ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
            }}
          >
            {loading ? 'Testing...' : 'Test Analytics API'}
          </button>

          {testResult && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '4px',
                background: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
                color: testResult.includes('✅') ? '#155724' : '#721c24',
                border: `1px solid ${testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            >
              <strong>Test Result:</strong>
              {testResult}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
