'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import dynamic from 'next/dynamic';
import { apiRequest } from '@/util/api-utils';
import { useAuth } from '@/contexts/AuthContext';
import 'react-quill/dist/quill.snow.css';

// Hook to detect mobile screen
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Blog {
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

interface Category {
  _id: string;
  name: string;
  createdAt: string;
}

export default function EditBlog() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const blogId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [blogLoaded, setBlogLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // State for all fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [tabTitle, setTabTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await apiRequest('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategoryOptions(data.categories || []);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch blog data on component mount
  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) {
        setError('Blog ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiRequest(`/api/blogs/${blogId}`);

        if (response.ok) {
          const blog: Blog = await response.json();

          // Populate form fields with blog data
          setTitle(blog.title || '');
          setDescription(blog.description || '');
          setContent(blog.content || '');
          setImageUrl(blog.imageUrl || '');
          setImageAlt(blog.imageAlt || '');
          setShortDesc(blog.shortDescription || '');
          setTabTitle(blog.metaTitle || '');
          setMetaDescription(blog.metaDescription || '');
          setCategory(blog.category || '');
          setAuthor(blog.author || 'Admin');
          setCategories(blog.tags || []);
          setBlogLoaded(true);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch blog');
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to fetch blog data');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    fetchCategories();
  }, [blogId]);

  // Firebase image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 5MB.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('blogId', blogId);
      if (imageUrl) {
        formData.append('oldImageUrl', imageUrl);
      }

      // Get auth headers but exclude Content-Type for FormData
      if (!user) {
        throw new Error('User not authenticated');
      }

      const headers: HeadersInit = {
        'x-user-id': user.id,
        'x-user-email': user.email,
        'x-tenant-id': user.tenantId || '',
      };

      if (user.companyId) {
        (headers as any)['x-company-id'] = user.companyId;
      }

      console.log('Uploading blog image:', {
        fileName: file.name,
        size: file.size,
        blogId,
      });

      const response = await fetch('/api/blogs/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      console.log('Upload successful:', data);

      // Update the image URL
      setImageUrl(data.url);

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Category add/remove
  const handleAddCategory = () => {
    if (categoryInput && !categories.includes(categoryInput)) {
      setCategories([...categories, categoryInput]);
      setCategoryInput('');
    }
  };
  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  // Handle save functionality
  const handleSave = async (publish: boolean = false) => {
    if (!blogId) return;

    try {
      setSaving(true);

      const response = await apiRequest(`/api/blogs/${blogId}`, {
        method: 'PUT',
        body: {
          title,
          description,
          content,
          imageUrl,
          imageAlt,
          shortDescription: shortDesc,
          metaTitle: tabTitle,
          metaDescription,
          category,
          author,
          tags: categories,
          published: publish,
        },
      });

      if (response.ok) {
        alert(
          publish ? 'Blog published successfully!' : 'Blog saved as draft!'
        );
        router.push('/admin/blogs');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to save blog'}`);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div
          style={{
            background: '#f4f4f4',
            minHeight: '100vh',
            padding: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, color: '#444', marginBottom: 16 }}>
              Loading blog data...
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              Please wait while we fetch the blog information.
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div
          style={{
            background: '#f4f4f4',
            minHeight: '100vh',
            padding: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, color: '#dc2626', marginBottom: 16 }}>
              Error Loading Blog
            </div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
              {error}
            </div>
            <button
              onClick={() => router.push('/admin/blogs')}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontWeight: 500,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Back to Blogs
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div
        style={{
          background: '#f4f4f4',
          minHeight: '100vh',
          padding: isMobile ? '16px' : '32px',
        }}
      >
        <div
          style={{
            background: '#ededed',
            borderRadius: 8,
            padding: isMobile ? '16px' : '24px',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: isMobile ? 16 : 24,
              padding: isMobile ? '12px 0' : '16px 0',
              flexWrap: 'wrap',
              gap: isMobile ? '4px' : '8px',
            }}
          >
            {/* Home Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: '#2563eb',
                borderRadius: '8px',
                marginRight: '12px',
                flexShrink: 0,
              }}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M9 22V12H15V22'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            {/* Chevron */}
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              style={{ flexShrink: 0 }}
            >
              <path
                d='M9 18L15 12L9 6'
                stroke='#9ca3af'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span
              style={{
                color: '#000000',
                fontWeight: '600',
                fontFamily: 'sans-serif',
                fontSize: '14px',
              }}
            >
              Blogs
            </span>
            {/* Chevron */}
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              style={{ flexShrink: 0 }}
            >
              <path
                d='M9 18L15 12L9 6'
                stroke='#9ca3af'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span
              style={{
                color: '#374151',
                fontWeight: '600',
                fontFamily: 'sans-serif',
                fontSize: '14px',
              }}
            >
              {title || 'Edit Article'}
            </span>
          </div>
          {blogLoaded && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                fontSize: 14,
                color: '#166534',
              }}
            >
              ✅ Blog data loaded successfully! You can now edit the fields
              below.
            </div>
          )}
          <div style={{ marginBottom: isMobile ? 12 : 18 }}>
            <label
              style={{
                fontWeight: 500,
                color: '#444',
                fontSize: isMobile ? 14 : 16,
              }}
            >
              Title *
            </label>
            <input
              type='text'
              placeholder='Enter Title'
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? 10 : 12,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginTop: 6,
                fontSize: isMobile ? 15 : 16,
              }}
            />
          </div>
          <div style={{ marginBottom: isMobile ? 12 : 18 }}>
            <label
              style={{
                fontWeight: 500,
                color: '#444',
                fontSize: isMobile ? 14 : 16,
              }}
            >
              Description *
            </label>
            <div style={{ marginTop: 6 }}>
              <ReactQuill
                value={description}
                onChange={setDescription}
                theme='snow'
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ color: [] }, { background: [] }],
                    [{ align: [] }],
                    ['clean'],
                  ],
                }}
                formats={[
                  'header',
                  'bold',
                  'italic',
                  'underline',
                  'color',
                  'background',
                  'align',
                ]}
                style={{ background: '#fff', borderRadius: 8 }}
              />
            </div>
          </div>
          <div style={{ marginBottom: isMobile ? 12 : 18 }}>
            <label
              style={{
                fontWeight: 500,
                color: '#444',
                fontSize: isMobile ? 14 : 16,
              }}
            >
              Content (Main Article)
            </label>
            <div style={{ marginTop: 6 }}>
              <ReactQuill
                value={content}
                onChange={setContent}
                theme='snow'
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ color: [] }, { background: [] }],
                    [{ align: [] }],
                    ['link', 'image'],
                    ['clean'],
                  ],
                }}
                formats={[
                  'header',
                  'bold',
                  'italic',
                  'underline',
                  'color',
                  'background',
                  'align',
                  'link',
                  'image',
                ]}
                style={{ background: '#fff', borderRadius: 8 }}
              />
            </div>
          </div>
          <div style={{ marginBottom: isMobile ? 12 : 18 }}>
            <label
              style={{
                fontWeight: 500,
                color: '#444',
                fontSize: isMobile ? 14 : 16,
              }}
            >
              Blog Header Image
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 8 : 16,
                marginTop: 8,
                flexWrap: isMobile ? 'wrap' : 'nowrap',
              }}
            >
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id='blog-image-upload'
              />
              <label
                htmlFor='blog-image-upload'
                style={{
                  background: uploading ? '#9ca3af' : '#d1d5db',
                  color: uploading ? '#6b7280' : '#444',
                  padding: '8px 18px',
                  borderRadius: 8,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  opacity: uploading ? 0.7 : 1,
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
              {uploading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      border: '2px solid #e5e7eb',
                      borderTop: '2px solid #2563eb',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <span style={{ fontSize: 14, color: '#666' }}>
                    {uploadProgress}%
                  </span>
                </div>
              )}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt='preview'
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '1px solid #ccc',
                  }}
                />
              )}
            </div>
            <div
              style={{
                display: 'flex',
                gap: isMobile ? 8 : 16,
                marginTop: 12,
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <input
                type='text'
                placeholder='Enter Alt Text'
                value={imageAlt}
                onChange={e => setImageAlt(e.target.value)}
                style={{
                  flex: isMobile ? 'none' : 1,
                  padding: isMobile ? 10 : 10,
                  borderRadius: 8,
                  border: '1px solid #ccc',
                  fontSize: isMobile ? 14 : 15,
                }}
              />
              <input
                type='text'
                placeholder='Image URL (auto-filled after upload)'
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                style={{
                  flex: isMobile ? 'none' : 2,
                  padding: isMobile ? 10 : 10,
                  borderRadius: 8,
                  border: '1px solid #ccc',
                  fontSize: isMobile ? 14 : 15,
                }}
              />
            </div>
            {imageUrl && (
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  background: '#f0fdf4',
                  border: '1px solid #22c55e',
                  borderRadius: 6,
                  fontSize: 14,
                  color: '#166534',
                }}
              >
                ✅ Image uploaded successfully to Firebase Storage
              </div>
            )}
          </div>
          <div style={{ marginBottom: isMobile ? 12 : 18 }}>
            <label
              style={{
                fontWeight: 500,
                color: '#444',
                fontSize: isMobile ? 14 : 16,
              }}
            >
              Short Description (For meta description, Total characters less
              than 168)
            </label>
            <input
              type='text'
              placeholder='Enter short description'
              value={shortDesc}
              onChange={e => setShortDesc(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? 10 : 12,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginTop: 6,
                fontSize: isMobile ? 15 : 16,
              }}
            />
          </div>
          <div style={{ marginBottom: isMobile ? 12 : 18 }}>
            <label
              style={{
                fontWeight: 500,
                color: '#444',
                fontSize: isMobile ? 14 : 16,
              }}
            >
              Tab Title
            </label>
            <input
              type='text'
              placeholder='Enter tab title'
              value={tabTitle}
              onChange={e => setTabTitle(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? 10 : 12,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginTop: 6,
                fontSize: isMobile ? 15 : 16,
              }}
            />
          </div>
          <div style={{ marginBottom: isMobile ? 12 : 18 }}>
            <label
              style={{
                fontWeight: 500,
                color: '#444',
                fontSize: isMobile ? 14 : 16,
              }}
            >
              Meta Description
            </label>
            <textarea
              placeholder='Enter meta description'
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? 10 : 12,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginTop: 6,
                fontSize: isMobile ? 15 : 16,
                minHeight: isMobile ? 60 : 80,
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ marginBottom: isMobile ? 12 : 18 }}>
            <label
              style={{
                fontWeight: 500,
                color: '#444',
                fontSize: isMobile ? 14 : 16,
              }}
            >
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? 10 : 12,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginTop: 6,
                fontSize: isMobile ? 15 : 16,
              }}
            >
              <option value=''>Select a category</option>
              {categoryOptions.map(option => (
                <option key={option._id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: isMobile ? 12 : 18 }}>
            <label
              style={{
                fontWeight: 500,
                color: '#444',
                fontSize: isMobile ? 14 : 16,
              }}
            >
              Author
            </label>
            <input
              type='text'
              placeholder='Enter author name'
              value={author}
              onChange={e => setAuthor(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? 10 : 12,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginTop: 6,
                fontSize: isMobile ? 15 : 16,
              }}
            />
          </div>
          <div style={{ marginBottom: isMobile ? 12 : 18 }}>
            <label
              style={{
                fontWeight: 500,
                color: '#444',
                fontSize: isMobile ? 14 : 16,
              }}
            >
              Tags
            </label>
            <div
              style={{
                display: 'flex',
                gap: isMobile ? 8 : 12,
                marginTop: 6,
                alignItems: 'center',
                flexWrap: isMobile ? 'wrap' : 'nowrap',
              }}
            >
              <input
                type='text'
                placeholder='Add tag'
                value={categoryInput}
                onChange={e => setCategoryInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #ccc',
                  fontSize: 15,
                }}
              />
              <button
                type='button'
                onClick={handleAddCategory}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginTop: 10,
              }}
            >
              {categories.map(cat => (
                <span
                  key={cat}
                  style={{
                    background: '#e0e7ef',
                    color: '#2563eb',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontWeight: 500,
                    fontSize: 15,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {cat}{' '}
                  <span
                    style={{
                      cursor: 'pointer',
                      color: '#64748b',
                      marginLeft: 4,
                    }}
                    onClick={() => handleRemoveCategory(cat)}
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div
            className='action-buttons-container'
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              marginTop: 32,
            }}
          >
            <button
              onClick={() => router.push('/admin/blogs')}
              style={{
                background: '#f3f4f6',
                color: '#2563eb',
                border: 'none',
                borderRadius: 6,
                padding: '10px 24px',
                fontWeight: 500,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              style={{
                background: saving ? '#9ca3af' : '#e5e7eb',
                color: '#2563eb',
                border: 'none',
                borderRadius: 6,
                padding: '10px 24px',
                fontWeight: 500,
                fontSize: 15,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {saving ? 'Saving...' : 'Save as draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              style={{
                background: saving ? '#9ca3af' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 24px',
                fontWeight: 600,
                fontSize: 15,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {saving ? 'Saving...' : 'Save and Publish'}
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .ql-editor {
          color: #111;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Mobile responsive for action buttons */
        @media (max-width: 768px) {
          .action-buttons-container {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }

          .action-buttons-container button {
            width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
