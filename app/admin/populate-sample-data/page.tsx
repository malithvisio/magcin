'use client';

import { useState } from 'react';

export default function PopulateSampleData() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const populatePackages = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/packages/populate-sample-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to populate packages data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const populateActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/activities/populate-sample-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to populate activities data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const populateAll = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Populate packages first
      const packagesResponse = await fetch(
        '/api/packages/populate-sample-data',
        {
          method: 'POST',
        }
      );
      const packagesData = await packagesResponse.json();

      // Populate activities
      const activitiesResponse = await fetch(
        '/api/activities/populate-sample-data',
        {
          method: 'POST',
        }
      );
      const activitiesData = await activitiesResponse.json();

      if (packagesResponse.ok && activitiesResponse.ok) {
        setResult({
          packages: packagesData,
          activities: activitiesData,
          message: 'All sample data populated successfully',
        });
      } else {
        setError('Failed to populate some data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6'>Populate Sample Data</h1>

      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <h2 className='text-lg font-semibold text-blue-800 mb-2'>
          What this does:
        </h2>
        <ul className='text-blue-700 space-y-1'>
          <li>
            • Creates sample categories (Cultural Tours, Adventure Tours, etc.)
          </li>
          <li>• Creates sample packages for each category</li>
          <li>
            • Creates sample activities (Mountain Trekking, Wildlife Safari,
            etc.)
          </li>
          <li>• Uses the default root user ID for data isolation</li>
          <li>
            • All data will be published and ready for the tours and activities
            pages
          </li>
        </ul>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <button
          onClick={populatePackages}
          disabled={loading}
          className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? 'Populating...' : 'Populate Packages'}
        </button>

        <button
          onClick={populateActivities}
          disabled={loading}
          className='bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? 'Populating...' : 'Populate Activities'}
        </button>

        <button
          onClick={populateAll}
          disabled={loading}
          className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? 'Populating...' : 'Populate All'}
        </button>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
          <p className='text-red-700'>{error}</p>
        </div>
      )}

      {result && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-green-800 mb-2'>
            Success!
          </h3>
          <pre className='text-green-700 text-sm overflow-auto'>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
