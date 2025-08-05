'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { getCurrentRootUserId } from '@/util/root-user-config';

interface Destination {
  _id: string;
  id: string;
  name: string;
  images: string[];
  location: string;
  description: string;
  mini_description: string;
  published: boolean;
  to_do: string;
  Highlight: string[];
  call_tagline: string;
  background: string;
  moredes: string;
  position: number;
  highlight: boolean;
}

export default function DestinationDisplay() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError('');

        // Get the current root user ID from the config
        const rootUserId = getCurrentRootUserId();

        console.log('Fetching destinations for root user:', rootUserId);

        const response = await fetch(
          `/api/destinations/public?rootUserId=${rootUserId}&limit=100`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.destinations) {
          setDestinations(data.destinations);
        } else {
          setDestinations([]);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setError('Failed to load destinations');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='container py-5 text-center'>
          <div className='bg-blue-50 rounded-lg p-8 shadow-sm border border-blue-200'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-blue-700 text-lg font-medium'>
              Loading destinations...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='container py-5 text-center'>
          <div className='bg-red-50 rounded-lg p-8 shadow-sm border border-red-200'>
            <p className='text-red-700 text-lg font-medium'>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerStyle={1} footerStyle={2}>
      <main className='main'>
        {/* Breadcrumb Section */}
        <section className='box-section box-breadcrumb background-body'>
          <div className='container'>
            <ul className='breadcrumbs'>
              <li>
                <Link href='/'>Home</Link>
                <span className='arrow-right'>
                  <svg
                    width={7}
                    height={12}
                    viewBox='0 0 7 12'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M1 11L6 6L1 1'
                      stroke=''
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      fill='none'
                    />
                  </svg>
                </span>
              </li>
              <li>
                <span className='text-breadcrumb'>Destinations</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Header Section */}
        <section className='box-section box-hero background-body'>
          <div className='container'>
            <div className='row'>
              <div className='col-lg-12'>
                <div className='box-hero-content text-center'>
                  <h1 className='hero-title wow fadeInUp'>
                    Explore Our Destinations
                  </h1>
                  <p className='hero-desc wow fadeInUp' data-wow-delay='0.1s'>
                    Discover amazing places and unforgettable experiences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations Grid Section */}
        <section className='box-section box-list-featured background-body'>
          <div className='container'>
            {destinations.length === 0 ? (
              <div className='text-center py-8'>
                <div className='bg-gray-50 rounded-lg p-8 shadow-sm border border-gray-200'>
                  <p className='text-gray-600 text-lg'>
                    No destinations found. Please check back later.
                  </p>
                </div>
              </div>
            ) : (
              <div className='box-list-featured'>
                <div className='row'>
                  {destinations.map((destination, index) => (
                    <div
                      key={destination._id || index}
                      className='col-xl-3 col-lg-4 col-md-6 wow fadeInUp'
                      data-wow-delay={`${index * 0.1}s`}
                    >
                      <div className='card-spot background-card'>
                        <div className='card-image'>
                          <Link href={`/destination-detail/${destination._id}`}>
                            <img
                              src={
                                destination.images &&
                                destination.images.length > 0
                                  ? destination.images[0]
                                  : '/assets/imgs/page/homepage5/spot1.png'
                              }
                              alt={destination.name}
                              style={{ height: '350px', objectFit: 'cover' }}
                            />
                          </Link>
                        </div>
                        <div className='card-info background-card'>
                          <div className='card-left'>
                            <div className='card-title'>
                              <Link
                                href={`/destination-detail/${destination._id}`}
                              >
                                {destination.name}
                              </Link>
                            </div>
                            <div className='card-desc'>
                              <Link
                                href={`/destination-detail/${destination._id}`}
                              >
                                {destination.Highlight?.length || 0} +
                                Activities
                              </Link>
                            </div>
                            {destination.location && (
                              <div className='card-location text-sm text-gray-600 mt-2'>
                                📍 {destination.location}
                              </div>
                            )}
                          </div>
                          <div className='card-right'>
                            <div className='card-button'>
                              <Link
                                href={`/destination-detail/${destination._id}`}
                              >
                                <svg
                                  width={10}
                                  height={10}
                                  viewBox='0 0 10 10'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M5.00011 9.08347L9.08347 5.00011L5.00011 0.916748M9.08347 5.00011L0.916748 5.00011'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
