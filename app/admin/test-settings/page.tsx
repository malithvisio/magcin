'use client';
import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/util/api-utils';

export default function TestSettings() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<string>('');

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

  const testSettingsSave = async () => {
    setLoading(true);
    setTestResult('Testing settings save...');

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
        `User found: ${user.email}\nRoot User ID: ${user.rootUserId}\nCompany ID: ${user.companyId}\nTenant ID: ${user.tenantId}`
      );

      // Test saving settings
      const testSettings = {
        companyName: 'Test Company Settings',
        companyDescription: 'This is a test company description',
        homePageTabTitle: 'Test Home Page Title',
        phoneNumber: '+1234567890',
        whatsappNumber: '+1234567890',
        emailAddress: 'test@example.com',
        hotlineAssistantName: 'Test Assistant',
        currencyType: 'USD',
        logoImage: 'https://example.com/logo.png',
        faviconIcon: 'https://example.com/favicon.ico',
        websites: [
          {
            type: 'facebook',
            url: 'https://facebook.com/testcompany',
          },
          {
            type: 'instagram',
            url: 'https://instagram.com/testcompany',
          },
        ],
      };

      const response = await apiRequest('/api/settings', {
        method: 'POST',
        body: testSettings,
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult(
          `✅ Settings saved successfully!\nSettings ID: ${data.settings._id}\nRoot User ID: ${data.settings.rootUserId}\nCompany ID: ${data.settings.companyId}\nTenant ID: ${data.settings.tenantId}`
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

  const testSettingsLoad = async () => {
    setLoading(true);
    setTestResult('Testing settings load...');

    try {
      const response = await apiRequest('/api/settings');
      const data = await response.json();

      if (response.ok) {
        setTestResult(
          `✅ Settings loaded successfully!\nSettings ID: ${data._id}\nRoot User ID: ${data.rootUserId}\nCompany ID: ${data.companyId}\nTenant ID: ${data.tenantId}\nCompany Name: ${data.companyName}`
        );
      } else {
        setTestResult(`❌ Error: ${data.error || data.message}`);
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
        <h1>Settings Test Page</h1>
        <p>
          This page tests the settings functionality with root user reference.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <h3>User Data</h3>
          <button
            onClick={checkUserData}
            style={{
              padding: '0.5rem 1rem',
              marginBottom: '1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Check User Data
          </button>
          {userData && (
            <pre
              style={{
                background: '#f3f4f6',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '300px',
              }}
            >
              {userData}
            </pre>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3>Settings Tests</h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={testSettingsSave}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Testing...' : 'Test Save Settings'}
            </button>
            <button
              onClick={testSettingsLoad}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Testing...' : 'Test Load Settings'}
            </button>
          </div>
          {testResult && (
            <pre
              style={{
                background: '#f3f4f6',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '300px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {testResult}
            </pre>
          )}
        </div>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#fef3c7',
            borderRadius: '4px',
          }}
        >
          <h4>Instructions:</h4>
          <ol>
            <li>First, make sure you are logged in as a root user</li>
            <li>Click "Check User Data" to verify your user information</li>
            <li>
              Click "Test Save Settings" to create test settings with root user
              reference
            </li>
            <li>
              Click "Test Load Settings" to verify the settings are loaded
              correctly
            </li>
            <li>Check the console for detailed API request/response logs</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
}
