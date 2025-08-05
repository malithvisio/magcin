'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { swiperGroup3 } from '@/util/swiperOption';
import Link from 'next/link';
import SmartImage from '@/components/SmartImage/page';

interface Category {
  _id: string;
  id: string;
  name: string;
  description: string;
  published: boolean;
  position: number;
}

interface Package {
  _id: string;
  id: string;
  title: string;
  name: string;
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
  published: boolean;
}

interface CategoryWithPackages extends Category {
  packages: Package[];
}

export default function CategoryPackages() {
  const [categoriesWithPackages, setCategoriesWithPackages] = useState<
    CategoryWithPackages[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesAndPackages = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories/public');
        const categoriesData = await categoriesResponse.json();

        if (
          !categoriesData.categories ||
          !Array.isArray(categoriesData.categories)
        ) {
          setCategoriesWithPackages([]);
          return;
        }

        // Fetch packages for each category
        const categoriesWithPackagesData = await Promise.all(
          categoriesData.categories.map(async (category: Category) => {
            const packagesResponse = await fetch(
              `/api/packages/public?category=${category._id}&limit=10`
            );
            const packagesData = await packagesResponse.json();

            const transformedPackages = (packagesData.packages || []).map(
              (pkg: any) => ({
                _id: pkg._id,
                id: pkg._id || pkg.id,
                title: pkg.title || pkg.name,
                name: pkg.name,
                image: pkg.image,
                rating: pkg.rating || 4.5,
                reviews: pkg.reviews || 0,
                days: pkg.days || '1',
                nights: pkg.nights || '1',
                guests: pkg.guests || '2',
                price: pkg.price || 0,
                location: pkg.location || '',
                description: pkg.description || pkg.summery || '',
                category: pkg.category,
                published: pkg.published || false,
              })
            );

            return {
              ...category,
              packages: transformedPackages,
            };
          })
        );

        // Filter out categories with no packages
        const categoriesWithPackages = categoriesWithPackagesData.filter(
          category => category.packages.length > 0
        );

        setCategoriesWithPackages(categoriesWithPackages);
      } catch (error) {
        console.error('Error fetching categories and packages:', error);
        setCategoriesWithPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndPackages();
  }, []);

  if (loading) {
    return (
      <div className='container py-5 text-center'>
        <p>Loading packages by category...</p>
      </div>
    );
  }

  if (categoriesWithPackages.length === 0) {
    return (
      <div className='container py-5 text-center'>
        <p className='text-black'>No packages available at the moment.</p>
      </div>
    );
  }

  return (
    <>
      {categoriesWithPackages.map(category => (
        <section
          key={category._id}
          className='section-box box-our-featured background-body'
        >
          <div className='container'>
            <div className='row align-items-end'>
              <div className='col-lg-6 mb-30 text-center text-lg-start'>
                <h2
                  className='neutral-1000'
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '900',
                  }}
                >
                  {category.name}
                </h2>
                {category.description && (
                  <p className='text-xl-medium neutral-500'>
                    {category.description}
                  </p>
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
                    {category.packages.map((tour, index) => (
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
                            <SmartImage src={tour.image} alt={tour.title} />
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
