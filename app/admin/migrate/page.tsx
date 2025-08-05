'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/util/api-utils';

export default function MigratePage() {
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runMigration = async (type: 'categories' | 'packages' | 'team') => {
    setMigrating(true);
    try {
      const response = await apiRequest(`/api/${type}/migrate`, {
        method: 'POST',
      });
      const data = await response.json();
      setResults({ type, ...data });
    } catch (error) {
      console.error(`Migration error:`, error);
      setResults({ type, error: 'Migration failed' });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <h1>Data Migration</h1>
        <p>
          Run migration to fix existing data that doesn't have rootUserId set.
        </p>

        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => runMigration('categories')}
            disabled={migrating}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              marginRight: 12,
              cursor: migrating ? 'not-allowed' : 'pointer',
            }}
          >
            {migrating ? 'Migrating...' : 'Migrate Categories'}
          </button>

          <button
            onClick={() => runMigration('packages')}
            disabled={migrating}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              marginRight: 12,
              cursor: migrating ? 'not-allowed' : 'pointer',
            }}
          >
            {migrating ? 'Migrating...' : 'Migrate Packages'}
          </button>

          <button
            onClick={() => runMigration('team')}
            disabled={migrating}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              cursor: migrating ? 'not-allowed' : 'pointer',
            }}
          >
            {migrating ? 'Migrating...' : 'Migrate Team Members'}
          </button>
        </div>

        {results && (
          <div
            style={{
              background: results.error ? '#fee' : '#efe',
              border: `1px solid ${results.error ? '#fcc' : '#cfc'}`,
              borderRadius: 8,
              padding: 16,
              marginTop: 16,
            }}
          >
            <h3>Migration Results for {results.type}</h3>
            {results.error ? (
              <p style={{ color: '#c00' }}>Error: {results.error}</p>
            ) : (
              <div>
                <p>Message: {results.message}</p>
                <p>Migrated: {results.migrated}</p>
                <p>Total: {results.total}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
