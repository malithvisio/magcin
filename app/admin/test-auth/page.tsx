'use client';
import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/util/api-utils';

export default function TestAuthPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (
    test: string,
    success: boolean,
    message: string,
    data?: any
  ) => {
    setTestResults(prev => [
      ...prev,
      { test, success, message, data, timestamp: new Date().toISOString() },
    ]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Check if we can get user from storage
      const user = localStorage.getItem('user');
      addResult(
        'User Storage',
        !!user,
        user ? 'User found in storage' : 'No user in storage',
        user
      );

      // Test 2: Test team members API
      try {
        const response = await apiRequest('/api/team');
        const data = await response.json();
        addResult(
          'Team Members API',
          response.ok,
          response.ok ? 'Success' : 'Failed',
          { status: response.status, data }
        );
      } catch (error: any) {
        addResult('Team Members API', false, `Error: ${error.message}`);
      }

      // Test 3: Test creating a team member
      try {
        const testTeamData = {
          name: 'Test Member',
          position: 'Test Position',
          published: true,
        };
        const response = await apiRequest('/api/team', {
          method: 'POST',
          body: JSON.stringify(testTeamData),
        });
        const data = await response.json();
        addResult(
          'Create Team Member',
          response.ok,
          response.ok ? 'Success' : 'Failed',
          { status: response.status, data }
        );
      } catch (error: any) {
        addResult('Create Team Member', false, `Error: ${error.message}`);
      }
    } catch (error: any) {
      addResult('Test Suite', false, `Test suite error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 24 }}>
        <div style={{ marginBottom: 16, fontSize: 16, color: '#333' }}>
          &gt;&gt;&gt; Authentication Test &gt;
        </div>
        <div style={{ borderBottom: '1px solid #ccc', marginBottom: 24 }} />

        <div style={{ marginBottom: 24 }}>
          <button
            onClick={runTests}
            disabled={loading}
            style={{
              background: loading ? '#94a3b8' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 16,
            }}
          >
            {loading ? 'Running Tests...' : 'Run Authentication Tests'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16, color: '#333' }}>Test Results:</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  background: result.success ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: result.success ? '#166534' : '#dc2626',
                    marginBottom: 8,
                  }}
                >
                  {result.test} - {result.success ? 'PASS' : 'FAIL'}
                </div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                  {result.message}
                </div>
                {result.data && (
                  <details style={{ fontSize: 12, color: '#666' }}>
                    <summary>View Data</summary>
                    <pre
                      style={{
                        background: '#f8f9fa',
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 8,
                        overflow: 'auto',
                      }}
                    >
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
                <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
