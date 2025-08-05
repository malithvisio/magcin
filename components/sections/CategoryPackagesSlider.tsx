'use client';

import Link from 'next/link';
import SmartImage from '@/components/SmartImage/page';
import { Swiper, SwiperSlide } from 'swiper/react';
import { swiperGroup3 } from '@/util/swiperOption';
import { useEffect, useState } from 'react';
import { useRootUserFilter, useRootUserData } from '@/util/useRootUserFilter';

interface TourPackage {
  id: string;
  title: string;
  image: string;
  rating: number;
  reviews: number;
  days: string;
  nights: string;
  guests: string;
  price: number;
  location: string;
  description: string;
  category: string;
}

interface Category {
  _id: string;
  name: string;
  position: number;
  published: boolean;
}

interface PackagesResponse {
  packages: TourPackage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  rootUserId: string;
}

interface CategoriesResponse {
  categories: Category[];
  rootUserId: string;
}

interface CategoryWithPackages {
  category: Category;
  packages: TourPackage[];
}

export default function CategoryPackagesSlider() {
  const [marginBottom, setMarginBottom] = useState(-8);
  const {
    currentRootUserId,
    activeRootUsers,
    currentRootUserName,
    setRootUserId,
    isLoading: filterLoading,
    error: filterError,
  } = useRootUserFilter();

  // Fetch categories with root user filtering
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useRootUserData<CategoriesResponse>(async queryParam => {
    const response = await fetch(`/api/categories/public?${queryParam}`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  });

  // Fetch packages with root user filtering
  const {
    data: packagesData,
    isLoading: packagesLoading,
    error: packagesError,
  } = useRootUserData<PackagesResponse>(async queryParam => {
    const response = await fetch(`/api/packages/public?limit=50&${queryParam}`);
    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }
    return response.json();
  });

  useEffect(() => {
    if (window.innerWidth <= 600) {
      setMarginBottom(0);
    }
  }, []);

  const loading = filterLoading || categoriesLoading || packagesLoading;
  const error = filterError || categoriesError || packagesError;

  // Group packages by category
  const categoriesWithPackages: CategoryWithPackages[] = [];

  if (categoriesData?.categories && packagesData?.packages) {
    const categories = categoriesData.categories;
    const packages = packagesData.packages;

    categories.forEach(category => {
      const categoryPackages = packages.filter(
        pkg => pkg.category === category.name
      );
      if (categoryPackages.length > 0) {
        categoriesWithPackages.push({
          category,
          packages: categoryPackages,
        });
      }
    });
  }

  if (loading) {
    return (
      <section className='section-box box-our-featured background-body'>
        <div className='container'>
          <div className='row align-items-end'>
            <div className='col-lg-6 mb-30 text-center text-lg-start'>
              <h2
                className='neutral-1000'
                style={{
                  marginBottom: marginBottom,
                  fontSize: '2.5rem',
                  fontWeight: '900',
                }}
              >
                Featured Tours by Category
              </h2>
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
            <p>Loading featured tours...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='section-box box-our-featured background-body'>
        <div className='container'>
          <div className='row align-items-end'>
            <div className='col-lg-6 mb-30 text-center text-lg-start'>
              <h2
                className='neutral-1000'
                style={{
                  marginBottom: marginBottom,
                  fontSize: '2.5rem',
                  fontWeight: '900',
                }}
              >
                Featured Tours by Category
              </h2>
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

  if (categoriesWithPackages.length === 0) {
    return (
      <section className='section-box box-our-featured background-body'>
        <div className='container'>
          <div className='row align-items-end'>
            <div className='col-lg-6 mb-30 text-center text-lg-start'>
              <h2
                className='neutral-1000'
                style={{
                  marginBottom: marginBottom,
                  fontSize: '2.5rem',
                  fontWeight: '900',
                }}
              >
                Featured Tours by Category
              </h2>
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
              No tours available for {currentRootUserName} at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {categoriesWithPackages.map((categoryData, categoryIndex) => (
        <section
          key={categoryData.category._id}
          className='section-box box-our-featured background-body'
        >
          <div className='container'>
            <div className='row align-items-end'>
              <div className='col-lg-6 mb-30 text-center text-lg-start'>
                <h2
                  className='neutral-1000'
                  style={{
                    marginBottom: marginBottom,
                    fontSize: '2.5rem',
                    fontWeight: '900',
                  }}
                >
                  {categoryData.category.name} Tours
                </h2>
                {/* Root User Selector - Only show on first category */}
                {categoryIndex === 0 && activeRootUsers.length > 1 && (
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
              <div className='col-lg-6 mb-30 text-end'>
                <div className='box-button-slider'>
                  <div className='swiper-button-prev swiper-button-prev-style-1 swiper-button-prev-3'>
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
                  </div>
                  <div className='swiper-button-next swiper-button-next-style-1 swiper-button-next-3'>
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
                  </div>
                </div>
              </div>
            </div>
            <div className='box-list-featured'>
              <div className='box-swiper'>
                <div className='swiper-container swiper-group-3 swiper-group-journey'>
                  <Swiper {...swiperGroup3}>
                    {categoryData.packages.map((tour, index) => (
                      <SwiperSlide key={index}>
                        <div
                          className='card-journey-small background-card'
                          style={{
                            marginBottom: 1,
                            marginLeft: 0,
                            marginRight: 0,
                            ...(typeof window !== 'undefined' &&
                            window.innerWidth <= 600
                              ? { marginBottom: 24 }
                              : {}),
                          }}
                        >
                          <div className='card-image'>
                            <Link
                              className='label'
                              href={`tour-detail/${tour.id}`}
                            >
                              Top Rated
                            </Link>
                            <Link
                              className='wish'
                              href={`tour-detail/${tour.id}`}
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
                            <SmartImage src={tour.image} alt='Adventure LK' />
                          </div>
                          <div className='card-info background-card'>
                            <div className='card-rating'>
                              <div className='card-left'> </div>
                              <div className='card-right'>
                                {' '}
                                <span className='rating'>
                                  {tour.rating}
                                  <span className='text-sm-medium neutral-500'>
                                    ( {tour.reviews})
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className='card-title'>
                              {' '}
                              <Link
                                className='heading-6 neutral-1000'
                                href={`tour-detail/${tour.id}`}
                              >
                                {tour.title}
                              </Link>
                            </div>
                            <div className='card-program'>
                              <div className='card-duration-tour'>
                                <p className='icon-duration text-md-medium neutral-500'>
                                  {tour.days} D/ {tour.nights} N
                                </p>
                              </div>
                              <div className='endtime'>
                                <div className='card-button'>
                                  {' '}
                                  <Link
                                    className='btn btn-gray'
                                    href={`tour-detail/${tour.id}`}
                                  >
                                    Book Now
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
          </div>
          <br />
        </section>
      ))}
    </>
  );
}
