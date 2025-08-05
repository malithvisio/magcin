'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { authService } from '@/util/auth';
import { useToast } from '@/contexts/ToastContext';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';

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
import { FaGripVertical, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';

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
}

interface Activity {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  altText?: string;
  reviewStars?: number;
  highlight?: boolean;
  insideTitle?: string;
  insideDescription?: string;
  insideImageUrl?: string;
  insideImageAlt?: string;
  insideShortDescription?: string;
  insideTabTitle?: string;
  published: boolean;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Sortable activity item component
function SortableActivityItem({
  activity,
  handleMenuOpen,
  menuOpenId,
  handleEdit,
  handleDelete,
  handlePublishedToggle,
  isMobile,
}: {
  activity: Activity;
  handleMenuOpen: (id: string) => void;
  menuOpenId: string | null;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  handlePublishedToggle: (id: string) => void;
  isMobile: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        borderRadius: 8,
        boxShadow: isDragging ? '0 2px 8px #aaa' : 'none',
        marginBottom: 16,
        padding: '0 16px',
        minHeight: 64,
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
      <div
        style={{
          width: 40,
          height: 40,
          background: activity.imageUrl ? 'transparent' : '#666',
          borderRadius: 10,
          marginRight: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {activity.imageUrl ? (
          <img
            src={activity.imageUrl}
            alt={activity.altText || activity.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '10px',
            }}
            onError={e => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.style.display = 'none';
              const nextSibling = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (nextSibling) {
                nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: activity.imageUrl ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {activity.name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          fontSize: 17,
          color: '#222',
          fontWeight: 500,
        }}
      >
        {activity.name}
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
          checked={activity.published}
          onChange={() => handlePublishedToggle(activity._id)}
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
              color: activity.published ? '#059669' : '#6b7280',
              fontSize: 15,
              fontWeight: activity.published ? '600' : '400',
            }}
            className='published-text mobile-hide-text'
            data-mobile-hidden='true'
          >
            {activity.published ? 'Published' : 'Draft'}
          </span>
        )}
        {activity.published && !isMobile && (
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
          onClick={() => handleMenuOpen(activity._id)}
        >
          <FaEllipsisV size={18} color='#888' />
        </button>
        {menuOpenId === activity._id && (
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
              onClick={() => handleEdit(activity._id)}
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
              onClick={() => handleDelete(activity._id)}
            >
              <FaTrash size={15} /> Delete
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDestinations() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const isMobile = useIsMobile();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [published, setPublished] = useState<{ [id: string]: boolean }>({});
  const [isReordering, setIsReordering] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reviewPersonName, setReviewPersonName] = useState('');

  // Activities from database
  const [activities, setActivities] = useState<Activity[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<string | null>(null);

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
    fetchDestinations();
    fetchActivities();
  }, []);

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

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await authService.authenticatedRequest('/api/destinations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch destinations');
      }

      setDestinations(data.destinations || []);
      // Assume all are published for now
      const pub: { [id: string]: boolean } = {};
      (data.destinations || []).forEach((d: Destination) => {
        pub[d._id] = true;
      });
      setPublished(pub);
    } catch (err: any) {
      setError(err.message || 'Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response =
        await authService.authenticatedRequest('/api/activities');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activities');
      }

      setActivities(data.activities || []);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
    }
  };

  const handleCheckbox = (id: string) => {
    setPublished(prev => ({ ...prev, [id]: !prev[id] }));
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

    const oldIndex = activities.findIndex(item => item._id === active.id);
    const newIndex = activities.findIndex(item => item._id === over.id);

    const reordered = arrayMove(activities, oldIndex, newIndex);

    // Update local state immediately for better UX
    setActivities(reordered);
    setIsReordering(true);

    try {
      // Send the new order to the backend to persist changes
      const response = await authService.authenticatedRequest(
        '/api/activities/reorder',
        {
          method: 'PUT',
          body: JSON.stringify({
            activityIds: reordered.map(activity => activity._id),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update activity order');
      }

      // Get the response data to confirm the order
      const responseData = await response.json();
      if (responseData.activities) {
        // Update with the confirmed order from backend
        const updatedActivities = reordered.map(activity => {
          const updatedActivity = responseData.activities.find(
            (a: any) => a._id === activity._id
          );
          return updatedActivity
            ? { ...activity, position: updatedActivity.position }
            : activity;
        });
        setActivities(updatedActivities);
      }

      showSuccess('Activity order updated successfully!');
    } catch (error) {
      console.error('Error updating activity order:', error);
      // Revert to original order on error
      fetchActivities();
      showError('Failed to save the new order. Please try again.');
    } finally {
      setIsReordering(false);
    }
  };

  const handleAddDestination = () => {
    router.push('/admin/destinations/add');
  };

  const handleEditDestination = (destination: Destination) => {
    router.push(`/admin/destinations/edit/${destination._id}`);
  };

  const handleDeleteDestination = async (destination: Destination) => {
    if (confirm(`Are you sure you want to delete ${destination.name}?`)) {
      try {
        const response = await authService.authenticatedRequest(
          `/api/destinations/${destination._id}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete destination');
        }

        // Remove from local state
        setDestinations(prev => prev.filter(d => d._id !== destination._id));
        showSuccess('Destination deleted successfully!');
      } catch (err: any) {
        showError(`Error deleting destination: ${err.message}`);
      }
    }
  };

  const handleRefresh = () => {
    fetchDestinations();
  };

  const handlePublishedToggle = async (id: string) => {
    try {
      const activity = activities.find(a => a._id === id);
      if (!activity) return;

      const response = await authService.authenticatedRequest(
        `/api/activities/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            published: !activity.published,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update activity');
      }

      // Update local state only after successful API call
      setActivities(prev =>
        prev.map(a => (a._id === id ? { ...a, published: !a.published } : a))
      );
      showSuccess('Activity status updated successfully!');
    } catch (err: any) {
      showError(`Error updating activity: ${err.message}`);
    }
  };

  const handleMenuOpen = (id: string) => {
    setMenuOpenId(id);
  };
  const handleMenuClose = () => {
    setMenuOpenId(null);
  };
  const handleEdit = (id: string) => {
    // Implement edit logic
    router.push(`/admin/activities/edit/${id}`);
    handleMenuClose();
  };
  const handleDelete = async (id: string) => {
    const activity = activities.find(a => a._id === id);
    if (activity) {
      setActivityToDelete({
        id: activity._id,
        name: activity.name,
      });
      setDeleteModalOpen(true);
      handleMenuClose();
    }
  };

  const confirmDeleteActivity = async () => {
    if (!activityToDelete) return;

    try {
      setDeletingActivity(activityToDelete.id);
      const response = await authService.authenticatedRequest(
        `/api/activities/${activityToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete activity');
      }

      // Remove from local state only after successful API call
      setActivities(prev => prev.filter(a => a._id !== activityToDelete.id));
      setDeleteModalOpen(false);
      setActivityToDelete(null);
      showSuccess('Activity deleted successfully!');
    } catch (err: any) {
      showError(`Error deleting activity: ${err.message}`);
    } finally {
      setDeletingActivity(null);
    }
  };

  const cancelDeleteActivity = () => {
    setDeleteModalOpen(false);
    setActivityToDelete(null);
  };

  const handleAddActivity = async () => {
    if (!reviewPersonName.trim()) {
      showError('Please enter an activity name');
      return;
    }

    try {
      const response = await authService.authenticatedRequest(
        '/api/activities',
        {
          method: 'POST',
          body: JSON.stringify({
            name: reviewPersonName.trim(),
            published: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create activity');
      }

      // Add the new activity to the list
      setActivities(prev => [...prev, data.activity]);

      // Close modal and reset form
      setShowAddModal(false);
      setReviewPersonName('');

      // Show success message
      showSuccess('Activity created successfully!');
    } catch (err: any) {
      showError(`Error creating activity: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className='destinations-page'>
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p style={{ color: '#000' }}>Loading Activities...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const activeActivity = activeId
    ? activities.find(a => a._id === activeId)
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
              Activities
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
            Select Activities
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
            Add Activities
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activities.map(a => a._id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {activities.map(activity => (
                <SortableActivityItem
                  key={activity._id}
                  activity={activity}
                  handleMenuOpen={handleMenuOpen}
                  menuOpenId={menuOpenId}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handlePublishedToggle={handlePublishedToggle}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeActivity ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  padding: '0 16px',
                  minHeight: 64,
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
                    width: 40,
                    height: 40,
                    background: activeActivity.imageUrl
                      ? 'transparent'
                      : '#666',
                    borderRadius: 10,
                    marginRight: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {activeActivity.imageUrl ? (
                    <img
                      src={activeActivity.imageUrl}
                      alt={activeActivity.altText || activeActivity.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '10px',
                      }}
                      onError={e => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.style.display = 'none';
                        const nextSibling = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (nextSibling) {
                          nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: activeActivity.imageUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    {activeActivity.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: 17, color: '#222', fontWeight: 500 }}>
                  {activeActivity.name}
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
      {/* Add Activities Modal */}
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
              minWidth: 340,
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
              Activity Name :
            </div>
            <input
              type='text'
              placeholder='Type Activity Name'
              value={reviewPersonName}
              onChange={e => setReviewPersonName(e.target.value)}
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
                onClick={handleAddActivity}
              >
                Add Activity
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
                  setReviewPersonName('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Activity Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDeleteActivity}
        onConfirm={confirmDeleteActivity}
        title='Delete Activity'
        message='Are you sure you want to delete'
        itemName={activityToDelete?.name}
        isLoading={deletingActivity === activityToDelete?.id}
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
