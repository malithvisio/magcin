'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { swiperGroupAnimate } from '@/util/swiperOption';
import Link from 'next/link';
import SmartImage from '@/components/SmartImage/page';
import { useEffect, useState } from 'react';
import { useRootUserFilter, useRootUserData } from '@/util/useRootUserFilter';

interface Destination {
  _id: string;
  id: string;
  name: string;
  images: string[];
  location: string;
  description: string;
  mini_description: string;
  imageUrl: string;
  published: boolean;
}

interface DestinationsResponse {
  destinations: Destination[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  rootUserId: string;
}

export default function TopRated2() {
  const {
    currentRootUserId,
    activeRootUsers,
    currentRootUserName,
    setRootUserId,
    isLoading: filterLoading,
    error: filterError,
  } = useRootUserFilter();

  // Fetch destinations with root user filtering
  const {
    data,
    isLoading: dataLoading,
    error: dataError,
  } = useRootUserData<DestinationsResponse>(async queryParam => {
    const response = await fetch(
      `/api/destinations/public?limit=10&${queryParam}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch destinations');
    }
    return response.json();
  });

  const destinationPackages = data?.destinations || [];
  const loading = filterLoading || dataLoading;
  const error = filterError || dataError;

  if (loading) {
    return (
      <section
        className='section-box box-properties-area'
        // style={{
        //   background:
        //     'linear-gradient(90deg,rgb(161, 163, 22) 0%,rgb(18, 195, 207) 100%)',
        // }}
      >
        <div className='container'>
          <div className=' align-items-end'>
            <div className='col-md-9'>
              <h2 className='neutral-1000'>Top Rated Destinations</h2>
              <p className='text-xl-medium neutral-500'>
                Quality as judged by customers. Book at the ideal price!
              </p>
              {/* Root User Selector */}
              {activeRootUsers.length > 1 && (
                <div className='mt-3'>
                  <label className='text-sm font-medium text-gray-700 mr-2'>
                    Select Tourism Company:
                  </label>
                  <select
                    value={currentRootUserId}
                    onChange={e => setRootUserId(e.target.value)}
                    className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {activeRootUsers.map(user => (
                      <option key={user.rootUserId} value={user.rootUserId}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className='text-center py-5 text-gray-700'>
            <p>Loading destinations...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className='section-box box-properties-area background-3
      '
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 165, 0, 0.8) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(0, 123, 255, 0.8) 100%)',
          position: 'relative',
        }}
      >
        <div className='container'>
          <div className=' align-items-end'>
            <div className='col-md-9'>
              <h2 className='neutral-1000'>Top Rated Destinations</h2>
              <p className='text-xl-medium neutral-500'>
                Quality as judged by customers. Book at the ideal price!
              </p>
              {/* Root User Selector */}
              {activeRootUsers.length > 1 && (
                <div className='mt-3'>
                  <label className='text-sm font-medium text-gray-700 mr-2'>
                    Select Tourism Company:
                  </label>
                  <select
                    value={currentRootUserId}
                    onChange={e => setRootUserId(e.target.value)}
                    className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {activeRootUsers.map(user => (
                      <option key={user.rootUserId} value={user.rootUserId}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className='text-center py-5'>
            <p className='text-red-600'>Error: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (destinationPackages.length === 0) {
    return (
      <section className='section-box box-properties-area background-3'>
        <div className='container'>
          <div className=' align-items-end'>
            <div className='col-md-9'>
              <h2 className='neutral-1000'>Top Rated Destinations</h2>
              <p className='text-xl-medium neutral-500'>
                Quality as judged by customers. Book at the ideal price!
              </p>
              {/* Root User Selector */}
              {activeRootUsers.length > 1 && (
                <div className='mt-3'>
                  <label className='text-sm font-medium text-gray-700 mr-2'>
                    Select Tourism Company:
                  </label>
                  <select
                    value={currentRootUserId}
                    onChange={e => setRootUserId(e.target.value)}
                    className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {activeRootUsers.map(user => (
                      <option key={user.rootUserId} value={user.rootUserId}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className='text-center py-5'>
            <p className='text-black'>
              No destinations available for {currentRootUserName} at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className='section-box box-properties-area background-3'
        //  style={{
        //   background:
        //     'linear-gradient(90deg,rgb(161, 163, 22) 0%,rgb(18, 195, 207) 100%)',
        // }}
      >
        <div className='container'>
          <div className=' align-items-end'>
            <div className='col-md-9'>
              <h2 className='neutral-1000 pt-30'>Top Rated Destinations</h2>
              <p className='text-xl-medium neutral-500 pt-15'>
                Quality as judged by customers. Book at the ideal price!
              </p>
              {/* Root User Selector */}
              {activeRootUsers.length > 1 && (
                <div className='mt-3'>
                  <label className='text-sm font-medium text-gray-700 mr-2'>
                    Select Tourism Company:
                  </label>
                  <select
                    value={currentRootUserId}
                    onChange={e => setRootUserId(e.target.value)}
                    className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {activeRootUsers.map(user => (
                      <option key={user.rootUserId} value={user.rootUserId}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className='col-md-3 position-relative mb-30'>
              <div className='box-button-slider box-button-slider-team justify-content-end'>
                {/* Only show the SVG arrows, not the Swiper navigation bars */}
                <button className='swiper-arrow-prev' type='button'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width={16}
                    height={16}
                    viewBox='0 0 16 16'
                  >
                    <path
                      d='M7.99992 3.33325L3.33325 7.99992M3.33325 7.99992L7.99992 12.6666M3.33325 7.99992H12.6666'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
                <button className='swiper-arrow-next' type='button'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width={16}
                    height={16}
                    viewBox='0 0 16 16'
                  >
                    <path
                      d='M7.99992 12.6666L12.6666 7.99992L7.99992 3.33325M12.6666 7.99992L3.33325 7.99992'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='container-slider box-swiper-padding'>
          <div className='box-swiper mt-30'>
            <div className='swiper-container swiper-group-animate swiper-group-journey'>
              <Swiper
                {...swiperGroupAnimate}
                navigation={{
                  prevEl: '.swiper-arrow-prev',
                  nextEl: '.swiper-arrow-next',
                }}
                breakpoints={{
                  0: {
                    slidesPerView: 'auto' as const,
                    centeredSlides: true,
                  },
                  768: {
                    slidesPerView: 2,
                    centeredSlides: false,
                  },
                  1024: {
                    slidesPerView: 4,
                  },
                }}
              >
                {destinationPackages.map(tour => (
                  <SwiperSlide key={tour.id}>
                    <div
                      className='card-journey-small background-card'
                      style={{ width: '350px' }}
                    >
                      <div className='card-image'>
                        <Link
                          className='wish'
                          href={`destination-detail/${tour.id}`}
                        >
                          <svg
                            width={20}
                            height={18}
                            viewBox='0 0 20 18'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M17.071 10.1422L11.4141 15.7991C10.6331 16.5801 9.36672 16.5801 8.58568 15.7991L2.92882 10.1422C0.9762 8.1896 0.9762 5.02378 2.92882 3.07116C4.88144 1.11853 8.04727 1.11853 9.99989 3.07116C11.9525 1.11853 15.1183 1.11853 17.071 3.07116C19.0236 5.02378 19.0236 8.1896 17.071 10.1422Z'
                              stroke=''
                              strokeWidth='1.5'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              fill='none'
                            />
                          </svg>
                        </Link>
                        <SmartImage src={tour.imageUrl} alt='Travila' />
                      </div>
                      <div className='card-info'>
                        <div className='card-title'>
                          <Link
                            className='heading-6 neutral-1000'
                            href={`destination-detail/${tour.id}`}
                          >
                            {tour.name}
                          </Link>
                        </div>
                        <div className='card-program'>
                          <div className='card-location'>
                            <p className='text-location text-md-medium neutral-500'>
                              {tour.location}
                            </p>
                          </div>
                          <div className='endtime'>
                            <div className='card-button'>
                              <Link
                                className='btn btn-gray'
                                href={`destination-detail/${tour.id}`}
                              >
                                Explore More
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
