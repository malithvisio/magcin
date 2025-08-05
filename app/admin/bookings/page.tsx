'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import DataTable from '@/components/admin/DataTable';

interface Booking {
  _id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  packageId?: string;
  packageName: string;
  packagePrice?: number;
  numberOfPeople: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequirements?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  rootUserId: string;
  companyId: string;
  tenantId: string;
}

export default function AdminBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter !== 'all' && { status: filter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages,
        }));
      } else {
        console.error('Failed to fetch bookings:', data.error);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle search change
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const columns = [
    {
      key: 'customerName',
      label: 'Customer',
      render: (value: string) => (
        <div className='customer-cell'>
          <span className='customer-name'>{value}</span>
        </div>
      ),
    },
    {
      key: 'packageName',
      label: 'Package',
      render: (value: string) => (
        <div className='package-cell'>
          <span className='package-name' title={value}>
            {value.length > 20 ? value.substring(0, 20) + '...' : value}
          </span>
        </div>
      ),
    },
    {
      key: 'startDate',
      label: 'Travel Dates',
      render: (value: string, row: Booking) => (
        <div className='dates-cell'>
          <div className='date-range'>
            <span className='start-date'>
              {new Date(value).toLocaleDateString()}
            </span>
            <span className='date-separator'>to</span>
            <span className='end-date'>
              {new Date(row.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'numberOfPeople',
      label: 'Guests',
      render: (value: number) => (
        <span className='guests-badge'>{value} guests</span>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (value: number) => (
        <span className='amount'>${value.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`status-badge status-${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (value: string) => (
        <span className={`payment-badge payment-${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Booked On',
      render: (value: string) => (
        <span className='booking-date'>
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const handleAddBooking = () => {
    alert('Add booking functionality would be implemented here');
  };

  const handleEditBooking = async (booking: Booking) => {
    router.push(`/admin/bookings/edit/${booking._id}`);
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (
      confirm(`Are you sure you want to delete booking ${booking.bookingId}?`)
    ) {
      try {
        const response = await fetch(`/api/bookings/${booking._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Booking deleted successfully!');
          fetchBookings(); // Refresh the list
        } else {
          alert('Failed to delete booking');
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking');
      }
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedBooking(null);
  };

  return (
    <AdminLayout>
      <div className='bookings-page'>
        <div className='page-header'>
          <div className='header-content'>
            <h1 className='page-title'>Bookings Management</h1>
            <p className='page-description'>
              Manage customer bookings, track reservations, and update booking
              status.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className='filter-controls'>
          <div className='filter-group'>
            <label htmlFor='status-filter'>Status Filter:</label>
            <select
              id='status-filter'
              value={filter}
              onChange={e => handleFilterChange(e.target.value)}
              className='filter-select'
            >
              <option value='all'>All Status</option>
              <option value='pending'>Pending</option>
              <option value='confirmed'>Confirmed</option>
              <option value='cancelled'>Cancelled</option>
              <option value='completed'>Completed</option>
            </select>
          </div>

          {/* <div className='filter-group'>
            <label htmlFor='search-input'>Search:</label>
            <input
              id='search-input'
              type='text'
              placeholder='Search by name, email, package...'
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className='search-input'
            />
          </div> */}
        </div>

        {/* Loading State */}
        {loading && (
          <div className='loading-state'>
            <p>Loading bookings...</p>
          </div>
        )}

        {/* Bookings Table */}
        {!loading && (
          <>
            <DataTable
              title={`Bookings (${pagination.total} total)`}
              data={bookings}
              columns={columns}
              onAdd={handleAddBooking}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
              onView={handleViewBooking}
              addButtonText='Add Booking'
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className='pagination'>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className='pagination-btn'
                >
                  Previous
                </button>
                <span className='pagination-info'>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className='pagination-btn'
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* View Booking Modal */}
        {showViewModal && selectedBooking && (
          <div className='modal-overlay' onClick={handleCloseViewModal}>
            <div className='modal-content' onClick={e => e.stopPropagation()}>
              <div className='modal-header'>
                <h2 className='modal-title'>Booking Details</h2>
                <button
                  onClick={handleCloseViewModal}
                  className='modal-close-btn'
                  aria-label='Close modal'
                >
                  ✕
                </button>
              </div>

              <div className='modal-body'>
                <div className='booking-details'>
                  {/* Customer Information */}
                  <div className='detail-section'>
                    <h3 className='section-title'>Customer Information</h3>
                    <div className='detail-grid'>
                      <div className='detail-item'>
                        <label>Name:</label>
                        <span>{selectedBooking.customerName}</span>
                      </div>
                      <div className='detail-item'>
                        <label>Email:</label>
                        <span>{selectedBooking.customerEmail}</span>
                      </div>
                      <div className='detail-item'>
                        <label>Phone:</label>
                        <span>{selectedBooking.customerPhone}</span>
                      </div>
                      <div className='detail-item'>
                        <label>Booking ID:</label>
                        <span className='booking-id'>
                          {selectedBooking.bookingId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Package Information */}
                  <div className='detail-section'>
                    <h3 className='section-title'>Package Information</h3>
                    <div className='detail-grid'>
                      <div className='detail-item'>
                        <label>Package Name:</label>
                        <span>{selectedBooking.packageName}</span>
                      </div>
                      <div className='detail-item'>
                        <label>Number of People:</label>
                        <span>{selectedBooking.numberOfPeople} guests</span>
                      </div>
                    </div>
                  </div>

                  {/* Travel Dates */}
                  <div className='detail-section'>
                    <h3 className='section-title'>Travel Dates</h3>
                    <div className='detail-grid'>
                      <div className='detail-item'>
                        <label>Start Date:</label>
                        <span className='date-value'>
                          {new Date(
                            selectedBooking.startDate
                          ).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className='detail-item'>
                        <label>End Date:</label>
                        <span className='date-value'>
                          {new Date(selectedBooking.endDate).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className='detail-section'>
                    <h3 className='section-title'>Financial Information</h3>
                    <div className='detail-grid'>
                      <div className='detail-item'>
                        <label>Total Amount:</label>
                        <span className='amount-value'>
                          ${selectedBooking.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className='detail-item'>
                        <label>Payment Status:</label>
                        <span
                          className={`status-badge payment-${selectedBooking.paymentStatus}`}
                        >
                          {selectedBooking.paymentStatus
                            .charAt(0)
                            .toUpperCase() +
                            selectedBooking.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <div className='detail-item'>
                        <label>Booking Status:</label>
                        <span
                          className={`status-badge status-${selectedBooking.status}`}
                        >
                          {selectedBooking.status.charAt(0).toUpperCase() +
                            selectedBooking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className='detail-section'>
                    <h3 className='section-title'>Additional Information</h3>
                    <div className='detail-grid'>
                      <div className='detail-item'>
                        <label>Special Requirements:</label>
                        <span>
                          {selectedBooking.specialRequirements || 'None'}
                        </span>
                      </div>
                      <div className='detail-item'>
                        <label>Booked On:</label>
                        <span className='date-value'>
                          {new Date(
                            selectedBooking.createdAt
                          ).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='modal-footer'>
                <button
                  onClick={() => handleEditBooking(selectedBooking)}
                  className='modal-btn edit-btn'
                >
                  Edit Booking
                </button>
                <button
                  onClick={handleCloseViewModal}
                  className='modal-btn close-btn'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .bookings-page {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .page-header {
            background: white;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

          .customer-cell {
            display: flex;
            align-items: center;
          }

          .customer-name {
            color: #1e293b;
            font-size: 0.875rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 150px;
          }

          .package-cell {
            max-width: 120px;
          }

          .package-name {
            color: #374151;
            font-size: 0.875rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
          }

          .destination-cell {
            color: #374151;
            font-size: 0.875rem;
            line-height: 1.4;
            max-width: 150px;
          }

          .dates-cell {
            text-align: center;
            max-width: 100px;
          }

          .date-range {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            font-size: 0.8rem;
          }

          .start-date {
            color: #059669;
            font-weight: 500;
          }

          .date-separator {
            color: #64748b;
            font-size: 0.75rem;
          }

          .end-date {
            color: #dc2626;
            font-weight: 500;
          }

          .guests-badge {
            background: #f3e8ff;
            color: #9333ea;
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
            white-space: nowrap;
          }

          .amount {
            font-weight: 600;
            color: #059669;
            font-size: 0.875rem;
            white-space: nowrap;
          }

          .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: capitalize;
          }

          .status-confirmed {
            background: #dcfce7;
            color: #16a34a;
          }

          .status-pending {
            background: #fef3c7;
            color: #d97706;
          }

          .status-cancelled {
            background: #fee2e2;
            color: #dc2626;
          }

          .booking-date {
            color: #64748b;
            font-size: 0.875rem;
          }

          .payment-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: capitalize;
          }

          .payment-paid {
            background: #dcfce7;
            color: #16a34a;
          }

          .payment-pending {
            background: #fef3c7;
            color: #d97706;
          }

          .payment-failed {
            background: #fee2e2;
            color: #dc2626;
          }

          .payment-refunded {
            background: #e0e7ff;
            color: #7c3aed;
          }

          .filter-controls {
            background: white;
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
            display: flex;
            gap: 2rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .filter-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .filter-group label {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
          }

          .filter-select,
          .search-input {
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            min-width: 200px;
          }

          .filter-select:focus,
          .search-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .loading-state {
            background: white;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            text-align: center;
            color: #64748b;
          }

          .pagination {
            background: white;
            padding: 1rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-top: 1rem;
          }

          .pagination-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.2s;
          }

          .pagination-btn:hover:not(:disabled) {
            background: #f9fafb;
            border-color: #9ca3af;
          }

          .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .pagination-info {
            color: #64748b;
            font-size: 0.875rem;
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
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 1rem;
          }

          .modal-content {
            background: white;
            border-radius: 0.75rem;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow: hidden;
            box-shadow:
              0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
          }

          .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .modal-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
          }

          .modal-close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #64748b;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.375rem;
            transition: all 0.2s;
          }

          .modal-close-btn:hover {
            background: #f1f5f9;
            color: #374151;
          }

          .modal-body {
            padding: 1.5rem;
            overflow-y: auto;
            flex: 1;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .modal-body::-webkit-scrollbar {
            display: none;
          }

          .booking-details {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .detail-section {
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1.5rem;
            background: #f8fafc;
          }

          .section-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
          }

          .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
          }

          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .detail-item label {
            font-weight: 600;
            color: #64748b;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .detail-item span {
            color: #1e293b;
            font-size: 1rem;
            font-weight: 500;
          }

          .booking-id {
            font-family: 'Courier New', monospace;
            background: #f1f5f9;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
          }

          .date-value {
            color: #059669;
            font-weight: 600;
          }

          .amount-value {
            color: #059669;
            font-weight: 700;
            font-size: 1.125rem;
          }

          .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
          }

          .modal-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            font-size: 0.875rem;
          }

          .edit-btn {
            background: #3b82f6;
            color: white;
          }

          .edit-btn:hover {
            background: #2563eb;
            transform: translateY(-1px);
          }

          .close-btn {
            background: #f1f5f9;
            color: #374151;
          }

          .close-btn:hover {
            background: #e2e8f0;
          }

          /* Mobile styles */
          @media (max-width: 768px) {
            .page-header {
              padding: 1.5rem;
            }

            .page-title {
              font-size: 1.5rem;
            }

            .page-description {
              font-size: 1rem;
            }

            .filter-controls {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
            }

            .filter-select,
            .search-input {
              min-width: auto;
            }

            .pagination {
              flex-direction: column;
              gap: 0.5rem;
            }

            /* Mobile styles for modal */
            .modal-overlay {
              padding: 0.5rem;
            }

            .modal-content {
              max-height: 95vh;
              border-radius: 0.5rem;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }

            .modal-header {
              padding: 1rem;
            }

            .modal-title {
              font-size: 1.25rem;
            }

            .modal-body {
              padding: 1rem;
            }

            .booking-details {
              gap: 1.5rem;
            }

            .detail-section {
              padding: 1rem;
            }

            .section-title {
              font-size: 1rem;
            }

            .detail-grid {
              grid-template-columns: 1fr;
              gap: 0.75rem;
            }

            .detail-item label {
              font-size: 0.8rem;
            }

            .detail-item span {
              font-size: 0.9rem;
            }

            .modal-footer {
              padding: 1rem;
              flex-direction: column;
            }

            .modal-btn {
              width: 100%;
              padding: 0.875rem;
            }
          }

          /* Extra small mobile devices */
          @media (max-width: 480px) {
            .modal-overlay {
              padding: 0.25rem;
            }

            .modal-content {
              max-height: 98vh;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }

            .modal-header {
              padding: 0.75rem;
            }

            .modal-title {
              font-size: 1.125rem;
            }

            .modal-body {
              padding: 0.75rem;
            }

            .detail-section {
              padding: 0.75rem;
            }

            .detail-item label {
              font-size: 0.75rem;
            }

            .detail-item span {
              font-size: 0.85rem;
            }

            .modal-footer {
              padding: 0.75rem;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
