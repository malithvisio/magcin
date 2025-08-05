'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
import AdminLayout from '@/components/layout/AdminLayout';
import AdminGuard from '@/components/auth/AdminGuard';
import { apiRequest } from '@/util/api-utils';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  FaGripVertical,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaTimes,
} from 'react-icons/fa';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Destination {
  _id: string;
  id: string;
  name: string;
  images: string[];
  to_do: string;
  Highlight: string[];
  call_tagline: string;
  background: string;
  location: string;
  mini_description: string;
  description: string;
  moredes?: string;
  createdAt: string;
  updatedAt: string;
  position?: number;
  imageUrl?: string;
  imageAlt?: string;
  reviewStars?: number;
  published?: boolean;
}

export default function AdminDestinations() {
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const { user, isRootUser, rootUserId, companyId, tenantId } = useAuth();
  const isMobile = useIsMobile();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [published, setPublished] = useState<{ [id: string]: boolean }>({});
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [updatingPublished, setUpdatingPublished] = useState<string | null>(
    null
  );

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newDestinationName, setNewDestinationName] = useState('');
  const [isAddingDestination, setIsAddingDestination] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] =
    useState<Destination | null>(null);
  const [deletingDestination, setDeletingDestination] = useState<string | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Check if user is authenticated
      if (!user) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      console.log('Frontend - User context:', {
        userId: user.id,
        isRootUser,
        rootUserId,
        companyId,
        tenantId,
      });

      const response = await apiRequest('/api/destinations');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch destinations');
      }

      console.log('Frontend - API response:', {
        destinationsCount: data.destinations?.length || 0,
        destinations: data.destinations,
      });

      // Filter destinations for current root user only
      const userDestinations = data.destinations || [];
      setDestinations(userDestinations);

      // Set actual published status from database
      const pub: { [id: string]: boolean } = {};
      userDestinations.forEach((d: Destination) => {
        pub[d._id] = d.published || false;
      });
      setPublished(pub);
    } catch (err: any) {
      setError(err.message || 'Failed to load destinations');
    } finally {
      setLoading(false);
    }
  }, [user, isRootUser, rootUserId, companyId, tenantId]);

  useEffect(() => {
    if (user) {
      fetchDestinations();
    }
  }, [user, fetchDestinations]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpenId && !(event.target as Element).closest('.menu-container')) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);

  const handleAddDestination = () => {
    setShowAddPopup(true);
  };

  const handleClosePopup = () => {
    setShowAddPopup(false);
    setNewDestinationName('');
  };

  const handleSubmitDestination = async () => {
    if (!newDestinationName.trim()) {
      showError('Please enter a destination name');
      return;
    }

    if (!user) {
      showError('Authentication required');
      return;
    }

    try {
      setIsAddingDestination(true);

      // Generate a unique ID for the destination
      const destinationId = newDestinationName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

      const response = await apiRequest('/api/destinations', {
        method: 'POST',
        body: {
          id: destinationId,
          name: newDestinationName.trim(),
          // All other fields will be auto-generated by the API
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add destination');
      }

      const result = await response.json();
      const newDestination = result.destination;
      setDestinations(prev => [...prev, newDestination]);
      setPublished(prev => ({
        ...prev,
        [newDestination._id]: newDestination.published || false,
      }));

      handleClosePopup();
      showSuccess('Destination added successfully!');
    } catch (err: any) {
      showError(`Error adding destination: ${err.message}`);
    } finally {
      setIsAddingDestination(false);
    }
  };

  const handleEditDestination = (destination: Destination) => {
    router.push(`/admin/destinations/edit/${destination._id}`);
  };

  const handleDeleteDestination = async (destination: Destination) => {
    setDestinationToDelete(destination);
    setDeleteModalOpen(true);
  };

  const confirmDeleteDestination = async () => {
    if (!destinationToDelete) return;

    try {
      setDeletingDestination(destinationToDelete._id);
      const response = await apiRequest(
        `/api/destinations/${destinationToDelete._id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete destination');
      }
      setDestinations(prev =>
        prev.filter(d => d._id !== destinationToDelete._id)
      );
      setDeleteModalOpen(false);
      setDestinationToDelete(null);
      showSuccess('Destination deleted successfully!');
    } catch (err: any) {
      showError(`Error deleting destination: ${err.message}`);
    } finally {
      setDeletingDestination(null);
    }
  };

  const cancelDeleteDestination = () => {
    setDeleteModalOpen(false);
    setDestinationToDelete(null);
  };

  const handlePublishedToggle = async (
    destinationId: string,
    currentStatus: boolean
  ) => {
    try {
      setUpdatingPublished(destinationId);

      const response = await apiRequest(`/api/destinations/${destinationId}`, {
        method: 'PUT',
        body: {
          published: !currentStatus,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update published status');
      }

      // Update local state
      setPublished(prev => ({
        ...prev,
        [destinationId]: !currentStatus,
      }));

      showSuccess(
        `Destination ${!currentStatus ? 'published' : 'unpublished'} successfully!`
      );
    } catch (err: any) {
      showError(`Error updating published status: ${err.message}`);
    } finally {
      setUpdatingPublished(null);
    }
  };

  const handleMenuOpen = (id: string) => {
    setMenuOpenId(id);
  };
  const handleMenuClose = () => {
    setMenuOpenId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = destinations.findIndex(item => item._id === active.id);
    const newIndex = destinations.findIndex(item => item._id === over.id);

    const reordered = arrayMove(destinations, oldIndex, newIndex);

    // Update local state immediately for better UX
    setDestinations(reordered);
    setIsReordering(true);

    try {
      // Send the new order to the backend to persist changes
      const response = await apiRequest('/api/destinations/reorder', {
        method: 'PUT',
        body: {
          destinationIds: reordered.map(destination => destination._id),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update destination order');
      }

      // Get the response data to confirm the order
      const responseData = await response.json();
      if (responseData.destinations) {
        // Update with the confirmed order from backend
        const updatedDestinations = reordered.map(destination => {
          const updatedDestination = responseData.destinations.find(
            (d: any) => d._id === destination._id
          );
          return updatedDestination
            ? { ...destination, position: updatedDestination.position }
            : destination;
        });
        setDestinations(updatedDestinations);
      }

      // Show success message
      showSuccess('Destination order updated successfully!');
    } catch (error) {
      console.error('Error updating destination order:', error);
      // Revert to original order on error
      fetchDestinations();
      showError('Failed to save the new order. Please try again.');
    } finally {
      setIsReordering(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className='destinations-page'>
            <div className='loading-container'>
              <div className='loading-spinner'></div>
              <p style={{ color: '#000' }}>Loading destinations...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 24 }}>
          {/* Modern Responsive Breadcrumb */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 24,
              padding: '16px 0',
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
                  color: '#374151',
                  fontWeight: '600',
                  fontFamily: 'sans-serif',
                }}
              >
                Destinations
              </span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 500, color: '#000' }}>
              Select destinations
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isReordering && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#2563eb',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      border: '2px solid #2563eb',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  ></div>
                  Saving order...
                </div>
              )}

              <button
                onClick={handleAddDestination}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Add Destination
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={destinations.map(d => d._id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {destinations.map(destination => (
                  <SortableDestinationCard
                    key={destination._id}
                    destination={destination}
                    published={published}
                    onEdit={handleEditDestination}
                    onDelete={handleDeleteDestination}
                    onPublishedToggle={handlePublishedToggle}
                    menuOpenId={menuOpenId}
                    onMenuOpen={handleMenuOpen}
                    updatingPublished={updatingPublished}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div
                  style={{
                    background: 'white',
                    border: '2px solid #2563eb',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    opacity: 0.8,
                  }}
                >
                  {destinations.find(d => d._id === activeId)?.name}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {destinations.length === 0 && !loading && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
                fontSize: 16,
              }}
            >
              {user ? (
                <>
                  No destinations found for your company. Create your first
                  destination to get started.
                  <br />
                  {/* <small style={{ fontSize: 14, color: '#999', marginTop: 8 }}>
                    Company: {companyId} | Tenant: {tenantId} | Root:{' '}
                    {rootUserId}
                  </small> */}
                </>
              ) : (
                'Authentication required to view destinations.'
              )}
            </div>
          )}
        </div>

        {/* Add Destination Popup Modal */}
        {showAddPopup && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onClick={handleClosePopup}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '400px',
                maxWidth: '90vw',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                position: 'relative',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClosePopup}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '18px',
                  padding: '4px',
                  borderRadius: '4px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                <FaTimes />
              </button>

              {/* Modal content */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '14px',
                  }}
                >
                  Destination Name :
                </label>
                <input
                  type='text'
                  value={newDestinationName}
                  onChange={e => setNewDestinationName(e.target.value)}
                  placeholder='Type Destination Name'
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'sans-serif',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#2563eb';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleSubmitDestination();
                    }
                  }}
                />
              </div>

              {/* Action buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-start',
                }}
              >
                <button
                  onClick={handleSubmitDestination}
                  disabled={isAddingDestination}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: isAddingDestination ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'sans-serif',
                    opacity: isAddingDestination ? 0.6 : 1,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isAddingDestination) {
                      e.currentTarget.style.background = '#1d4ed8';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isAddingDestination) {
                      e.currentTarget.style.background = '#2563eb';
                    }
                  }}
                >
                  {isAddingDestination ? 'Adding...' : 'Add Destination'}
                </button>
                <button
                  onClick={handleClosePopup}
                  disabled={isAddingDestination}
                  style={{
                    background: 'white',
                    color: '#2563eb',
                    border: '1px solid #d1d5db',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: isAddingDestination ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'sans-serif',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isAddingDestination) {
                      e.currentTarget.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isAddingDestination) {
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .hidden {
            display: none !important;
          }

          /* Hide published text and green dot on mobile screens */
          @media (max-width: 768px) {
            .published-text,
            .mobile-hide-text {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              width: 0 !important;
              height: 0 !important;
              overflow: hidden !important;
              position: absolute !important;
              left: -9999px !important;
              font-size: 0 !important;
              line-height: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            /* Hide the green dot indicator on mobile */
            .published-indicator {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              width: 0 !important;
              height: 0 !important;
              overflow: hidden !important;
            }

            /* Additional mobile-specific hiding */
            span[class*='published-text'],
            [data-mobile-hidden='true'] {
              display: none !important;
            }
          }
        `}</style>

        {/* Delete Destination Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={cancelDeleteDestination}
          onConfirm={confirmDeleteDestination}
          title='Delete Destination'
          message='Are you sure you want to delete'
          itemName={destinationToDelete?.name}
          isLoading={deletingDestination === destinationToDelete?._id}
          loadingText='Deleting...'
          confirmText='Delete'
          cancelText='Cancel'
        />
      </AdminLayout>
    </AdminGuard>
  );
}

// Sortable Destination Card Component with 3x2 dot matrix handle
function SortableDestinationCard({
  destination,
  published,
  onEdit,
  onDelete,
  onPublishedToggle,
  menuOpenId,
  onMenuOpen,
  updatingPublished,
  isMobile,
}: {
  destination: Destination;
  published: { [id: string]: boolean };
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
  onPublishedToggle: (destinationId: string, currentStatus: boolean) => void;
  menuOpenId: string | null;
  onMenuOpen: (id: string) => void;
  updatingPublished: string | null;
  isMobile: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: destination._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f0f0f0' : '#fff',
  };

  // 3x2 dot matrix handle
  const DragHandle = (
    <div
      ref={setActivatorNodeRef}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 6px)',
        gridTemplateRows: 'repeat(3, 6px)',
        gap: '3px',
        width: 20,
        height: 24,
        marginRight: 8,
        cursor: 'grab',
        userSelect: 'none',
        alignItems: 'center',
        justifyItems: 'center',
      }}
      {...listeners}
      {...attributes}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#b0b0b0',
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 16,
        padding: '0 16px',
        minHeight: 64,
        border: '1px solid #e0e0e0',
        ...style,
      }}
    >
      {DragHandle}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          marginRight: 16,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0',
          border: '1px solid #e0e0e0',
        }}
      >
        {destination.imageUrl ? (
          <img
            src={destination.imageUrl}
            alt={destination.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 8,
            }}
            onError={e => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : destination.images &&
          destination.images.length > 0 &&
          destination.images[0] ? (
          <img
            src={destination.images[0]}
            alt={destination.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 8,
            }}
            onError={e => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}

        {/* Fallback placeholder */}
        <div
          className={
            destination.imageUrl ||
            (destination.images &&
              destination.images.length > 0 &&
              destination.images[0])
              ? 'hidden'
              : ''
          }
          style={{
            width: '100%',
            height: '100%',
            background: '#666',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
          }}
        >
          {/* {destination.name.charAt(0).toUpperCase()} */}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, color: '#222', fontWeight: 500 }}>
          {isMobile && destination.name.length > 10
            ? `${destination.name.substring(0, 10)}...`
            : destination.name}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: 24 }}>
        <input
          type='checkbox'
          checked={published[destination._id]}
          onChange={() =>
            onPublishedToggle(destination._id, published[destination._id])
          }
          disabled={updatingPublished === destination._id}
          style={{
            width: 18,
            height: 18,
            accentColor: '#2563eb',
            marginRight: 8,
            cursor:
              updatingPublished === destination._id ? 'not-allowed' : 'pointer',
            opacity: updatingPublished === destination._id ? 0.6 : 1,
          }}
        />
        {!isMobile && (
          <span
            style={{
              color: published[destination._id] ? '#059669' : '#6b7280',
              fontSize: 15,
              opacity: updatingPublished === destination._id ? 0.6 : 1,
              fontWeight: published[destination._id] ? '600' : '400',
            }}
            className='published-text mobile-hide-text'
            data-mobile-hidden='true'
          >
            {updatingPublished === destination._id
              ? 'Updating...'
              : published[destination._id]
                ? 'Published'
                : 'Draft'}
          </span>
        )}
        {published[destination._id] && !isMobile && (
          <div
            className='published-indicator'
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#059669',
              marginLeft: 8,
              opacity: updatingPublished === destination._id ? 0.6 : 1,
            }}
          />
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 6,
          }}
          onClick={e => {
            e.stopPropagation();
            onMenuOpen(destination._id);
          }}
        >
          <FaEllipsisV size={18} color='#888' />
        </button>
        {menuOpenId === destination._id && (
          <div
            className='menu-container'
            style={{
              position: 'absolute',
              right: 0,
              top: 36,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 8,
              boxShadow: '0 2px 8px #ccc',
              zIndex: 10,
              minWidth: 100,
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#111',
                fontWeight: 500,
              }}
              onClick={() => onEdit(destination)}
            >
              <FaEdit size={17} color='#111' style={{ marginRight: 6 }} />
              Edit
            </div>
            <div
              style={{
                height: 1,
                background: '#eee',
                margin: '0 8px',
              }}
            />
            <div
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#d32f2f',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => onDelete(destination)}
            >
              <FaTrash size={15} /> Delete
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
