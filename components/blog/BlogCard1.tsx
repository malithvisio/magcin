'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogItem {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  tags: string[];
  category: string;
  author: string;
  published: boolean;
  position: number;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogCard1Props {
  item: BlogItem;
}

export default function BlogCard1({ item }: BlogCard1Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden h-full flex flex-col'>
      {/* Image Container */}
      <div className='relative overflow-hidden h-48 image-container'>
        <Image
          src={item.imageUrl || '/assets/images/blog/default-blog.jpg'}
          alt={item.imageAlt || item.title}
          fill
          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'></div>

        {/* Category Badge */}
        <div className='absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1'>
          <span className='text-sm font-semibold text-gray-800'>
            {item.category}
          </span>
        </div>

        {/* Published Badge */}
        {item.published && (
          <div className='absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1'>
            <span className='text-sm font-semibold text-gray-800'>
              Published
            </span>
          </div>
        )}

        {/* Tags Count Badge */}
        {/* <div className='absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1'>
          <svg
            className='w-4 h-4 text-green-500 fill-current'
            viewBox='0 0 20 20'
          >
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
          <span className='text-sm font-semibold text-gray-800'>
            {item.tags?.length || 0} Tags
          </span>
        </div> */}
      </div>

      {/* Content */}
      <div className='p-6 flex-1 flex flex-col justify-between content-area'>
        {/* Title */}
        <h3 className='text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors'>
          <Link href={`/blog/${item.slug}`}>{item.title}</Link>
        </h3>

        {/* Short Description */}
        <p className='text-gray-600 mb-4 leading-relaxed line-clamp-3 -1 description'>
          {truncateText(item.shortDescription || item.description, 70)}
        </p>

        {/* Meta Information */}
        <div className='flex items-center justify-between text-sm text-gray-500 mb-3'>
          <span className='flex items-center text-gray-600'>
            <svg
              className='w-4 h-4 mr-1'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                clipRule='evenodd'
              />
            </svg>
            {item.author}
          </span>
          <span className='flex items-center text-gray-600'>
            <svg
              className='w-4 h-4 mr-1'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                clipRule='evenodd'
              />
            </svg>
            {formatDate(item.createdAt)}
          </span>
        </div>

        {/* Tags */}
        {/* {item.tags && item.tags.length > 0 && (
          <div className='mb-4'>
            <div className='flex flex-wrap gap-2'>
              {item.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className='bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full'
                >
                  #{tag}
                </span>
              ))}
              {item.tags.length > 2 && (
                <span className='text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full'>
                  +{item.tags.length - 2} more
                </span>
              )}
            </div>
          </div>
        )} */}

        {/* Action Button */}
        <div className='flex justify-between items-center mt-auto pt-1 border-t border-gray-100'>
          <Link
            href={`/blog/${item.slug}`}
            className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-center mr-3'
            style={{
              background: 'linear-gradient(90deg, #64a25f 0%, #059669 100%)',
            }}
          >
            Read More
          </Link>
          {/* <Link
            href={`/blog/${item.slug}`}
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

      <style jsx>{`
        .group {
          height: 100%;
          display: flex;
          flex-direction: column;
          min-height: 450px;
          width: 100%;
        }

        .group .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .group .description {
          flex: 1;
          min-height: 20px;
        }

        .group .image-container {
          height: 200px;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .group {
            min-height: 00px;
          }
        }

        @media (min-width: 1024px) {
          .group {
            min-height: 50px;
          }
        }
      `}</style>
    </div>
  );
}
