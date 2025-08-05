'use client';

import { useRootUserData } from '@/util/useRootUserFilter';
import { generateTourDetailUrl } from '@/util/package-utils';
import Link from 'next/link';

interface TourPackage {
  _id: string;
  id: string;
  title: string;
  name: string;
  image: string;
  category: {
    _id: string;
    name: string;
  };
}

interface PackageResponse {
  packages: TourPackage[];
  pagination: any;
  rootUserId: string;
}

export default function PackagesList() {
  const { data, isLoading, error } = useRootUserData<PackageResponse>(
    async queryParam => {
      const response = await fetch(
        `/api/packages/public?limit=50&${queryParam}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      return response.json();
    },
    []
  );

  if (isLoading) {
    return (
      <div className='container py-5'>
        <h1>Loading packages...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container py-5'>
        <h1>Error loading packages</h1>
        <p>{error}</p>
      </div>
    );
  }

  const packages = data?.packages || [];

  return (
    <div className='container py-5'>
      <h1>Available Packages</h1>
      <p>Total packages: {packages.length}</p>

      <div className='row'>
        {packages.map(pkg => (
          <div key={pkg._id} className='col-md-6 col-lg-4 mb-4'>
            <div className='card'>
              <div className='card-body'>
                <h5 className='card-title'>{pkg.name}</h5>
                <p className='card-text'>{pkg.title}</p>
                <p className='card-text'>
                  <small className='text-muted'>
                    Category: {pkg.category?.name}
                  </small>
                </p>
                <p className='card-text'>
                  <strong>Package ID:</strong> {pkg.id}
                </p>
                <p className='card-text'>
                  <strong>MongoDB ID:</strong> {pkg._id}
                </p>
                <Link
                  href={generateTourDetailUrl(pkg)}
                  className='btn btn-primary'
                >
                  View Details (Name URL)
                </Link>
                <br />
                <Link
                  href={`/tour-detail/${pkg.id}`}
                  className='btn btn-secondary mt-2'
                >
                  View Details (ID URL)
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
