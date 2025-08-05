'use client';
import Layout from '@/components/layout/Layout';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPost {
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

export default function BlogDetails() {
  const router = useRouter();
  const params = useParams();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const slug = params?.id;

  useEffect(() => {
    const fetchBlogData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch the main blog post
        const blogResponse = await fetch(`/api/blogs/slug/${slug}`);
        if (blogResponse.ok) {
          const blogResult = await blogResponse.json();
          if (blogResult.success && blogResult.data) {
            setBlogPost(blogResult.data);

            // Fetch related posts
            const relatedResponse = await fetch(`/api/blogs/related/${slug}`);
            if (relatedResponse.ok) {
              const relatedResult = await relatedResponse.json();
              if (relatedResult.success && relatedResult.data) {
                setRelatedPosts(relatedResult.data);
              }
            }
          } else {
            setError('Blog post not found');
          }
        } else {
          setError('Failed to load blog post');
        }
      } catch (error) {
        console.error('Error fetching blog data:', error);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatContent = (content: string) => {
    // If content contains HTML tags, render it as HTML
    if (content.includes('<') && content.includes('>')) {
      return (
        <div
          className='prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-strong:text-gray-900 prose-em:text-gray-700 prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-hr:border-gray-300'
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // Fallback to markdown-style formatting for backward compatibility
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return <br key={index} />;
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <h3
            key={index}
            className='text-2xl font-bold text-gray-900 mt-8 mb-4'
          >
            {paragraph.slice(2, -2)}
          </h3>
        );
      }
      if (paragraph.startsWith('- **')) {
        const text = paragraph.slice(4, -2);
        return (
          <li key={index} className='ml-6 mb-3 text-lg'>
            <strong className='text-green-700'>{text}</strong>
          </li>
        );
      }
      if (paragraph.startsWith('- ')) {
        return (
          <li key={index} className='ml-6 mb-3 text-lg text-gray-700'>
            {paragraph.slice(2)}
          </li>
        );
      }
      if (paragraph.match(/^\d+\.\s/)) {
        return (
          <li
            key={index}
            className='ml-6 mb-3 text-lg list-decimal text-gray-700'
          >
            {paragraph.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      return (
        <p key={index} className='mb-6 text-lg leading-relaxed text-gray-700'>
          {paragraph}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
          <div className='text-center max-w-md'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4'></div>
            <h3 className='text-2xl font-bold text-gray-900 mb-3'>
              Loading blog post...
            </h3>
            <p className='text-gray-600'>
              Please wait while we fetch the blog content.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !blogPost) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
          <div className='text-center max-w-md'>
            <div className='text-black mb-1'>
              <svg
                className='mx-auto h-10 w-10'
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
            <h3 className='text-2xl font-bold text-gray-900 mb-3'>
              {error || 'Blog post not found'}
            </h3>
            <p className='text-gray-600 mb-6'>
              The blog post you're looking for doesn't exist or couldn't be
              loaded.
            </p>
            <Link
              href='/blog'
              className='inline-flex items-center px-6 py-3 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl'
              style={{
                background: 'linear-gradient(90deg, #64a25f 0%, #979311 100%)',
              }}
            >
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerStyle={1} footerStyle={2}>
      {/* Hero Section */}
      <section
        className='relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-16 md:py-24'
        style={{
          background: 'linear-gradient(90deg, #16a34a 0%, #047857 100%)',
        }}
      >
        {/* <div className='absolute inset-0 bg-black opacity-20'></div> */}
        <div className='container mx-auto px-4 relative z-10'>
          <div className='max-w-4xl mx-auto'>
            {/* Breadcrumb */}
            {/* <nav className='mb-8'>
              <ol className='flex items-center space-x-2 text-sm text-green-100'>
                <li>
                  <Link href='/' className='hover:text-white transition-colors'>
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link
                    href='/blog'
                    className='hover:text-white transition-colors'
                  >
                    Blog
                  </Link>
                </li>
                <li>/</li>
                <li className='text-white font-medium'>{blogPost.title}</li>
              </ol>
            </nav> */}

            {/* Hero Content */}
            <div className='text-center'>
              {/* <div className='flex flex-wrap justify-center gap-3 mb-6'>
                <span className='bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full'>
                  {blogPost.category}
                </span>
                {blogPost.published && (
                  <span className='bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-full'>
                    Published
                  </span>
                )}
              </div> */}
              <h1 className='text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
                {blogPost.title}
              </h1>
              {/* <p className='text-lg md:text-xl text-green-100 mb-8 max-w-3xl mx-auto'>
                {blogPost.shortDescription}
              </p> */}

              {/* Author and Date Info */}
              <div className='flex flex-col sm:flex-row items-center justify-center gap-4 text-green-100'>
                <div className='flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='font-medium'>By {blogPost.author}</span>
                </div>
                <div className='flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span>{formatDate(blogPost.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className='py-12 md:py-16 bg-gray-50 pb-70'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto'>
            {/* Featured Image */}
            <div className='mb-12'>
              <div className='relative h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl'>
                <Image
                  src={
                    blogPost.imageUrl || '/assets/images/blog/default-blog.jpg'
                  }
                  alt={blogPost.imageAlt || blogPost.title}
                  fill
                  className='object-cover'
                />
              </div>
            </div>

            {/* Article Content */}
            <article className='bg-white rounded-2xl shadow-lg overflow-hidden pb-30'>
              <div className='p-6 md:p-8 lg:p-12'>
                <h1 className='text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight blog-title'>
                  {blogPost.title}
                </h1>

                {/* Tags and Image Section */}
                <div className='mb-12'>
                  {/* Tags */}
                  {blogPost.tags && blogPost.tags.length > 0 && (
                    <div className='mb-8 p-6 bg-gray-50 rounded-lg'>
                      <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
                        <svg
                          className='w-5 h-5 mr-2 text-gray-600'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Related Tags
                      </h3>
                      <div className='flex flex-wrap gap-3'>
                        {blogPost.tags.map((tag, index) => (
                          <span
                            key={index}
                            className='bg-white text-gray-700 text-sm px-4 py-2 rounded-full font-medium border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer'
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blog Image from Database */}
                  <div
                    className='relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-xl overflow-hidden shadow-lg'
                    style={{ minHeight: '456px' }}
                  >
                    {blogPost.imageUrl ? (
                      <Image
                        src={blogPost.imageUrl}
                        alt={blogPost.imageAlt || blogPost.title}
                        fill
                        className='object-cover'
                        priority
                        sizes='(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw'
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full text-gray-500 bg-gray-100'>
                        <div className='text-center'>
                          <svg
                            className='w-16 h-16 mx-auto mb-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                          </svg>
                          <p className='text-lg font-medium'>
                            No Image Available
                          </p>
                          <p className='text-sm'>imageUrl field is empty</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <style jsx>{`
                  .blog-title {
                    color: #000000;
                  }

                  .tags-section {
                    background: linear-gradient(
                      135deg,
                      #1a1a1a 0%,
                      #2d2d2d 100%
                    );
                    border: 2px solid #333;
                  }

                  .tags-heading {
                    color: #ffffff;
                  }

                  .tag-icon {
                    color: #10b981;
                  }

                  .tag-item {
                    background: linear-gradient(
                      135deg,
                      #374151 0%,
                      #4b5563 100%
                    );
                    color: #ffffff;
                    border: 2px solid #6b7280;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                  }

                  .tag-item:hover {
                    background: linear-gradient(
                      135deg,
                      #4b5563 0%,
                      #6b7280 100%
                    );
                    border-color: #9ca3af;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
                  }
                `}</style>
                {/* Main Content */}
                <div className='mt-4 text-gray-700 leading-relaxed mb-30'>
                  {formatContent(blogPost.content)}
                </div>

                {/* SEO Meta Information */}
                <div className='mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200'>
                  {/* <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                    <svg
                      className='w-5 h-5 mr-2 text-green-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                    SEO Information
                  </h3> */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm '>
                    <div>
                      <span className='font-semibold text-gray-700 block mb-2'>
                        Meta Title: {blogPost.metaTitle}
                      </span>
                      {/* <p className='text-gray-600 bg-white p-3 rounded-lg border'>
                        {blogPost.metaTitle}
                      </p> */}
                    </div>
                    <div>
                      <span className='font-semibold text-gray-700 block mb-2'>
                        Meta Description:{blogPost.metaDescription}
                      </span>
                      {/* <p className='text-gray-600 bg-white p-3 rounded-lg border'>
                        {blogPost.metaDescription}
                      </p> */}
                    </div>
                    {/* <div>
                      <span className='font-semibold text-gray-700 block mb-2'>
                        Slug:
                      </span>
                      <p className='text-gray-600 bg-white p-3 rounded-lg border font-mono'>
                        {blogPost.slug}
                      </p>
                    </div> */}
                    {/* <div>
                      <span className='font-semibold text-gray-700 block mb-2'>
                        Blog ID:
                      </span>
                      <p className='text-gray-600 bg-white p-3 rounded-lg border font-mono'>
                        {blogPost._id}
                      </p>
                    </div> */}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className='py-12 md:py-16 bg-gray-50 pt-20 mb-20'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-12'>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                  Related Posts
                </h2>
                <div className='w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto rounded-full'></div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {relatedPosts.map(post => (
                  <div
                    key={post._id}
                    className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden h-full flex flex-col'
                  >
                    <div className='relative overflow-hidden h-48 image-container'>
                      <Image
                        src={
                          post.imageUrl ||
                          '/assets/images/blog/default-blog.jpg'
                        }
                        alt={post.imageAlt || post.title}
                        fill
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'></div>

                      {/* Category Badge */}
                      <div className='absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1'>
                        <span className='text-sm font-semibold text-gray-800'>
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className='p-6'>
                      <h3 className='text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors'>
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className='text-gray-600 mb-4 leading-relaxed line-clamp-3 description'>
                        {post.shortDescription
                          ? post.shortDescription.substring(0, 70) + '...'
                          : 'No description available'}
                      </p>

                      {/* Meta Info */}
                      <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
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
                          {post.author}
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
                          {formatDate(post.createdAt)}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className='flex justify-between items-center pt-4 border-t border-gray-100'>
                        <Link
                          href={`/blog/${post.slug}`}
                          className='flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center mr-3'
                          style={{
                            background:
                              'linear-gradient(90deg, #64a25f 0%, #979311 100%)',
                          }}
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section
        className='bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16 '
        style={{
          background: 'linear-gradient(90deg, #16a34a 0%, #047857 100%)',
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            Ready to Explore More?
          </h2>
          <p className='text-xl mb-8 text-green-100 max-w-2xl mx-auto'>
            Discover more amazing travel stories and tips from our expert
            writers.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/blog'
              className='text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl'
              style={{
                background: 'linear-gradient(90deg, #64a25f 0%, #979311 100%)',
              }}
            >
              Browse All Posts
            </Link>
            <Link
              href='/contact'
              className='border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-green-600 transition-colors'
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
