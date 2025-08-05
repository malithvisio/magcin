'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { RowsPhotoAlbum, Photo } from 'react-photo-album';
import 'react-photo-album/rows.css';
import { getCurrentRootUserId } from '@/util/root-user-config';

interface GalleryImage {
  _id?: string;
  url: string;
  path: string;
  alt: string;
  topic: string;
  order: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploaded: boolean;
}

interface Gallery {
  _id: string;
  name: string;
  description: string;
  images: GalleryImage[];
}

export default function GalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGallery, setSelectedGallery] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        const rootUserId = getCurrentRootUserId();
        const response = await fetch(
          `/api/gallery/public?rootUserId=${rootUserId}`
        );
        const data = await response.json();

        if (data.success) {
          const galleriesData = data.galleries || [];
          setGalleries(galleriesData);
          // Set the first gallery as selected by default
          if (galleriesData.length > 0) {
            setSelectedGallery(galleriesData[0]._id);
          }
        } else {
          setError(data.error || 'Failed to load galleries');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load galleries');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  const handleGallerySelect = (galleryId: string) => {
    setSelectedGallery(galleryId);
  };

  const getCurrentGallery = () => {
    return galleries.find(gallery => gallery._id === selectedGallery);
  };

  const getPhotosForGallery = (gallery: Gallery) => {
    return gallery.images
      .sort((a, b) => a.order - b.order)
      .map((image, index) => ({
        src: image.url,
        width: 800, // Default width - you can adjust based on your needs
        height: 600, // Default height - you can adjust based on your needs
        alt: image.alt || image.topic,
        title: image.topic,
        // Add custom data attribute for CSS overlay
        'data-title': image.topic,
        // You can add srcSet for responsive images if you have multiple resolutions
        // srcSet: [
        //   { src: image.url.replace('.jpg', '_400x300.jpg'), width: 400, height: 300 },
        //   { src: image.url.replace('.jpg', '_200x150.jpg'), width: 200, height: 150 },
        // ],
      }));
  };

  if (loading) {
    return (
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
                  <span className='text-breadcrumb'>Gallery</span>
                </li>
              </ul>
            </div>
          </section>
          <section className='section-box box-blog-slide background-body'>
            <div className='container'>
              <div className='text-center py-20'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto'></div>
                <p className='mt-4 text-gray-600'>Loading galleries...</p>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    );
  }

  if (error) {
    return (
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
                  <span className='text-breadcrumb'>Gallery</span>
                </li>
              </ul>
            </div>
          </section>
          <section className='section-box box-blog-slide background-body'>
            <div className='container'>
              <div className='text-center py-20'>
                <p className='text-red-600 text-lg'>{error}</p>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    );
  }

  const currentGallery = getCurrentGallery();

  return (
    <Layout headerStyle={1} footerStyle={2}>
      <style jsx>{`
        /* Custom styling for photo album images */
        .react-photo-album--row > div {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
        }

        .react-photo-album--row img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .react-photo-album--row > div:hover img {
          transform: scale(1.05);
        }

        /* Add overlay to each image with proper positioning - hidden by default */
        .react-photo-album--row > div::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(
            transparent,
            rgba(0, 0, 0, 0.7) 30%,
            rgba(0, 0, 0, 0.9)
          );
          z-index: 5;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        /* Add text overlay - hidden by default */
        .react-photo-album--row > div::after {
          content: attr(data-title);
          position: absolute;
          bottom: 15px;
          left: 15px;
          right: 15px;
          color: white;
          font-size: 14px;
          font-weight: 700;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
          line-height: 1.4;
          z-index: 10;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        /* Show overlay and text on hover */
        .react-photo-album--row > div:hover::before,
        .react-photo-album--row > div:hover::after {
          opacity: 1;
        }

        /* Ensure the photo album container respects our custom styling */
        .react-photo-album--row {
          gap: 8px;
        }
      `}</style>

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
                <span className='text-breadcrumb'>Gallery</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Hero Section */}
        <section
          className='relative text-white py-16 md:py-20 '
          style={{
            background:
              'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
          }}
        >
          <div className='absolute inset-0 bg-black opacity-20'></div>
          <div className='container mx-auto px-4 relative z-10'>
            <div className='text-center max-w-4xl mx-auto'>
              <h1 className='text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight'>
                Explore our Gallery!
              </h1>
              <p className='text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-green-100 px-4'>
                Explore the breathtaking beauty of Sri Lanka through our
                collection of stunning destinations
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Albums Section */}
        <section className='section-box box-blog-slide background-body w-full '>
          <div className='w-full max-w-full px-4 md:px-6 lg:px-8'>
            {galleries.length === 0 ? (
              <div className='text-center py-20'>
                <p className='text-gray-600 text-lg'>No galleries found.</p>
              </div>
            ) : (
              <div className='space-y-6 md:space-y-8'>
                {/* Album Tabs */}
                <div className='gallery-tabs w-full'>
                  <div className='flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8 w-full'>
                    {galleries.map(gallery => (
                      <button
                        key={gallery._id}
                        onClick={() => handleGallerySelect(gallery._id)}
                        className={` mt-30 px-3 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4 rounded-lg font-medium text-sm md:text-base transition-all duration-300 whitespace-nowrap ${
                          selectedGallery === gallery._id
                            ? 'bg-green-600 text-white  transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                        }`}
                      >
                        {gallery.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Gallery Content */}
                {currentGallery && (
                  <div className='gallery-content w-full'>
                    {/* Gallery Header */}
                    <div className='text-center mb-6 md:mb-8 px-4'>
                      {currentGallery.description && (
                        <p className='text-base md:text-lg text-gray-600 max-w-3xl mx-auto'>
                          {currentGallery.description}
                        </p>
                      )}
                    </div>

                    {/* Gallery Images */}
                    {currentGallery.images &&
                    currentGallery.images.length > 0 ? (
                      <div className='gallery-grid-container w-full'>
                        <RowsPhotoAlbum
                          photos={getPhotosForGallery(currentGallery)}
                          targetRowHeight={300}
                          defaultContainerWidth={1200}
                          sizes={{
                            size: 'calc(100vw - 32px)',
                            sizes: [
                              {
                                viewport: '(max-width: 1200px)',
                                size: 'calc(100vw - 32px)',
                              },
                              {
                                viewport: '(max-width: 768px)',
                                size: 'calc(100vw - 16px)',
                              },
                            ],
                          }}
                        />
                      </div>
                    ) : (
                      <div className='text-center py-12 bg-gray-50 rounded-lg mx-4'>
                        <p className='text-gray-500'>
                          No images in this album yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
