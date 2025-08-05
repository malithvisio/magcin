'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import SmartImage from '@/components/SmartImage/page';
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

export default function DestinationPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError(null);

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
          // Filter for only published destinations
          const publishedDestinations = data.destinations.filter(
            (dest: Destination) => dest.published === true
          );
          setDestinations(publishedDestinations);
        } else {
          setDestinations([]);
        }
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load destinations'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='min-h-screen flex items-center justify-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-red-600 mb-4'>
              Error Loading Destinations
            </h2>
            <p className='text-gray-600'>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerStyle={1} footerStyle={2}>
      {/* Hero Section */}
      {/* <section className='relative bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 text-white py-20'>
        <div className='absolute inset-0 bg-black opacity-20'></div>
        <div className='container mx-auto px-4 relative z-10'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-6xl font-bold mb-6 leading-tight'>
              Explore Amazing Destinations
            </h1>
            <p className='text-xl md:text-2xl mb-8 text-emerald-100'>
              Discover the most beautiful places across Sri Lanka
            </p>
            <div className='flex flex-wrap justify-center gap-4'>
              <div className='bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg px-6 py-3 shadow-lg'>
                <span className='text-2xl font-bold text-white'>
                  {destinations.length}
                </span>
                <p className='text-sm text-emerald-100'>Destinations</p>
              </div>
              <div className='bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg px-6 py-3 shadow-lg'>
                <span className='text-2xl font-bold text-white'>
                  {destinations.reduce(
                    (total, dest) => total + (dest.Highlight?.length || 0),
                    0
                  )}
                </span>
                <p className='text-sm text-cyan-100'>Activities Available</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Destinations Grid */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          {destinations.length === 0 ? (
            <div className='text-center py-20'>
              <h2 className='text-3xl font-bold text-gray-800 mb-4'>
                No Destinations Available
              </h2>
              <p className='text-gray-600'>
                Check back later for amazing destinations!
              </p>
            </div>
          ) : (
            <div className='space-y-16'>
              {/* Destinations Header */}
              <div className='text-center mb-12'>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                  Popular Destinations
                </h2>
                <div className='w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full'></div>
              </div>

              {/* Destinations Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {destinations.map((destination, index) => (
                  <div
                    key={destination._id || index}
                    className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden'
                  >
                    {/* Image Container */}
                    <div className='relative overflow-hidden h-48'>
                      <SmartImage
                        src={
                          destination.images && destination.images.length > 0
                            ? destination.images[0]
                            : '/assets/imgs/page/homepage5/spot1.png'
                        }
                        alt={destination.name}
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'></div>

                      {/* Highlight Badge */}
                      {destination.highlight && (
                        <div className='absolute top-4 left-4'>
                          <span className='bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full'>
                            Featured
                          </span>
                        </div>
                      )}

                      {/* Activities Count Badge */}
                      <div className='absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1'>
                        <svg
                          className='w-4 h-4 text-emerald-500 fill-current'
                          viewBox='0 0 20 20'
                        >
                          <path d='M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5l-1.5 1.5a1 1 0 00-.293.707V15a1 1 0 01-1 1h-6a1 1 0 01-1-1v-1.793a1 1 0 00-.293-.707L6.5 10.5H6a1 1 0 01-1-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z' />
                        </svg>
                        <span className='text-sm font-semibold text-gray-800'>
                          {destination.Highlight?.length || 0} Activities
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className='p-6'>
                      {/* Title */}
                      <h3 className='text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors'>
                        <Link href={`/destination-detail/${destination._id}`}>
                          {destination.name}
                        </Link>
                      </h3>

                      {/* Location */}
                      <div className='flex items-center text-gray-600 mb-3'>
                        <svg
                          className='w-4 h-4 mr-2'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                            clipRule='evenodd'
                          />
                        </svg>
                        <span className='text-sm'>{destination.location}</span>
                      </div>

                      {/* Description */}
                      {/* {destination.mini_description && (
                        <p className='text-gray-600 text-sm mb-4'>
                          {destination.mini_description}
                        </p>
                      )} */}

                      {/* Action Button */}
                      <div className='flex justify-between items-center mt-4 pt-4 border-t border-gray-100'>
                        <Link
                          href={`/destination-detail/${destination._id}`}
                          className='flex-1  text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-center mr-3'
                          style={{
                            backgroundColor: '#0000FF',
                            borderColor: '#FF8C00',
                            color: 'white',
                          }}
                        >
                          View Details
                        </Link>
                        {/* <Link
                          href={`/destination-detail/${destination._id}`}
                          className='bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors block shadow-md hover:shadow-lg'
                          title='Quick View'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                            />
                          </svg>
                        </Link> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section
        className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16'
        style={{
          background:
            'linear-gradient(90deg,rgb(161, 163, 22) 0%,rgb(18, 195, 207) 100%)',
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            Ready to Explore Sri Lanka?
          </h2>
          <p className='text-xl mb-8 text-emerald-100 max-w-2xl mx-auto'>
            Contact us to plan your perfect trip or get expert travel advice
            about these amazing destinations.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/contact'
              className='bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors'
              style={{ color: '#16a34a' }}
            >
              Contact Us
            </Link>
            <Link
              href='/about'
              className='border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-emerald-600 transition-colors'
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
