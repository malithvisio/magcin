'use client';
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import BlogCard1 from '@/components/blog/BlogCard1';
import { getCurrentRootUserId } from '@/util/root-user-config';
import Link from 'next/link';

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

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [sortBy, setSortBy] = useState('position');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [populatingData, setPopulatingData] = useState(false);

  // Get unique categories and authors from fetched data
  const categories = [
    'All',
    ...Array.from(new Set(blogs.map(blog => blog.category).filter(Boolean))),
  ];
  const authors = [
    'All',
    ...Array.from(new Set(blogs.map(blog => blog.author).filter(Boolean))),
  ];

  // Fetch blogs from database
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError('');

        // Get the current root user ID
        const rootUserId = getCurrentRootUserId();
        console.log('Blog page - Current rootUserId:', rootUserId);

        // Fetch blogs from API with root user filtering (include unpublished for debugging)
        const response = await fetch(
          `/api/blogs?rootUserId=${rootUserId}&limit=100`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Blog page - API response:', result);

        if (result.success && result.data) {
          console.log(
            'Blog page - Setting blogs:',
            result.data.length,
            'blogs'
          );
          setBlogs(result.data);
        } else {
          console.log('Blog page - No blogs found or API error');
          setBlogs([]);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs');
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter and sort blogs
  useEffect(() => {
    let filtered = blogs.filter(blog => blog.published);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        blog =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.tags.some(tag =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(blog => blog.category === selectedCategory);
    }

    // Filter by author
    if (selectedAuthor !== 'All') {
      filtered = filtered.filter(blog => blog.author === selectedAuthor);
    }

    // Sort blogs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'position':
          return a.position - b.position;
        case 'date':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        default:
          return 0;
      }
    });

    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, selectedCategory, selectedAuthor, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedAuthor('All');
    setSortBy('position');
  };

  const populateSampleData = async () => {
    try {
      setPopulatingData(true);
      const response = await fetch('/api/blogs/populate-sample-data', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Sample data populated:', result);
        // Refresh the blogs after populating
        window.location.reload();
      } else {
        console.error('Failed to populate sample data');
      }
    } catch (error) {
      console.error('Error populating sample data:', error);
    } finally {
      setPopulatingData(false);
    }
  };

  const publishExistingBlogs = async () => {
    try {
      setPopulatingData(true);
      // Get all blogs for current root user
      const response = await fetch(
        `/api/blogs?rootUserId=${getCurrentRootUserId()}&limit=100`
      );
      if (response.ok) {
        const result = await response.json();
        const unpublishedBlogs = result.data.filter(
          (blog: BlogItem) => !blog.published
        );

        if (unpublishedBlogs.length > 0) {
          // Publish each unpublished blog
          for (const blog of unpublishedBlogs) {
            await fetch(`/api/blogs/${blog._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ published: true }),
            });
          }
          console.log(`Published ${unpublishedBlogs.length} blogs`);
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error publishing blogs:', error);
    } finally {
      setPopulatingData(false);
    }
  };

  if (loading) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='container py-5 text-center'>
          <div className='bg-blue-50 rounded-lg p-8 shadow-sm border border-blue-200'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-blue-700 text-lg font-medium'>
              Loading blogs...
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
            <div className='text-red-500 mb-4'>
              <svg
                className='mx-auto h-16 w-16'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h3 className='text-2xl font-bold text-red-900 mb-2'>
              Error Loading Blogs
            </h3>
            <p className='text-red-700 mb-6'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors'
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerStyle={1} footerStyle={2}>
      {/* Hero Section */}
      <section
        className='relative  text-white py-20'
        style={{
          background:
            'linear-gradient(90deg,rgb(161, 163, 22) 0%,rgb(18, 195, 207) 100%)',
        }}
      >
        <div className='container mx-auto px-4 relative z-10'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-6xl font-bold mb-6 leading-tight'>
              Travel Blog
            </h1>
            <p className='text-xl md:text-2xl mb-8 text-green-100'>
              Discover amazing travel stories, tips, and insights from our
              expert travelers
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          {filteredBlogs.length === 0 ? (
            <div className='text-center py-20'>
              <div className='text-black mb-4'>
                <svg
                  className='mx-auto h-8 w-8'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                No blogs found
              </h3>
              {/* <div className='text-sm text-gray-500 mb-4'>
                Current Root User ID: {getCurrentRootUserId()}
                <br />
                Total blogs found: {blogs.length}
                <br />
                Published blogs: {blogs.filter(blog => blog.published).length}
                <br />
                Unpublished blogs:{' '}
                {blogs.filter(blog => !blog.published).length}
              </div> */}
              <p className='text-gray-600 mb-6'>
                {blogs.length === 0
                  ? 'No blogs have been published yet. Check back soon for travel stories and tips!'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                {blogs.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors'
                  >
                    Clear Filters
                  </button>
                )}
                {/* {blogs.length === 0 && (
                  <>
                    <button
                      onClick={populateSampleData}
                      disabled={populatingData}
                      className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {populatingData
                        ? 'Creating Sample Blogs...'
                        : 'Create Sample Blogs'}
                    </button>
                    <button
                      onClick={publishExistingBlogs}
                      disabled={populatingData}
                      className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {populatingData
                        ? 'Publishing Blogs...'
                        : 'Publish Existing Blogs'}
                    </button>
                  </>
                )} */}
              </div>
            </div>
          ) : (
            <div className='space-y-16'>
              {/* Blog Header */}
              <div className='text-center mb-6'>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                  Latest Travel Stories
                </h2>
                <div className='w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto rounded-full'></div>
              </div>

              {/* Blog Grid */}
              <div className='blog-grid'>
                {filteredBlogs.map(blog => (
                  <div key={blog._id}>
                    <BlogCard1 item={blog} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section
        className='text-white py-16'
        style={{
          background:
            'linear-gradient(90deg,rgb(161, 163, 22) 0%,rgb(18, 195, 207) 100%)',
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            Ready to Share Your Travel Story?
          </h2>
          <p className='text-xl mb-8 text-green-100 max-w-2xl mx-auto'>
            Join our community of travel writers and share your adventures with
            the world.
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
              className='border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-green-600 transition-colors'
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .blog-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          padding: 0 20px;
        }

        @media (min-width: 768px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.5rem;
            padding: 0 2rem;
          }
        }

        @media (min-width: 1024px) {
          .blog-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 3rem;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
          }
        }

        .blog-card-container {
          display: flex;
          justify-content: center;
          height: 100%;
          min-height: 500px;
        }

        .blog-card-container > div {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </Layout>
  );
}
