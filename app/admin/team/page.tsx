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
import { FaGripVertical, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';

interface TeamMember {
  _id: string;
  name: string;
  position: string;
  published: boolean;
  sortOrder?: number;
  image?: string;
  bio?: string;
}

// Sortable team member item component
function SortableTeamMemberItem({
  teamMember,
  handleMenuOpen,
  menuOpenId,
  handleEdit,
  handleDelete,
  handlePublishedToggle,
  isMobile,
}: {
  teamMember: TeamMember;
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
  } = useSortable({ id: teamMember._id });

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
          background: '#666',
          borderRadius: 10,
          marginRight: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {teamMember.image ? (
          <img
            src={teamMember.image}
            alt={teamMember.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 10,
            }}
            onError={e => {
              // Fallback to placeholder if image fails to load
              const target = e.currentTarget as HTMLImageElement;
              const nextSibling = target.nextElementSibling as HTMLElement;
              if (target && nextSibling) {
                target.style.display = 'none';
                nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: teamMember.image ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {teamMember.name.charAt(0).toUpperCase()}
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
        {isMobile && teamMember.name.length > 8
          ? `${teamMember.name.substring(0, 8)}...`
          : teamMember.name}
        {!isMobile && ` - ${teamMember.position}`}
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
          checked={teamMember.published}
          onChange={() => handlePublishedToggle(teamMember._id)}
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
              color: teamMember.published ? '#059669' : '#6b7280',
              fontSize: 15,
              fontWeight: teamMember.published ? '600' : '400',
            }}
            className='published-text mobile-hide-text'
            data-mobile-hidden='true'
          >
            {teamMember.published ? 'Published' : 'Draft'}
          </span>
        )}
        {teamMember.published && !isMobile && (
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
          onClick={e => {
            e.stopPropagation();
            handleMenuOpen(teamMember._id);
          }}
        >
          <FaEllipsisV size={18} color='#888' />
        </button>
        {menuOpenId === teamMember._id && (
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
              onClick={e => {
                e.stopPropagation();
                handleEdit(teamMember._id);
              }}
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
              onClick={e => {
                e.stopPropagation();
                handleDelete(teamMember._id);
              }}
            >
              <FaTrash size={15} /> Delete
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminTeam() {
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [teamMemberName, setTeamMemberName] = useState('');
  const [positionName, setPositionName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teamMemberToDelete, setTeamMemberToDelete] =
    useState<TeamMember | null>(null);
  const [deletingTeamMember, setDeletingTeamMember] = useState<string | null>(
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
    fetchTeamMembers();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (menuOpenId) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpenId]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiRequest('/api/team');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch team members');
      }

      setTeamMembers(data.teamMembers || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load team members');
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

    const oldIndex = teamMembers.findIndex(item => item._id === active.id);
    const newIndex = teamMembers.findIndex(item => item._id === over.id);

    const reordered = arrayMove(teamMembers, oldIndex, newIndex);
    setTeamMembers(reordered);

    // Save the new order to the database
    try {
      setIsReordering(true);

      const response = await apiRequest('/api/team/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          teamMembers: reordered,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save new order');
      }

      showSuccess('Team member order updated successfully!');
      // Show success message briefly
      setTimeout(() => {
        setIsReordering(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error saving order:', err);
      // Revert to original order on error
      await fetchTeamMembers();
      setIsReordering(false);
      showError(`Error updating team member order: ${err.message}`);
    }
  };

  const handlePublishedToggle = async (id: string) => {
    const teamMember = teamMembers.find(member => member._id === id);
    if (!teamMember) return;

    const newPublishedState = !teamMember.published;

    // Optimistically update the UI
    setTeamMembers(prev =>
      prev.map(member =>
        member._id === id ? { ...member, published: newPublishedState } : member
      )
    );

    try {
      const response = await apiRequest(`/api/team/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          published: newPublishedState,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update published status');
      }

      showSuccess(
        newPublishedState
          ? 'Team member published successfully!'
          : 'Team member unpublished successfully!'
      );
    } catch (err: any) {
      console.error('Error updating published status:', err);
      // Revert the optimistic update on error
      setTeamMembers(prev =>
        prev.map(member =>
          member._id === id
            ? { ...member, published: !newPublishedState }
            : member
        )
      );
      showError(`Error updating published status: ${err.message}`);
    }
  };

  const handleMenuOpen = (id: string) => {
    setMenuOpenId(id);
  };

  const handleMenuClose = () => {
    setMenuOpenId(null);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/team/edit/${id}`);
    handleMenuClose();
  };

  const handleDelete = async (id: string) => {
    const teamMember = teamMembers.find(member => member._id === id);
    if (teamMember) {
      setTeamMemberToDelete(teamMember);
      setDeleteModalOpen(true);
    }
  };

  const confirmDeleteTeamMember = async () => {
    if (!teamMemberToDelete) return;

    try {
      setDeletingTeamMember(teamMemberToDelete._id);
      const response = await apiRequest(`/api/team/${teamMemberToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete team member');
      }

      setTeamMembers(prev =>
        prev.filter(member => member._id !== teamMemberToDelete._id)
      );
      setDeleteModalOpen(false);
      setTeamMemberToDelete(null);
      handleMenuClose();
      showSuccess('Team member deleted successfully!');
    } catch (err: any) {
      showError(`Error deleting team member: ${err.message}`);
    } finally {
      setDeletingTeamMember(null);
    }
  };

  const cancelDeleteTeamMember = () => {
    setDeleteModalOpen(false);
    setTeamMemberToDelete(null);
  };

  const handleAddTeamMember = async () => {
    if (!teamMemberName.trim() || !positionName.trim()) {
      showError('Please fill in both name and position');
      return;
    }

    try {
      setIsSubmitting(true);

      const teamData: any = {
        name: teamMemberName.trim(),
        position: positionName.trim(),
        published: true,
      };

      // Only add image if it's not empty
      if (imageUrl.trim()) {
        teamData.image = imageUrl.trim();
      }

      console.log('=== FRONTEND DEBUG ===');
      console.log('Team data being sent:', teamData);
      console.log('Name:', teamMemberName.trim());
      console.log('Position:', positionName.trim());
      console.log('Image URL:', imageUrl.trim());

      const response = await apiRequest('/api/team', {
        method: 'POST',
        body: JSON.stringify(teamData), // Ensure proper JSON stringification
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add team member');
      }

      // Add the new team member to the list
      setTeamMembers(prev => [...prev, data.teamMember]);

      // Reset form and close modal
      setTeamMemberName('');
      setPositionName('');
      setImageUrl('');
      setShowAddModal(false);
      showSuccess('Team member added successfully!');
    } catch (err: any) {
      showError(`Error adding team member: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, fontSize: 18 }}>
                Loading team members...
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const activeTeamMember = activeId
    ? teamMembers.find(member => member._id === activeId)
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
              Team
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
            Team Members ({teamMembers.length})
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
            Add Team Member
          </button>
        </div>

        {error && (
          <div
            style={{
              background: '#fee',
              color: '#c33',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              border: '1px solid #fcc',
            }}
          >
            {error}
          </div>
        )}

        {/* Debug info */}
        {/* <div
          style={{
            background: '#f0f0f0',
            padding: '10px',
            marginBottom: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666',
          }}
        >
          <strong>Debug Info:</strong> Team members loaded: {teamMembers.length}
          {teamMembers.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <strong>Team Members:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                {teamMembers.map((member, index) => (
                  <li key={member._id}>
                    {index + 1}. {member.name} - {member.position}
                    {member.image && ` (Image: ${member.image})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div> */}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={teamMembers.map(member => member._id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {teamMembers.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 48,
                    color: '#666',
                    fontSize: 16,
                  }}
                >
                  No team members found. Add your first team member!
                </div>
              ) : (
                teamMembers.map(teamMember => (
                  <SortableTeamMemberItem
                    key={teamMember._id}
                    teamMember={teamMember}
                    handleMenuOpen={handleMenuOpen}
                    menuOpenId={menuOpenId}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handlePublishedToggle={handlePublishedToggle}
                    isMobile={isMobile}
                  />
                ))
              )}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeTeamMember ? (
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
                    background: '#666',
                    borderRadius: 10,
                    marginRight: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {activeTeamMember.image ? (
                    <img
                      src={activeTeamMember.image}
                      alt={activeTeamMember.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 10,
                      }}
                      onError={e => {
                        // Fallback to placeholder if image fails to load
                        const target = e.currentTarget as HTMLImageElement;
                        const nextSibling =
                          target.nextElementSibling as HTMLElement;
                        if (target && nextSibling) {
                          target.style.display = 'none';
                          nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: activeTeamMember.image ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    {activeTeamMember.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: 17, color: '#222', fontWeight: 500 }}>
                  {activeTeamMember.name} - {activeTeamMember.position}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Reordering Status Indicator */}
        {isReordering && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#10b981',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '20px',
              zIndex: 1000,
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            ✓ Order saved successfully!
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
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
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
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
                fontSize: 20,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Add New Team Member
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#444',
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                Team Member Name:
              </div>
              <input
                type='text'
                placeholder='Enter team member name'
                value={teamMemberName}
                onChange={e => setTeamMemberName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 16,
                  color: '#444',
                  background: '#fff',
                  outline: 'none',
                  fontWeight: 400,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#444',
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                Position:
              </div>
              <input
                type='text'
                placeholder='Enter position title'
                value={positionName}
                onChange={e => setPositionName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 16,
                  color: '#444',
                  background: '#fff',
                  outline: 'none',
                  fontWeight: 400,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#444',
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                Image URL (Optional):
              </div>
              <input
                type='url'
                placeholder='Enter image URL (e.g., https://example.com/image.jpg)'
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 16,
                  color: '#444',
                  background: '#fff',
                  outline: 'none',
                  fontWeight: 400,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <button
                style={{
                  background: isSubmitting ? '#94a3b8' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontWeight: 500,
                  fontSize: 16,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  flex: 1,
                }}
                onClick={handleAddTeamMember}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Team Member'}
              </button>
              <button
                style={{
                  background: '#fff',
                  color: '#2563eb',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontWeight: 500,
                  fontSize: 16,
                  cursor: 'pointer',
                  flex: 1,
                }}
                onClick={() => {
                  setShowAddModal(false);
                  setTeamMemberName('');
                  setPositionName('');
                  setImageUrl('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Team Member Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDeleteTeamMember}
        onConfirm={confirmDeleteTeamMember}
        title='Delete Team Member'
        message='Are you sure you want to delete'
        itemName={
          teamMemberToDelete?.name
            ? `${teamMemberToDelete.name} (${teamMemberToDelete.position})`
            : undefined
        }
        isLoading={deletingTeamMember === teamMemberToDelete?._id}
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
