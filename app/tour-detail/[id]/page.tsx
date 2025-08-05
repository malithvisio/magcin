'use client';

import BookingForm from '@/components/elements/BookingForm';
import Layout from '@/components/layout/Layout';
import SwiperGroup3Slider from '@/components/slider/SwiperGroup3Slider';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import dynamic from 'next/dynamic';
import { Tabs, Tab } from 'react-bootstrap';
import SmartImage from '@/components/SmartImage/page';
import { useRootUserData } from '@/util/useRootUserFilter';
import { slugToPackageName } from '@/util/package-utils';

const SlickArrowLeft = ({ currentSlide, slideCount, ...props }: any) => (
  <button
    {...props}
    className={
      'slick-prev slick-arrow' + (currentSlide === 0 ? ' slick-disabled' : '')
    }
    type='button'
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
    >
      <path
        d='M7.99992 3.33325L3.33325 7.99992M3.33325 7.99992L7.99992 12.6666M3.33325 7.99992H12.6666'
        stroke=''
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  </button>
);

const SlickArrowRight = ({ currentSlide, slideCount, ...props }: any) => (
  <button
    {...props}
    className={
      'slick-next slick-arrow' +
      (currentSlide === slideCount - 1 ? ' slick-disabled' : '')
    }
    type='button'
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
    >
      <path
        d='M7.99992 12.6666L12.6666 7.99992L7.99992 3.33325M12.6666 7.99992L3.33325 7.99992'
        stroke=''
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </button>
);

interface TourDetailParams {
  id: string;
}

interface TourPackage {
  _id: string;
  id: string;
  title: string;
  name: string;
  image: string;
  images?: string[];
  instructionSliderImages?: Array<{
    url: string;
    alt: string;
    uploaded: boolean;
  }>;
  rating: number;
  reviews: number;
  days: string;
  nights: string;
  guests: string;
  price: number;
  location: string;
  description: string;
  instructionSection1Description?: string;
  instructionShortDescription?: string;
  summery: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: any[];
  accommodationPlaces: any[];
  guidelinesFaqs: any[];
  packageReviews: any[];
  destinations: string;
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

function TourDetail2({ params }: { params: TourDetailParams }) {
  const slider1 = useRef<Slider | null>(null);
  const slider2 = useRef<Slider | null>(null);
  const [nav1, setNav1] = useState<Slider | undefined>(undefined);
  const [nav2, setNav2] = useState<Slider | undefined>(undefined);
  const [isAccordion, setIsAccordion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const { id } = params;

  const [isMounted, setIsMounted] = useState(false);

  // Use the useRootUserData hook to fetch package data
  const { data, isLoading, error } = useRootUserData<PackageResponse>(
    async queryParam => {
      // First try to find by ID (if it's a valid package ID)
      let response = await fetch(`/api/packages/public?id=${id}&${queryParam}`);

      if (!response.ok) {
        throw new Error('Failed to fetch package');
      }

      let data = await response.json();

      // If no package found by ID, try to find by name slug
      if (!data.packages || data.packages.length === 0) {
        // Convert the URL slug back to a searchable name
        const packageName = slugToPackageName(id);

        response = await fetch(
          `/api/packages/public?search=${encodeURIComponent(packageName)}&${queryParam}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch package by name');
        }

        data = await response.json();
      }

      return data;
    },
    [id] // Only re-run when id changes
  );

  const tourPackage = data?.packages?.[0] || null;

  useEffect(() => {
    setNav1(slider1.current ?? undefined);
    setNav2(slider2.current ?? undefined);
    setIsMounted(true);
  }, []);

  if (isLoading) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='container py-5 text-center'>
          <p>Loading package details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !tourPackage) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='container py-5 text-center'>
          <p className='text-red-600'>{error || 'Package not found.'}</p>
          <Link href='/' className='btn btn-primary mt-3'>
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  const settingsMain = {
    asNavFor: nav2,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    dots: true,
    infinite: true,
    speed: 500,
    cssEase: 'linear',
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    prevArrow: <SlickArrowLeft />,
    nextArrow: <SlickArrowRight />,
  };

  const settingsThumbs = {
    slidesToShow: 4,
    slidesToScroll: 1,
    dots: false,
    focusOnSelect: true,
    infinite: true,
    speed: 500,
    cssEase: 'linear',
    asNavFor: nav1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  const handleAccordion = (key: number): void => {
    setIsAccordion(prevState => (prevState === key ? null : key));
  };

  // Prepare images for slider - prioritize instructionSliderImages, then images array, then main image
  const sliderImages = (() => {
    console.log('=== SLIDER IMAGES DEBUG ===');
    console.log('Package name:', tourPackage.name);
    console.log(
      'instructionSliderImages:',
      tourPackage.instructionSliderImages
    );
    console.log('images array:', tourPackage.images);
    console.log('main image:', tourPackage.image);

    // First priority: instructionSliderImages from database
    if (
      tourPackage.instructionSliderImages &&
      tourPackage.instructionSliderImages.length > 0
    ) {
      const instructionImages = tourPackage.instructionSliderImages
        .filter(img => img.uploaded && img.url) // Only show uploaded images with URLs
        .map(img => img.url);
      console.log('Using instructionSliderImages:', instructionImages);
      return instructionImages;
    }

    // Second priority: images array
    if (tourPackage.images && tourPackage.images.length > 0) {
      console.log('Using images array:', tourPackage.images);
      return tourPackage.images;
    }

    // Fallback: main image
    console.log('Using main image:', [tourPackage.image]);
    return [tourPackage.image];
  })();

  return (
    <>
      <Layout headerStyle={1} footerStyle={2}>
        <main className='main'>
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
                  <Link href='/destination'>Tours</Link>
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
                  <span className='text-breadcrumb'>
                    {tourPackage?.name || ''}
                  </span>
                </li>
              </ul>
            </div>
          </section>
          <section className='box-section box-content-tour-detail background-body  -mb-10 '>
            <div className='container mb-5'>
              <div className='tour-header'>
                <div className='row'>
                  <div className='col-lg-8'>
                    <div className='tour-title-main'>
                      <h4 className='neutral-1000'>{tourPackage.name}</h4>
                      {tourPackage.category && (
                        <p className='text-md-medium neutral-500 mt-2'>
                          Category: {tourPackage.category.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className='tour-metas'>
                  <div className='tour-meta-left'>
                    <p className='text-md-medium neutral-500 mr-20 tour-location mb'>
                      <svg
                        width={12}
                        height={16}
                        viewBox='0 0 12 16'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path d='M5.99967 0C2.80452 0 0.205078 2.59944 0.205078 5.79456C0.205078 9.75981 5.39067 15.581 5.61145 15.8269C5.81883 16.0579 6.18089 16.0575 6.38789 15.8269C6.60867 15.581 11.7943 9.75981 11.7943 5.79456C11.7942 2.59944 9.1948 0 5.99967 0ZM5.99967 8.70997C4.39211 8.70997 3.0843 7.40212 3.0843 5.79456C3.0843 4.187 4.39214 2.87919 5.99967 2.87919C7.6072 2.87919 8.91502 4.18703 8.91502 5.79459C8.91502 7.40216 7.6072 8.70997 5.99967 8.70997Z' />
                      </svg>
                      {tourPackage.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <section className='section-box box-banner-home2 box-banner-tour-detail-2 background-body'>
              <div className='box-banner-tour-detail-2-inner '>
                <div className='container-top '>
                  <div className='container' />
                </div>
                <div className='container-banner'>
                  {/* Main Image Slider */}
                  <div className='main-slider-container'>
                    <Slider
                      {...settingsMain}
                      ref={slider1}
                      className='banner-main'
                    >
                      {sliderImages.map((image: string, index: number) => (
                        <div className='banner-slide' key={index}>
                          <img
                            src={image}
                            alt={`${tourPackage.name} - Image ${index + 1}`}
                          />
                          <div className='slide-overlay'>
                            <div className='slide-info'>
                              <h3>{tourPackage.name}</h3>
                              <p>
                                Image {index + 1} of {sliderImages.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </div>

                  {/* Thumbnail Navigation */}
                  {/* {sliderImages.length > 1 && (
                    <div className='thumbnail-slider-container'>
                      <Slider
                        {...settingsThumbs}
                        ref={slider2}
                        className='thumbnail-slider'
                      >
                        {sliderImages.map((image: string, index: number) => (
                          <div className='thumbnail-slide' key={index}>
                            <img
                              src={image}
                              alt={`${tourPackage.name} - Thumbnail ${index + 1}`}
                            />
                          </div>
                        ))}
                      </Slider>
                    </div>
                  )} */}

                  <style jsx>{`
                    .main-slider-container {
                      position: relative;
                      margin-bottom: 20px;
                    }

                    .banner-slide {
                      height: 600px;
                      position: relative;
                    }

                    .banner-slide img {
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                    }

                    .slide-overlay {
                      position: absolute;
                      bottom: 0;
                      left: 0;
                      right: 0;
                      background: linear-gradient(
                        transparent,
                        rgba(0, 0, 0, 0.7)
                      );
                      color: white;
                      padding: 20px;
                    }

                    .slide-info h3 {
                      margin: 0 0 5px 0;
                      font-size: 1.5rem;
                      font-weight: bold;
                    }

                    .slide-info p {
                      margin: 0;
                      opacity: 0.8;
                    }

                    .thumbnail-slider-container {
                      max-width: 100%;
                      margin: 0 auto;
                    }

                    .thumbnail-slider {
                      padding: 0 40px;
                    }

                    .thumbnail-slide {
                      padding: 0 5px;
                      cursor: pointer;
                      transition: opacity 0.3s ease;
                    }

                    .thumbnail-slide:hover {
                      opacity: 0.8;
                    }

                    .thumbnail-slide img {
                      width: 100%;
                      height: 80px;
                      object-fit: cover;
                      border-radius: 8px;
                      border: 2px solid transparent;
                      transition: border-color 0.3s ease;
                    }

                    .thumbnail-slide.slick-current img {
                      border-color: #007bff;
                    }

                    @media (max-width: 768px) {
                      .banner-slide {
                        height: 300px;
                      }

                      .slide-overlay {
                        padding: 15px;
                      }

                      .slide-info h3 {
                        font-size: 1.2rem;
                      }

                      .thumbnail-slide img {
                        height: 60px;
                      }
                    }

                    @media (max-width: 576px) {
                      .banner-slide {
                        height: 220px;
                      }

                      .slide-overlay {
                        padding: 10px;
                      }

                      .slide-info h3 {
                        font-size: 1rem;
                      }

                      .thumbnail-slide img {
                        height: 50px;
                      }
                    }
                  `}</style>
                </div>
              </div>
            </section>

            <div className='container'>
              <div className='row mt-65'>
                <div className='col-lg-8'>
                  <div className='box-info-tour'>
                    <div className='tour-info-group'>
                      <div className='icon-item'>
                        <svg
                          width={18}
                          height={19}
                          viewBox='0 0 18 19'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path d='M14.5312 1.8828H13.8595V1.20312C13.8595 0.814789 13.5448 0.5 13.1564 0.5C12.7681 0.5 12.4533 0.814789 12.4533 1.20312V1.8828H5.55469V1.20312C5.55469 0.814789 5.2399 0.5 4.85156 0.5C4.46323 0.5 4.14844 0.814789 4.14844 1.20312V1.8828H3.47678C1.55967 1.8828 0 3.44247 0 5.35954V15.0232C0 16.9403 1.55967 18.5 3.47678 18.5H14.5313C16.4483 18.5 18.008 16.9403 18.008 15.0232V5.35954C18.008 3.44247 16.4483 1.8828 14.5312 1.8828ZM3.47678 3.28905H4.14844V4.66014C4.14844 5.04848 4.46323 5.36327 4.85156 5.36327C5.2399 5.36327 5.55469 5.04848 5.55469 4.66014V3.28905H12.4533V4.66014C12.4533 5.04848 12.7681 5.36327 13.1565 5.36327C13.5448 5.36327 13.8596 5.04848 13.8596 4.66014V3.28905H14.5313C15.6729 3.28905 16.6018 4.21788 16.6018 5.35954V6.03124H1.40625V5.35954C1.40625 4.21788 2.33508 3.28905 3.47678 3.28905ZM14.5312 17.0938H3.47678C2.33508 17.0938 1.40625 16.1649 1.40625 15.0232V7.43749H16.6018V15.0232C16.6018 16.1649 15.6729 17.0938 14.5312 17.0938ZM6.24611 10.2031C6.24611 10.5915 5.93132 10.9062 5.54298 10.9062H4.16018C3.77184 10.9062 3.45705 10.5915 3.45705 10.2031C3.45705 9.81479 3.77184 9.5 4.16018 9.5H5.54298C5.93128 9.5 6.24611 9.81479 6.24611 10.2031ZM14.551 10.2031C14.551 10.5915 14.2362 10.9062 13.8479 10.9062H12.4651C12.0767 10.9062 11.7619 10.5915 11.7619 10.2031C11.7619 9.81479 12.0767 9.5 12.4651 9.5H13.8479C14.2362 9.5 14.551 9.81479 14.551 10.2031ZM10.3945 10.2031C10.3945 10.5915 10.0798 10.9062 9.69142 10.9062H8.30862C7.92028 10.9062 7.60549 10.5915 7.60549 10.2031C7.60549 9.81479 7.92028 9.5 8.30862 9.5H9.69142C10.0797 9.5 10.3945 9.81479 10.3945 10.2031ZM6.24611 14.3516C6.24611 14.7399 5.93132 15.0547 5.54298 15.0547H4.16018C3.77184 15.0547 3.45705 14.7399 3.45705 14.3516C3.45705 13.9632 3.77184 13.6484 4.16018 13.6484H5.54298C5.93128 13.6484 6.24611 13.9632 6.24611 14.3516ZM14.551 14.3516C14.551 14.7399 14.2362 15.0547 13.8479 15.0547H12.4651C12.0767 15.0547 11.7619 14.7399 11.7619 14.3516C11.7619 13.9632 12.0767 13.6484 12.4651 13.6484H13.8479C14.2362 13.6484 14.551 13.9632 14.551 14.3516ZM10.3945 14.3516C10.3945 14.7399 10.0798 15.0547 9.69142 15.0547H8.30862C7.92028 15.0547 7.60549 14.7399 7.60549 14.3516C7.60549 13.9632 7.92028 13.6484 8.30862 13.6484H9.69142C10.0797 13.6484 10.3945 13.9632 10.3945 14.3516Z' />
                        </svg>
                      </div>
                      <div className='info-item'>
                        <p className='text-sm-medium neutral-600'>Duration</p>
                        <p className='text-lg-bold neutral-1000'>
                          {tourPackage.days}D /{tourPackage.nights}N
                        </p>
                      </div>
                    </div>
                    <div className='tour-info-group'>
                      <div className='icon-item background-3'>
                        <svg
                          width={24}
                          height={25}
                          viewBox='0 0 24 25'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <g clipPath='url(#clip0_652_10262)'>
                            <path
                              d='M21.5993 9.98724C22.2546 8.57953 22.7344 7.10443 22.7344 5.80109C22.7344 2.87799 20.3571 0.5 17.4351 0.5C15.3765 0.5 13.5884 1.6803 12.7114 3.39984C12.4056 3.37347 12.0963 3.35938 11.7891 3.35938C5.9469 3.35938 1.21875 8.08698 1.21875 13.9297C1.21875 19.7719 5.94635 24.5 11.7891 24.5C17.6312 24.5 22.3594 19.7724 22.3594 13.9297C22.3594 12.6126 22.123 11.2964 21.5993 9.98724ZM17.4351 1.90625C19.5817 1.90625 21.3281 3.65344 21.3281 5.80109C21.3281 8.57275 18.605 12.5386 17.4124 14.1425C15.8795 12.0587 13.5421 8.38324 13.5421 5.80109C13.5419 3.65344 15.2884 1.90625 17.4351 1.90625ZM5.05829 7.71765L9.77563 10.0762L9.23492 12.7796L7.3678 14.0244C7.17224 14.1547 7.05469 14.3743 7.05469 14.6094V17.6237L3.9613 18.6904C3.11389 17.3019 2.625 15.6719 2.625 13.9297C2.625 11.5349 3.54895 9.35187 5.05829 7.71765ZM4.82538 19.8799L7.98706 18.7897C8.27069 18.6919 8.46094 18.4249 8.46094 18.125V14.9857L10.2572 13.7881C10.4123 13.6847 10.5201 13.5239 10.5566 13.341L11.2597 9.82538C11.322 9.51447 11.1683 9.20044 10.8847 9.05872L6.16553 6.69904C7.888 5.35632 10.0206 4.67059 12.2355 4.77679C11.7907 7.03979 13.0248 9.73877 14.1724 11.7544L12.2307 13.365C11.9421 13.6045 11.8922 14.0282 12.1172 14.3281L13.3828 16.0156H10.5703C10.1819 16.0156 9.86719 16.3304 9.86719 16.7188V20.9375C9.86719 21.3259 10.1819 21.6406 10.5703 21.6406H13.7891L14.4481 22.6999C11.0292 23.7385 7.24127 22.703 4.82538 19.8799ZM15.7798 22.1782L14.7766 20.566C14.6483 20.3598 14.4227 20.2344 14.1797 20.2344H11.2734V17.4219H14.7891C15.3671 17.4219 15.6989 16.7599 15.3516 16.2969L13.6439 14.02L14.9059 12.9731C15.8904 14.5264 16.7787 15.6379 16.8618 15.741C17.1422 16.0889 17.6722 16.0903 17.9544 15.7439C18.0595 15.615 19.4385 13.909 20.6884 11.7328C20.8641 12.4469 20.9531 13.1819 20.9531 13.9297C20.9531 17.5532 18.8392 20.692 15.7798 22.1782Z'
                              fill='black'
                            />
                            <path
                              d='M17.436 8.2724C18.7959 8.2724 19.9022 7.16571 19.9022 5.8056C19.9022 4.44531 18.7957 3.33862 17.436 3.33862C16.076 3.33862 14.9697 4.44531 14.9697 5.8056C14.9697 7.16571 16.076 8.2724 17.436 8.2724ZM17.436 4.74487C18.0204 4.74487 18.496 5.22076 18.496 5.8056C18.496 6.39026 18.0204 6.86615 17.436 6.86615C16.8515 6.86615 16.376 6.39026 16.376 5.8056C16.376 5.22076 16.8515 4.74487 17.436 4.74487Z'
                              fill='black'
                            />
                          </g>
                          <defs>
                            <clipPath id='clip0_652_10262'>
                              <rect
                                width={24}
                                height={24}
                                fill='white'
                                transform='translate(0 0.5)'
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <div className='info-item'>
                        <p className='text-sm-medium neutral-600'>
                          Destinations
                        </p>
                        <p className='text-lg-bold neutral-1000'>
                          {tourPackage.destinations} +
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Tabs
                      defaultActiveKey='home'
                      id='uncontrolled-tab-example'
                      className='custom-tabs mb-3'
                    >
                      <Tab eventKey='home' title='Overview'>
                        <div className='box-collapse-expand'>
                          <div className='group-collapse-expand'>
                            <button
                              className={
                                isAccordion == 1
                                  ? 'btn btn-collapse collapsed'
                                  : 'btn btn-collapse'
                              }
                              type='button'
                              data-bs-toggle='collapse'
                              data-bs-target='#collapseOverview'
                              aria-expanded='false'
                              aria-controls='collapseOverview'
                              onClick={() => handleAccordion(1)}
                            >
                              <h6>Overview</h6>
                              <svg
                                width={12}
                                height={7}
                                viewBox='0 0 12 7'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M1 1L6 6L11 1'
                                  stroke=''
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  fill='none'
                                />
                              </svg>
                            </button>
                            <div
                              className={
                                isAccordion == 1 ? 'collapse' : 'collapse show'
                              }
                              id='collapseOverview'
                            >
                              <div
                                className='card card-body'
                                style={{ color: 'black' }}
                              >
                                {tourPackage.instructionSection1Description}
                              </div>
                            </div>
                          </div>
                          {(tourPackage as any).highlightsActive !== false &&
                            tourPackage.highlights &&
                            tourPackage.highlights.length > 0 && (
                              <div className='group-collapse-expand'>
                                <button
                                  className={
                                    isAccordion == 2
                                      ? 'btn btn-collapse collapsed'
                                      : 'btn btn-collapse'
                                  }
                                  type='button'
                                  data-bs-toggle='collapse'
                                  data-bs-target='#collapseHighlight'
                                  aria-expanded='false'
                                  aria-controls='collapseHighlight'
                                  onClick={() => handleAccordion(2)}
                                >
                                  <h6>Highlight</h6>
                                  <svg
                                    width={12}
                                    height={7}
                                    viewBox='0 0 12 7'
                                    xmlns='http://www.w3.org/2000/svg'
                                  >
                                    <path
                                      d='M1 1L6 6L11 1'
                                      stroke=''
                                      strokeWidth='1.5'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      fill='none'
                                    />
                                  </svg>
                                </button>
                                <div
                                  className={
                                    isAccordion == 2
                                      ? 'collapse'
                                      : 'collapse show'
                                  }
                                  id='collapseHighlight'
                                >
                                  <div
                                    className='card card-body'
                                    style={{ color: 'black' }}
                                  >
                                    {tourPackage.instructionSection1Description}
                                  </div>
                                </div>
                              </div>
                            )}
                          {(((tourPackage as any).inclusionsActive !== false &&
                            tourPackage.inclusions &&
                            tourPackage.inclusions.length > 0) ||
                            ((tourPackage as any).exclusionsActive !== false &&
                              tourPackage.exclusions &&
                              tourPackage.exclusions.length > 0)) && (
                            <div className='group-collapse-expand'>
                              <button
                                className={
                                  isAccordion == 3
                                    ? 'btn btn-collapse collapsed'
                                    : 'btn btn-collapse'
                                }
                                type='button'
                                data-bs-toggle='collapse'
                                data-bs-target='#collapseIncluded'
                                aria-expanded='false'
                                aria-controls='collapseIncluded'
                                onClick={() => handleAccordion(3)}
                              >
                                <h6>Included/Excluded</h6>
                                <svg
                                  width={12}
                                  height={7}
                                  viewBox='0 0 12 7'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M1 1L6 6L11 1'
                                    stroke=''
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    fill='none'
                                  />
                                </svg>
                              </button>
                              <div
                                className={
                                  isAccordion == 3
                                    ? 'collapse'
                                    : 'collapse show'
                                }
                                id='collapseIncluded'
                              >
                                <div className='card card-body'>
                                  <div className='row'>
                                    {(tourPackage as any).inclusionsActive !==
                                      false &&
                                      tourPackage.inclusions &&
                                      tourPackage.inclusions.length > 0 && (
                                        <div className='col-lg-6'>
                                          <p className='text-md-bold'>
                                            Included:
                                          </p>
                                          {tourPackage.inclusions.map(
                                            (inclusion: string, i: number) => (
                                              <ul key={i}>
                                                <li>{inclusion}</li>
                                              </ul>
                                            )
                                          )}
                                        </div>
                                      )}
                                    {(tourPackage as any).exclusionsActive !==
                                      false &&
                                      tourPackage.exclusions &&
                                      tourPackage.exclusions.length > 0 && (
                                        <div className='col-lg-6'>
                                          <p className='text-md-bold'>
                                            Excluded:
                                          </p>
                                          {tourPackage.exclusions.map(
                                            (exclusion: string, i: number) => (
                                              <ul key={i}>
                                                <li>{exclusion}</li>
                                              </ul>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className='group-collapse-expand'>
                            <button
                              className={
                                isAccordion == 4
                                  ? 'btn btn-collapse collapsed'
                                  : 'btn btn-collapse'
                              }
                              type='button'
                              data-bs-toggle='collapse'
                              data-bs-target='#collapseDuration'
                              aria-expanded='false'
                              aria-controls='collapseDuration'
                              onClick={() => handleAccordion(4)}
                            >
                              <h6>Summary</h6>
                              <svg
                                width={12}
                                height={7}
                                viewBox='0 0 12 7'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M1 1L6 6L11 1'
                                  stroke=''
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  fill='none'
                                />
                              </svg>
                            </button>
                            <div
                              className={
                                isAccordion == 4 ? 'collapse' : 'collapse show'
                              }
                              id='collapseDuration'
                            >
                              <div className='card card-body'>
                                <p>{tourPackage.instructionShortDescription}</p>
                              </div>
                            </div>
                          </div>
                        </div>{' '}
                      </Tab>
                      <Tab eventKey='profile' title='Itinerary'>
                        {(tourPackage as any).itineraryActive !== false &&
                          tourPackage.itinerary &&
                          tourPackage.itinerary.length > 0 && (
                            <div className='box-collapse-expand'>
                              {tourPackage.itinerary.map(
                                (item: any, index: number) => (
                                  <div
                                    className='group-collapse-expand'
                                    key={index}
                                  >
                                    <button
                                      className={
                                        isAccordion === index
                                          ? 'btn btn-collapse'
                                          : 'btn btn-collapse collapsed'
                                      }
                                      type='button'
                                      data-bs-toggle='collapse'
                                      data-bs-target={`#collapseHighlight${index}`}
                                      aria-expanded={isAccordion === index}
                                      aria-controls={`collapseHighlight${index}`}
                                      onClick={() => handleAccordion(index)}
                                    >
                                      <h6 style={{ textAlign: 'left' }}>
                                        Day {item.day}: {item.title}
                                      </h6>
                                      <svg
                                        width={12}
                                        height={7}
                                        viewBox='0 0 12 7'
                                        xmlns='http://www.w3.org/2000/svg'
                                      >
                                        <path
                                          d='M1 1L6 6L11 1'
                                          stroke=''
                                          strokeWidth='1.5'
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          fill='none'
                                        />
                                      </svg>
                                    </button>
                                    <div
                                      className={
                                        isAccordion === index
                                          ? 'collapse show'
                                          : 'collapse'
                                      }
                                      id={`#collapseHighlight${index}`}
                                    >
                                      <div className='card card-body'>
                                        <p>{item.description}</p>
                                        <p>{item.activity}</p>
                                        <strong>Highlights:</strong>
                                        <ul
                                          style={{
                                            color: '#104c71e0',
                                            paddingLeft: '20px',
                                          }}
                                        >
                                          {item.highlights.map(
                                            (highlight: string, i: number) => (
                                              <li key={i}>{highlight}</li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                              ;
                            </div>
                          )}
                      </Tab>
                    </Tabs>
                    <style jsx>{`
                      .custom-tabs .nav-link {
                        font-size: 1.25rem; /* Increase font size */
                        font-weight: bold; /* Make font bold */
                        padding: 15px 30px; /* Add padding for larger size */
                        margin-right: 100px; /* Add gap between tabs */
                        border-radius: 8px; /* Optional: rounded corners */
                        transition: all 0.3s ease;
                      }
                      .custom-tabs .nav-link.active {
                        background-color: #111827; /* Active tab background */
                        color: white; /* Active tab text color */
                      }
                      .custom-tabs .nav-link:hover {
                        background-color: #f3f4f6; /* Hover effect */
                        color: #111827;
                      }
                    `}</style>
                  </div>
                  <div className='container mt-4'>
                    <div className='tab-content mt-4'>
                      {activeTab === 'overview' && (
                        <div className='tab-pane p-4'>
                          {tourPackage.description}
                        </div>
                      )}
                      {activeTab === 'itinerary' && (
                        <div className='tab-pane p-4'>
                          {tourPackage.highlights.map(
                            (highlight: string, index: number) => (
                              <p key={index}>• {highlight}</p>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <style jsx>{`
                      .tab-buttons {
                        display: flex;
                        gap: 10px;
                        justify-content: center;
                        margin-bottom: 20px;
                      }
                      .custom-tab {
                        padding: 10px 30px;
                        border: 2px solid #e5e7eb;
                        border-radius: 25px;
                        background: white;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.3s ease;
                      }
                      .custom-tab.active {
                        background: #111827;
                        color: white;
                        border-color: #111827;
                      }
                      .tab-pane {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                      }
                    `}</style>
                  </div>
                </div>
                <div className='col-lg-4'>
                  <div className='booking-form'>
                    <div className='head-booking-form'>
                      <p className='text-xl-bold neutral-1000'>Booking Form</p>
                    </div>
                    <BookingForm packageName={tourPackage.name} />
                  </div>
                  <div className='sidebar-left border-1 background-body'>
                    <h6 className='text-lg-bold neutral-1000'>Popular Tours</h6>
                    <div className='box-popular-posts box-popular-posts-md'>
                      <p className='text-sm text-gray-500'>
                        More tours coming soon...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className='section-box box-media background-body gallery-section'>
            <div className='container-media wow fadeInUp'>
              {/* <Gallery /> */}
            </div>
            <style jsx>{`
              .gallery-section {
                display: block;
              }
              @media (max-width: 768px) {
                .gallery-section {
                  display: none;
                }
              }
            `}</style>
          </section>
        </main>
      </Layout>
    </>
  );
}

export default dynamic(() => Promise.resolve(TourDetail2), {
  ssr: false,
});
