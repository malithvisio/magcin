'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    packageName: '',
    startDate: '',
    endDate: '',
    numberOfPeople: 1,
    totalAmount: 0,
    status: 'pending',
    paymentStatus: 'pending',
    specialRequirements: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/bookings/${bookingId}`);
        const data = await response.json();

        if (response.ok) {
          const booking = data.booking;
          setFormData({
            customerName: booking.customerName || '',
            customerEmail: booking.customerEmail || '',
            customerPhone: booking.customerPhone || '',
            packageName: booking.packageName || '',
            startDate: booking.startDate
              ? new Date(booking.startDate).toISOString().split('T')[0]
              : '',
            endDate: booking.endDate
              ? new Date(booking.endDate).toISOString().split('T')[0]
              : '',
            numberOfPeople: booking.numberOfPeople || 1,
            totalAmount: booking.totalAmount || 0,
            status: booking.status || 'pending',
            paymentStatus: booking.paymentStatus || 'pending',
            specialRequirements: booking.specialRequirements || '',
          });
        } else {
          setError('Failed to load booking data');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Error loading booking data');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'numberOfPeople' || name === 'totalAmount'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Booking updated successfully!');
        router.push('/admin/bookings');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Error updating booking');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/bookings');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className='loading-container'>
          <div className='loading-spinner'></div>
          <p>Loading booking data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !formData.customerName) {
    return (
      <AdminLayout>
        <div className='error-container'>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleCancel} className='back-button'>
            Back to Bookings
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className='edit-booking-page'>
        <div className='page-header'>
          <div className='header-content'>
            <h1 className='page-title'>Edit Booking</h1>
            <p className='page-description'>
              Update booking details and manage customer information.
            </p>
          </div>
          <div className='header-actions'>
            <button onClick={handleCancel} className='cancel-button'>
              Cancel
            </button>
          </div>
        </div>

        <div className='form-container'>
          <form onSubmit={handleSubmit} className='booking-form'>
            {error && <div className='error-message'>{error}</div>}

            <div className='form-grid'>
              {/* Customer Information */}
              <div className='form-section'>
                <h3 className='section-title'>Customer Information</h3>
                <div className='form-row'>
                  <div className='form-group'>
                    <label htmlFor='customerName'>Customer Name *</label>
                    <input
                      type='text'
                      id='customerName'
                      name='customerName'
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className='form-input'
                    />
                  </div>
                  <div className='form-group'>
                    <label htmlFor='customerEmail'>Email *</label>
                    <input
                      type='email'
                      id='customerEmail'
                      name='customerEmail'
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      required
                      className='form-input'
                    />
                  </div>
                </div>
                <div className='form-row'>
                  <div className='form-group'>
                    <label htmlFor='customerPhone'>Phone</label>
                    <input
                      type='tel'
                      id='customerPhone'
                      name='customerPhone'
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className='form-input'
                    />
                  </div>
                </div>
              </div>

              {/* Package Information */}
              <div className='form-section'>
                <h3 className='section-title'>Package Information</h3>
                <div className='form-row'>
                  <div className='form-group'>
                    <label htmlFor='packageName'>Package Name *</label>
                    <input
                      type='text'
                      id='packageName'
                      name='packageName'
                      value={formData.packageName}
                      onChange={handleInputChange}
                      required
                      className='form-input'
                    />
                  </div>
                </div>
                <div className='form-row'>
                  <div className='form-group'>
                    <label htmlFor='startDate'>Start Date *</label>
                    <input
                      type='date'
                      id='startDate'
                      name='startDate'
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className='form-input'
                    />
                  </div>
                  <div className='form-group'>
                    <label htmlFor='endDate'>End Date *</label>
                    <input
                      type='date'
                      id='endDate'
                      name='endDate'
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className='form-input'
                    />
                  </div>
                </div>
                <div className='form-row'>
                  <div className='form-group'>
                    <label htmlFor='numberOfPeople'>Number of People *</label>
                    <input
                      type='number'
                      id='numberOfPeople'
                      name='numberOfPeople'
                      value={formData.numberOfPeople}
                      onChange={handleInputChange}
                      min='1'
                      required
                      className='form-input'
                    />
                  </div>
                  <div className='form-group'>
                    <label htmlFor='totalAmount'>Total Amount ($) *</label>
                    <input
                      type='number'
                      id='totalAmount'
                      name='totalAmount'
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                      min='0'
                      step='0.01'
                      required
                      className='form-input'
                    />
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className='form-section'>
                <h3 className='section-title'>Status Information</h3>
                <div className='form-row'>
                  <div className='form-group'>
                    <label htmlFor='status'>Booking Status *</label>
                    <select
                      id='status'
                      name='status'
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className='form-select'
                    >
                      <option value='pending'>Pending</option>
                      <option value='confirmed'>Confirmed</option>
                      <option value='cancelled'>Cancelled</option>
                      <option value='completed'>Completed</option>
                    </select>
                  </div>
                  <div className='form-group'>
                    <label htmlFor='paymentStatus'>Payment Status *</label>
                    <select
                      id='paymentStatus'
                      name='paymentStatus'
                      value={formData.paymentStatus}
                      onChange={handleInputChange}
                      required
                      className='form-select'
                    >
                      <option value='pending'>Pending</option>
                      <option value='paid'>Paid</option>
                      <option value='failed'>Failed</option>
                      <option value='refunded'>Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              <div className='form-section'>
                <h3 className='section-title'>Additional Information</h3>
                <div className='form-group'>
                  <label htmlFor='specialRequirements'>
                    Special Requirements
                  </label>
                  <textarea
                    id='specialRequirements'
                    name='specialRequirements'
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    rows={4}
                    className='form-textarea'
                    placeholder='Any special requirements or notes...'
                  />
                </div>
              </div>
            </div>

            <div className='form-actions'>
              <button
                type='button'
                onClick={handleCancel}
                className='cancel-button'
                disabled={saving}
              >
                Cancel
              </button>
              <button type='submit' className='save-button' disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <style jsx>{`
          .edit-booking-page {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .page-header {
            background: white;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header-content {
            flex: 1;
          }

          .page-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 0.5rem 0;
          }

          .page-description {
            color: #64748b;
            font-size: 1.1rem;
            margin: 0;
          }

          .header-actions {
            display: flex;
            gap: 1rem;
          }

          .cancel-button {
            padding: 0.75rem 1.5rem;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .cancel-button:hover {
            background: #f9fafb;
            border-color: #9ca3af;
          }

          .form-container {
            background: white;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .booking-form {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .error-message {
            background: #fee2e2;
            color: #dc2626;
            padding: 1rem;
            border-radius: 0.375rem;
            border: 1px solid #fecaca;
            font-size: 0.875rem;
          }

          .form-grid {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .form-section {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .section-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #374151;
            margin: 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            font-weight: 500;
            color: #374151;
            font-size: 0.875rem;
          }

          .form-input,
          .form-select,
          .form-textarea {
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            transition: all 0.2s;
            background: white;
            color: #374151;
          }

          .form-input:focus,
          .form-select:focus,
          .form-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-textarea {
            resize: vertical;
            min-height: 100px;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
          }

          .save-button {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            border: none;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .save-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .save-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .loading-container,
          .error-container {
            background: white;
            padding: 3rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            text-align: center;
            color: #64748b;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .back-button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            margin-top: 1rem;
          }

          .back-button:hover {
            background: #2563eb;
          }

          /* Mobile styles */
          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
              padding: 1.5rem;
            }

            .page-title {
              font-size: 1.5rem;
            }

            .page-description {
              font-size: 1rem;
            }

            .form-container {
              padding: 1.5rem;
            }

            .form-row {
              grid-template-columns: 1fr;
              gap: 0.75rem;
            }

            .form-actions {
              flex-direction: column;
              gap: 0.75rem;
            }

            .cancel-button,
            .save-button {
              width: 100%;
              padding: 0.875rem 1rem;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
