'use client';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRouter, useParams } from 'next/navigation';
import { FaStar } from 'react-icons/fa';
import { apiRequest } from '@/util/api-utils';
import { useToast } from '@/contexts/ToastContext';

interface Testimonial {
  _id: string;
  name: string;
  review: string;
  rating: number;
  image?: string;
  position: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditTestimonialPage() {
  const router = useRouter();
  const params = useParams();
  const testimonialId = params.id as string;
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);

  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState('');
  const [published, setPublished] = useState(true);

  const fetchTestimonial = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/testimonials/${testimonialId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch testimonial');
      }

      setTestimonial(data.testimonial);
      setName(data.testimonial.name);
      setReview(data.testimonial.review);
      setRating(data.testimonial.rating);
      setImage(data.testimonial.image || '');
      setPublished(data.testimonial.published);
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      showError('Failed to load testimonial');
    } finally {
      setLoading(false);
    }
  }, [testimonialId, showError]);

  useEffect(() => {
    if (testimonialId) {
      fetchTestimonial();
    }
  }, [testimonialId, fetchTestimonial]);

  const handleSave = async () => {
    if (!name || !review) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await apiRequest(`/api/testimonials/${testimonialId}`, {
        method: 'PUT',
        body: {
          name,
          review,
          rating,
          image,
          published,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update testimonial');
      }

      showSuccess('Testimonial updated successfully!');
      router.push('/admin/testimonials');
    } catch (error: any) {
      showError(`Error updating testimonial: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        size={20}
        color={i < rating ? '#ffd700' : '#e0e0e0'}
        style={{ cursor: 'pointer', marginRight: 4 }}
        onClick={() => setRating(i + 1)}
      />
    ));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 24 }}>
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p style={{ color: '#000' }}>Loading testimonial...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style jsx>{`
        @media (max-width: 768px) {
          .action-buttons-container {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .action-buttons-container button {
            width: 100% !important;
            margin-bottom: 8px;
          }
          .action-buttons-container button:last-child {
            margin-bottom: 0;
          }
        }
      `}</style>
      <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 24 }}>
        {/* Modern Responsive Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 24,
            padding: '16px 24px 0 24px',
            flexWrap: 'wrap',
            gap: '8px',
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

          {/* Breadcrumb Items */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              fontSize: '14px',
              color: '#6b7280',
            }}
          >
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
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'color 0.2s',
                fontFamily: 'sans-serif',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1d4ed8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#000000')}
              onClick={() => router.push('/admin/testimonials')}
            >
              Testimonials
            </span>

            {/* Chevron */}
            {/* <svg
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
              }}
            >
              Edit Testimonial
            </span> */}

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
              }}
            >
              {name || 'Loading...'}
            </span>
          </div>
        </div>

        <form
          style={{
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div>
            <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
              Name *
            </div>
            <input
              type='text'
              placeholder='Enter person name'
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1.5px solid #e0e0e0',
                fontSize: 16,
                color: '#444',
                background: '#fff',
                outline: 'none',
                fontWeight: 400,
              }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
              Review *
            </div>
            <textarea
              placeholder='Enter testimonial review'
              value={review}
              onChange={e => setReview(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1.5px solid #e0e0e0',
                fontSize: 16,
                color: '#444',
                background: '#fff',
                outline: 'none',
                fontWeight: 400,
                minHeight: 120,
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
              Rating
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {renderStars(rating)}
              <span style={{ color: '#666', fontSize: 16 }}>
                ({rating}/5 stars)
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
              Image URL (Optional)
            </div>
            <input
              type='text'
              placeholder='Enter image URL'
              value={image}
              onChange={e => setImage(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1.5px solid #e0e0e0',
                fontSize: 16,
                color: '#444',
                background: '#fff',
                outline: 'none',
                fontWeight: 400,
              }}
            />
            {image && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={image}
                  alt='Preview'
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    objectFit: 'cover',
                  }}
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
              Published
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type='checkbox'
                checked={published}
                onChange={e => setPublished(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  accentColor: '#2563eb',
                }}
              />
              <span style={{ color: '#666', fontSize: 16 }}>
                Make this testimonial visible on the website
              </span>
            </label>
          </div>

          <div
            className='action-buttons-container'
            style={{ display: 'flex', gap: 16, marginTop: 24 }}
          >
            <button
              type='button'
              onClick={handleSave}
              disabled={saving}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontWeight: 500,
                fontSize: 16,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type='button'
              onClick={() => router.push('/admin/testimonials')}
              style={{
                background: '#fff',
                color: '#2563eb',
                border: '1px solid #2563eb',
                borderRadius: 8,
                padding: '12px 24px',
                fontWeight: 500,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
