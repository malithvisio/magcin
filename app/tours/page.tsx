'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import SmartImage from '@/components/SmartImage/page';

interface Package {
  _id: string;
  id: string;
  name: string;
  title: string;
  image: string;
  instructionImage1: string;
  location: string;
  days: string;
  nights: string;
  rating: number;
  reviews: number;
  type: string;
  category: {
    _id: string;
    name: string;
  };
  published: boolean;
  summery?: string;
  mini_discription?: string;
}

interface Category {
  _id: string;
  name: string;
  position: number;
  published: boolean;
}

interface CategoryWithPackages {
  category: Category;
  packages: Package[];
}

export default function ToursPage() {
  const [categoriesWithPackages, setCategoriesWithPackages] = useState<
    CategoryWithPackages[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories/public');
        const categoriesData = await categoriesResponse.json();

        if (
          !categoriesData.categories ||
          !Array.isArray(categoriesData.categories)
        ) {
          throw new Error('Failed to fetch categories');
        }

        // Fetch all packages
        const packagesResponse = await fetch('/api/packages/public?limit=100');
        const packagesData = await packagesResponse.json();

        if (!packagesData.packages || !Array.isArray(packagesData.packages)) {
          throw new Error('Failed to fetch packages');
        }

        // Group packages by category
        const groupedData: CategoryWithPackages[] = [];

        categoriesData.categories.forEach((category: Category) => {
          const categoryPackages = packagesData.packages.filter(
            (pkg: Package) => pkg.category && pkg.category._id === category._id
          );

          if (categoryPackages.length > 0) {
            groupedData.push({
              category,
              packages: categoryPackages,
            });
          }
        });

        // Sort by category position
        groupedData.sort((a, b) => a.category.position - b.category.position);

        setCategoriesWithPackages(groupedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tours');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='min-h-screen flex items-center justify-center'>
          <div
            className='animate-spin rounded-full h-32 w-32 border-b-2'
            style={{ borderColor: '#16a34a' }}
          ></div>
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
              Error Loading Tours
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
      {/* <section className='relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-20'>
        <div className='absolute inset-0 bg-black opacity-20'></div>
        <div className='container mx-auto px-4 relative z-10'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-6xl font-bold mb-6 leading-tight'>
              Discover Amazing Tours
            </h1>
            <p className='text-xl md:text-2xl mb-8 text-blue-100'>
              Explore curated travel experiences across Sri Lanka
            </p>
            <div className='flex flex-wrap justify-center gap-4'>
              <div className='bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg px-6 py-3 shadow-lg'>
                <span className='text-2xl font-bold text-white'>
                  {categoriesWithPackages.length}
                </span>
                <p className='text-sm text-blue-100'>Categories</p>
              </div>
              <div className='bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg px-6 py-3 shadow-lg'>
                <span className='text-2xl font-bold text-white'>
                  {categoriesWithPackages.reduce(
                    (total, cat) => total + cat.packages.length,
                    0
                  )}
                </span>
                <p className='text-sm text-emerald-100'>Tours Available</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Categories and Packages */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          {categoriesWithPackages.length === 0 ? (
            <div className='text-center py-20'>
              <h2 className='text-3xl font-bold text-gray-800 mb-4'>
                No Tours Available
              </h2>
              <p className='text-gray-600'>
                Check back later for amazing tour packages!
              </p>
            </div>
          ) : (
            <div className='space-y-16'>
              {categoriesWithPackages.map((categoryData, categoryIndex) => (
                <div
                  key={categoryData.category._id}
                  className='category-section'
                >
                  {/* Category Header */}
                  <div className='text-center mb-12'>
                    <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                      {categoryData.category.name}
                    </h2>
                    <div className='w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full'></div>
                  </div>

                  {/* Packages Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {categoryData.packages.map((pkg, packageIndex) => (
                      <div
                        key={pkg._id}
                        className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden'
                      >
                        {/* Image Container */}
                        <div className='relative overflow-hidden h-48'>
                          <SmartImage
                            src={pkg.instructionImage1}
                            alt={pkg.title}
                            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'></div>

                          {/* Rating Badge */}
                          <div className='absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1'>
                            <svg
                              className='w-4 h-4 text-yellow-500 fill-current'
                              viewBox='0 0 20 20'
                            >
                              <path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
                            </svg>
                            <span className='text-sm font-semibold text-gray-800'>
                              {pkg.rating.toFixed(1)}
                            </span>
                          </div>

                          {/* Category Badge */}
                          {/* <div className='absolute top-4 left-4'>
                            <span className='bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full'>
                              {categoryData.category.name}
                            </span>
                          </div> */}
                        </div>

                        {/* Content */}
                        <div className='p-6'>
                          {/* Title */}
                          <h3
                            className='text-xl font-bold text-gray-900 mb-2 line-clamp-2 transition-colors group'
                            onMouseEnter={e => {
                              e.currentTarget.style.color = '#16a34a';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color = '#111827';
                            }}
                          >
                            <Link href={`/tour-detail/${pkg.id}`}>
                              {pkg.title}
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
                            <span className='text-sm'>{pkg.location}</span>
                          </div>

                          {/* Duration */}
                          <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center text-gray-600'>
                              <svg
                                className='w-4 h-4 mr-2'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                                  clipRule='evenodd'
                                />
                              </svg>
                              <span className='text-sm font-medium'>
                                {pkg.days} Days / {pkg.nights} Nights
                              </span>
                            </div>
                            {/* <div className='flex items-center text-gray-600'>
                              <svg
                                className='w-4 h-4 mr-2'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z' />
                              </svg>
                              <span className='text-sm font-medium'>
                                {pkg.reviews} reviews
                              </span>
                            </div> */}
                          </div>

                          {/* Description */}
                          {/* {pkg.mini_discription && (
                            <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                              {pkg.mini_discription}
                            </p>
                          )} */}

                          {/* Action Button */}
                          <div className='flex justify-between items-center'>
                            <Link
                              href={`/tour-detail/${pkg.id}`}
                              className='flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center mr-3'
                              style={{
                                backgroundColor: '#0000FF',
                                borderColor: '#FF8C00',
                                color: 'white',
                              }}
                            >
                              View Details
                            </Link>
                            {/* <Link
                              href={`/tour-detail/${pkg.id}`}
                              className='bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors'
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section
        className='text-white py-16'
        style={{
          background:
            'linear-gradient(90deg,rgb(190, 146, 22) 0%,rgb(18, 195, 207) 100%)',
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            Ready to Start Your Adventure?
          </h2>
          <p
            className='text-xl mb-8 max-w-2xl mx-auto'
            style={{ color: '#dcfce7' }}
          >
            Contact us to customize your perfect tour experience or get expert
            travel advice.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/contact'
              className='bg-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors'
              style={{ color: '#16a34a' }}
            >
              Contact Us
            </Link>
            <Link
              href='/about'
              className='border-2 border-white text-white font-semibold py-3 px-8 rounded-lg transition-colors'
              onMouseEnter={e => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#16a34a';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
