'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/util/api-utils';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import { useToast } from '@/contexts/ToastContext';

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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FaGripVertical,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaStar,
} from 'react-icons/fa';

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

// Sortable testimonial item component
function SortableTestimonialItem({
  testimonial,
  handleMenuOpen,
  menuOpenId,
  handleEdit,
  handleDelete,
  handlePublishedToggle,
  renderStars,
  isMobile,
}: {
  testimonial: Testimonial;
  handleMenuOpen: (id: string) => void;
  menuOpenId: string | null;
  handleEdit: (testimonial: Testimonial) => void;
  handleDelete: (testimonial: Testimonial) => void;
  handlePublishedToggle: (testimonial: Testimonial) => void;
  renderStars: (rating: number) => JSX.Element[];
  isMobile: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimonial._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .stars-section {
            display: none !important;
          }
        }
      `}</style>
      <div
        ref={setNodeRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          borderRadius: 8,
          boxShadow: isDragging
            ? '0 8px 25px rgba(0, 0, 0, 0.15)'
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: 16,
          padding: '0 16px',
          minHeight: 80,
          border: '1px solid #e0e0e0',
          cursor: isDragging ? 'grabbing' : 'default',
          ...style,
        }}
      >
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            marginRight: 16,
            color: '#888',
            fontSize: 20,
            padding: '8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            minHeight: '32px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => {
            if (!isDragging) {
              e.currentTarget.style.color = '#2563eb';
            }
          }}
          onMouseLeave={e => {
            if (!isDragging) {
              e.currentTarget.style.color = '#888';
            }
          }}
        >
          <FaGripVertical />
        </div>
        {/* <div
          style={{
            width: 50,
            height: 50,
            background: testimonial.image
              ? `url(${testimonial.image})`
              : '#666',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 25,
            marginRight: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 500,
            fontSize: 18,
          }}
        >
          {!testimonial.image && testimonial.name.charAt(0).toUpperCase()}
        </div> */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 17,
              color: '#222',
              fontWeight: 500,
            }}
          >
            {testimonial.name}
          </div>
          <div
            style={{
              fontSize: 14,
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            className='stars-section'
          >
            {renderStars(testimonial.rating)}
            <span>({testimonial.rating}/5)</span>
          </div>
          {/* <div
          style={{
            fontSize: 14,
            color: '#888',
            maxWidth: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {testimonial.review}
        </div> */}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginRight: 24,
          }}
        >
          <input
            type='checkbox'
            checked={testimonial.published}
            onChange={() => handlePublishedToggle(testimonial)}
            style={{
              width: 18,
              height: 18,
              accentColor: '#2563eb',
              marginRight: 8,
              cursor: 'pointer',
            }}
          />
          {!isMobile && (
            <span
              style={{
                color: testimonial.published ? '#059669' : '#6b7280',
                fontSize: 15,
                fontWeight: testimonial.published ? '600' : '400',
              }}
              className='published-text mobile-hide-text'
              data-mobile-hidden='true'
            >
              {testimonial.published ? 'Published' : 'Draft'}
            </span>
          )}
          {testimonial.published && !isMobile && (
            <div
              className='published-indicator'
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#059669',
                marginLeft: 8,
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
            onClick={() => handleMenuOpen(testimonial._id)}
          >
            <FaEllipsisV size={18} color='#888' />
          </button>
          {menuOpenId === testimonial._id && (
            <div
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
                onClick={() => handleEdit(testimonial)}
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
                onClick={() => handleDelete(testimonial)}
              >
                <FaTrash size={15} /> Delete
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminTestimonials() {
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    review: '',
    rating: 5,
    image: '',
  });
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] =
    useState<Testimonial | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] = useState<string | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiRequest('/api/testimonials');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch testimonials');
      }

      setTestimonials(data.testimonials || []);
      console.log('Fetched testimonials count:', data.testimonials?.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
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

    const oldIndex = testimonials.findIndex(item => item._id === active.id);
    const newIndex = testimonials.findIndex(item => item._id === over.id);

    const reordered = arrayMove(testimonials, oldIndex, newIndex);

    console.log('Reordering testimonials:');
    console.log('From position:', oldIndex, 'To position:', newIndex);
    console.log(
      'New order IDs:',
      reordered.map(t => t._id)
    );

    // Update local state immediately for better UX
    setTestimonials(reordered);
    setIsReordering(true);

    try {
      // Send the new order to the backend to persist changes
      const response = await apiRequest('/api/testimonials/reorder', {
        method: 'PUT',
        body: {
          testimonialIds: reordered.map(testimonial => testimonial._id),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Reorder API error:', errorData);
        throw new Error(
          errorData.error || 'Failed to update testimonial order'
        );
      }

      // Get the response data to confirm the order
      const responseData = await response.json();
      console.log(
        'Reorder API success, received testimonials:',
        responseData.testimonials?.length
      );

      if (responseData.testimonials) {
        // Use the testimonials directly from the backend response
        // They are already sorted by position in the correct order
        setTestimonials(responseData.testimonials);
        console.log('Updated state with new order');
      }

      // Show success message
      showSuccess('Testimonial order updated successfully!');
    } catch (error: any) {
      console.error('Error updating testimonial order:', error);
      showError(
        `Failed to save new order: ${error.message || 'Unknown error'}`
      );
      // Revert to original order on error
      await fetchTestimonials();
    } finally {
      setIsReordering(false);
    }
  };

  const handleAddTestimonial = async () => {
    if (!newTestimonial.name || !newTestimonial.review) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const response = await apiRequest('/api/testimonials', {
        method: 'POST',
        body: {
          name: newTestimonial.name,
          review: newTestimonial.review, // Model expects 'review'
          rating: newTestimonial.rating, // Model expects 'rating'
          image: newTestimonial.image,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create testimonial');
      }

      // Parse the success response
      const data = await response.json();

      // Show success message
      showSuccess('Testimonial created successfully!');

      // Refresh the testimonials list
      fetchTestimonials();
      setShowAddModal(false);
      setNewTestimonial({ name: '', review: '', rating: 5, image: '' });
    } catch (err: any) {
      showError(`Error creating testimonial: ${err.message}`);
    }
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    router.push(`/admin/testimonials/edit/${testimonial._id}`);
  };

  const handleDeleteTestimonial = async (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial);
    setDeleteModalOpen(true);
  };

  const confirmDeleteTestimonial = async () => {
    if (!testimonialToDelete) return;

    try {
      setDeletingTestimonial(testimonialToDelete._id);
      const response = await apiRequest(
        `/api/testimonials/${testimonialToDelete._id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete testimonial');
      }

      // Remove from local state
      setTestimonials(prev =>
        prev.filter(t => t._id !== testimonialToDelete._id)
      );
      setDeleteModalOpen(false);
      setTestimonialToDelete(null);
      showSuccess('Testimonial deleted successfully!');
    } catch (err: any) {
      showError(`Error deleting testimonial: ${err.message}`);
    } finally {
      setDeletingTestimonial(null);
    }
  };

  const cancelDeleteTestimonial = () => {
    setDeleteModalOpen(false);
    setTestimonialToDelete(null);
  };

  const handlePublishedToggle = async (testimonial: Testimonial) => {
    try {
      const response = await apiRequest(
        `/api/testimonials/${testimonial._id}`,
        {
          method: 'PUT',
          body: {
            ...testimonial,
            published: !testimonial.published,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update testimonial');
      }

      // Update local state
      setTestimonials(prev =>
        prev.map(t =>
          t._id === testimonial._id ? { ...t, published: !t.published } : t
        )
      );
      showSuccess(
        `Testimonial ${testimonial.published ? 'unpublished' : 'published'} successfully!`
      );
    } catch (err: any) {
      showError(`Error updating testimonial: ${err.message}`);
    }
  };

  const handleMenuOpen = (id: string) => {
    setMenuOpenId(id);
  };

  const handleMenuClose = () => {
    setMenuOpenId(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    handleEditTestimonial(testimonial);
    handleMenuClose();
  };

  const handleDelete = (testimonial: Testimonial) => {
    handleDeleteTestimonial(testimonial);
    handleMenuClose();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        size={14}
        color={i < rating ? '#ffd700' : '#e0e0e0'}
        style={{ marginRight: 2 }}
      />
    ));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className='testimonials-page'>
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p style={{ color: '#000' }}>Loading testimonials...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const activeTestimonial = activeId
    ? testimonials.find(t => t._id === activeId)
    : null;

  return (
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
                color: '#000000',
                fontWeight: '700',
                fontFamily: 'sans-serif',
              }}
            >
              Testimonials
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
            Manage Testimonials
          </div>
          <button
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 16,
            }}
            onClick={() => setShowAddModal(true)}
          >
            Add Testimonial
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={testimonials.map(t => t._id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {testimonials.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 20px',
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #e0e0e0',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      color: '#ccc',
                      marginBottom: 16,
                    }}
                  >
                    💬
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: '#333',
                      marginBottom: 8,
                    }}
                  >
                    No testimonials yet
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      color: '#666',
                      marginBottom: 24,
                      maxWidth: 400,
                    }}
                  >
                    Get started by adding your first testimonial. Click the "Add
                    Testimonial" button above to create one.
                  </div>
                  <button
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 24px',
                      fontWeight: 500,
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Your First Testimonial
                  </button>
                </div>
              ) : (
                testimonials.map(testimonial => (
                  <SortableTestimonialItem
                    key={testimonial._id}
                    testimonial={testimonial}
                    handleMenuOpen={handleMenuOpen}
                    menuOpenId={menuOpenId}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handlePublishedToggle={handlePublishedToggle}
                    renderStars={renderStars}
                    isMobile={isMobile}
                  />
                ))
              )}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeTestimonial ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  padding: '0 16px',
                  minHeight: 80,
                  border: '2px solid #2563eb',
                  opacity: 0.95,
                }}
              >
                <div
                  style={{
                    cursor: 'grabbing',
                    marginRight: 16,
                    color: '#2563eb',
                    fontSize: 20,
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '32px',
                    minHeight: '32px',
                  }}
                >
                  <FaGripVertical />
                </div>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    background: activeTestimonial.image
                      ? `url(${activeTestimonial.image})`
                      : '#666',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 25,
                    marginRight: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: 18,
                  }}
                >
                  {!activeTestimonial.image &&
                    activeTestimonial.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: 17, color: '#222', fontWeight: 500 }}>
                  {activeTestimonial.name}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Simple Loading Indicator */}
        {isReordering && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#2563eb',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '20px',
              zIndex: 1000,
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            Updating order...
          </div>
        )}
      </div>
      {/* Add Testimonial Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fafafa',
              borderRadius: 16,
              boxShadow: '0 2px 16px #bbb',
              padding: 32,
              minWidth: 400,
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              border: '1px solid #eee',
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: '#444',
                fontSize: 18,
                marginBottom: 4,
              }}
            >
              Add Testimonial
            </div>
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Name *
              </div>
              <input
                type='text'
                placeholder='Enter person name'
                value={newTestimonial.name}
                onChange={e =>
                  setNewTestimonial(prev => ({ ...prev, name: e.target.value }))
                }
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 17,
                  color: '#444',
                  background: '#fff',
                  outline: 'none',
                  marginBottom: 8,
                  fontWeight: 400,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Review *
              </div>
              <textarea
                placeholder='Enter testimonial review'
                value={newTestimonial.review}
                onChange={e =>
                  setNewTestimonial(prev => ({
                    ...prev,
                    review: e.target.value,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 17,
                  color: '#444',
                  background: '#fff',
                  outline: 'none',
                  marginBottom: 8,
                  fontWeight: 400,
                  boxSizing: 'border-box',
                  minHeight: 100,
                  resize: 'vertical',
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Rating
              </div>
              <select
                value={newTestimonial.rating}
                onChange={e =>
                  setNewTestimonial(prev => ({
                    ...prev,
                    rating: parseInt(e.target.value),
                  }))
                }
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 17,
                  color: '#444',
                  background: '#fff',
                  outline: 'none',
                  marginBottom: 8,
                  fontWeight: 400,
                  boxSizing: 'border-box',
                }}
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Image URL (Optional)
              </div>
              <input
                type='text'
                placeholder='Enter image URL'
                value={newTestimonial.image}
                onChange={e =>
                  setNewTestimonial(prev => ({
                    ...prev,
                    image: e.target.value,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 17,
                  color: '#444',
                  background: '#fff',
                  outline: 'none',
                  marginBottom: 8,
                  fontWeight: 400,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <button
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 28px',
                  fontWeight: 500,
                  fontSize: 17,
                  cursor: 'pointer',
                }}
                onClick={handleAddTestimonial}
              >
                Add Testimonial
              </button>
              <button
                style={{
                  background: '#fff',
                  color: '#2563eb',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 22px',
                  fontWeight: 500,
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: '0 0 0 1.5px #f0f0f0',
                }}
                onClick={() => {
                  setShowAddModal(false);
                  setNewTestimonial({
                    name: '',
                    review: '',
                    rating: 5,
                    image: '',
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Testimonial Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDeleteTestimonial}
        onConfirm={confirmDeleteTestimonial}
        title='Delete Testimonial'
        message='Are you sure you want to delete'
        itemName={
          testimonialToDelete?.name
            ? `${testimonialToDelete.name}'s testimonial`
            : undefined
        }
        isLoading={deletingTestimonial === testimonialToDelete?._id}
        loadingText='Deleting...'
        confirmText='Delete'
        cancelText='Cancel'
      />

      <style jsx global>{`
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
    </AdminLayout>
  );
}
