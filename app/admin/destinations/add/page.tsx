'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/util/auth';

export default function AddDestination() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await apiRequest('/api/destinations', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to add destination');
      setSuccess('Destination added successfully!');
      setName('');
      setShowModal(false);
      setTimeout(() => router.push('/admin/destinations'), 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setName('');
    setError('');
    setSuccess('');
  };

  return (
    <AdminLayout>
      <div className='add-destination-page'>
        <div className='content-wrapper'>
          <h1 className='page-title'>Destinations</h1>
          <p className='page-description'>Manage your travel destinations</p>

          <button
            className='add-destination-btn'
            onClick={() => setShowModal(true)}
          >
            Add Destination
          </button>
        </div>

        {/* Modal Overlay */}
        {showModal && (
          <div className='modal-overlay' onClick={handleCancel}>
            <div className='modal-content' onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSubmit}>
                <label htmlFor='destination-name' className='modal-label'>
                  Destination Name :
                </label>
                <input
                  id='destination-name'
                  type='text'
                  className='modal-input'
                  placeholder='Type Destination Name'
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={isSubmitting}
                  autoFocus
                />
                <div className='modal-actions'>
                  <button
                    type='submit'
                    className='add-btn'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Destination'}
                  </button>
                  <button
                    type='button'
                    className='cancel-btn'
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
                {error && <div className='error-msg'>{error}</div>}
                {success && <div className='success-msg'>{success}</div>}
              </form>
            </div>
          </div>
        )}

        <style jsx>{`
          .add-destination-page {
            min-height: 60vh;
            padding: 2rem;
            background: #f7f7f7;
            font-family:
              -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .content-wrapper {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
          }

          .page-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }

          .page-description {
            font-size: 1.1rem;
            color: #6b7280;
            margin-bottom: 2rem;
          }

          .add-destination-btn {
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
            font-family: inherit;
          }

          .add-destination-btn:hover {
            background: #1d4ed8;
          }

          /* Modal Styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: #f5f5f5;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            min-width: 300px;
            max-width: 400px;
            animation: modalFadeIn 0.2s ease-out;
          }

          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .modal-label {
            font-weight: 600;
            color: #333;
            margin-bottom: 0.75rem;
            font-size: 0.95rem;
            display: block;
            font-family: inherit;
          }

          .modal-input {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 0.6rem 0.8rem;
            font-size: 0.9rem;
            background: #fff;
            color: #333;
            outline: none;
            transition: border 0.2s;
            width: 100%;
            box-sizing: border-box;
            font-family: inherit;
            margin-bottom: 1rem;
          }

          .modal-input:focus {
            border: 1.5px solid #2563eb;
          }

          .modal-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
          }

          .add-btn {
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
            font-family: inherit;
            flex: 1;
          }

          .add-btn:hover:not(:disabled) {
            background: #1d4ed8;
          }

          .add-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .cancel-btn {
            background: #fff;
            color: #2563eb;
            border: 1px solid #2563eb;
            border-radius: 6px;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition:
              background 0.2s,
              color 0.2s;
            font-family: inherit;
            flex: 1;
          }

          .cancel-btn:hover:not(:disabled) {
            background: #f1f5ff;
          }

          .cancel-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .error-msg {
            color: #dc2626;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 0.5rem 1rem;
            margin-top: 0.5rem;
            font-size: 0.95rem;
            font-family: inherit;
          }

          .success-msg {
            color: #16a34a;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 6px;
            padding: 0.5rem 1rem;
            margin-top: 0.5rem;
            font-size: 0.95rem;
            font-family: inherit;
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
