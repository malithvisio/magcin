'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
import { FaGripVertical, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import { apiRequest } from '@/util/api-utils';
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
import { useToast } from '@/contexts/ToastContext';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';

export default function CategoryPackages() {
  const { showSuccess, showError } = useToast();
  const isMobile = useIsMobile();
  const [packages, setPackages] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState<{ [id: string]: boolean }>({});
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [newPackageData, setNewPackageData] = useState({
    name: '',
    days: '',
    destinations: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<any | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<string | null>(null);
  const [updatingPublished, setUpdatingPublished] = useState<string | null>(
    null
  );
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchCategoryAndPackages = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch category name
      const catRes = await apiRequest(`/api/categories/${id}`);
      const catData = await catRes.json();
      if (catData.category) setCategoryName(catData.category.name);

      // Fetch packages
      console.log('Fetching packages for category:', id);
      const pkgRes = await apiRequest(`/api/packages?category=${id}`);
      const pkgData = await pkgRes.json();
      console.log('Packages response:', pkgData);
      console.log('Packages array:', pkgData.packages);
      console.log('Packages count:', pkgData.packages?.length || 0);

      // Debug: Log first package structure to see available fields
      if (pkgData.packages && pkgData.packages.length > 0) {
        console.log('First package structure:', pkgData.packages[0]);
        console.log('First package image fields:', {
          image: pkgData.packages[0].image,
          imageUrl: pkgData.packages[0].imageUrl,
          images: pkgData.packages[0].images,
          images2: pkgData.packages[0].images2,
        });
      }

      setPackages(pkgData.packages || []);

      // Published state
      const pub: { [id: string]: boolean } = {};
      (pkgData.packages || []).forEach((p: any) => {
        pub[p._id] = p.published !== false;
      });
      setPublished(pub);
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategoryAndPackages();
  }, [id, fetchCategoryAndPackages]);

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

  const handleAddPackage = () => {
    setShowAddPackageModal(true);
  };

  const handleCloseModal = () => {
    setShowAddPackageModal(false);
    setNewPackageData({ name: '', days: '', destinations: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewPackageData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitPackage = async () => {
    if (
      !newPackageData.name.trim() ||
      !newPackageData.days.trim() ||
      !newPackageData.destinations.trim()
    ) {
      showError('Please fill in all fields');
      return;
    }

    // Validate that days and destinations are positive numbers
    const days = parseInt(newPackageData.days);
    const destinations = parseInt(newPackageData.destinations);

    if (days < 0 || destinations < 0) {
      showError('Days and destinations must be 0 or positive numbers');
      return;
    }

    setIsSubmitting(true);
    try {
      const packageData = {
        id: `package_${Date.now()}`,
        name: newPackageData.name.trim(),
        title: newPackageData.name.trim(),
        image: '/assets/images/placeholder.jpg',
        summery: newPackageData.name.trim(),
        location: 'TBD',
        duration: `${newPackageData.days} days`,
        days: newPackageData.days.trim(),
        nights: (parseInt(newPackageData.days) - 1).toString(),
        destinations: newPackageData.destinations.trim(),
        avgReview: '',
        totalReviewers: '',
        rating: 4.5,
        reviews: 0,
        type: 'tour',
        mini_discription: newPackageData.name.trim(),
        description: newPackageData.name.trim(),
        highlights: ['Default highlight'],
        inclusions: ['Default inclusion'],
        exclusions: ['Default exclusion'],
        images: [],
        images2: '',
        itinerary: [],
        category: id,
        position: packages.length,
        published: false,
        highlight: false,
        // Instruction page fields
        instructionTitle: '',
        instructionShortDescription: '',
        instructionTabTitle: '',
        instructionNumSections: '',
        instructionImage1: '',
        instructionImage1Alt: '',
        instructionHeaderImageUrl: '',
        instructionSection1Description: '',
        instructionSliderImage1: '',
        instructionSliderImage1Alt: '',
        instructionSliderImage2: '',
        instructionSliderImage2Alt: '',
        // Services fields
        servicesIncluded: [],
        servicesExcluded: [],
        // Locations
        locations: [],
        // Pricing
        priceLeft: '',
        priceRight: '',
        currency: '',
        priceHighlight: false,
        // Accommodation Places
        accommodationPlaces: [],
        // Guidelines
        guidelinesDescription: '',
        guidelinesFaqs: [],
        // Reviews
        packageReviews: [],
      };

      console.log('Creating package with data:', packageData);
      const response = await apiRequest('/api/packages', {
        method: 'POST',
        body: packageData,
      });

      const data = await response.json();
      console.log('Package creation response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create package');
      }

      // Refresh packages list
      console.log('Refreshing packages list...');
      await fetchCategoryAndPackages();
      handleCloseModal();
      showSuccess('Package created successfully!');
    } catch (err: any) {
      console.error('Create package error:', err);
      showError(err.message || 'Failed to create package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPackage = (pkg: any) =>
    router.push(`/admin/packages/add?edit=true&id=${pkg._id}&category=${id}`);
  const handleDeletePackage = (pkg: any) => {
    setPackageToDelete(pkg);
    setDeleteModalOpen(true);
  };

  const confirmDeletePackage = async () => {
    if (!packageToDelete) return;

    try {
      setDeletingPackage(packageToDelete._id);
      const response = await apiRequest(
        `/api/packages/${packageToDelete._id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete package');
      }

      setPackages(prev => prev.filter(p => p._id !== packageToDelete._id));
      showSuccess('Package deleted successfully!');
      setDeleteModalOpen(false);
      setPackageToDelete(null);
    } catch (err: any) {
      console.error('Delete package error:', err);
      showError(err.message || 'Failed to delete package');
    } finally {
      setDeletingPackage(null);
    }
  };

  const cancelDeletePackage = () => {
    setDeleteModalOpen(false);
    setPackageToDelete(null);
  };
  const handleMenuOpen = (id: string) => setMenuOpenId(id);
  const handleMenuClose = () => setMenuOpenId(null);
  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(event.active.id as string);
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = packages.findIndex(item => item._id === active.id);
    const newIndex = packages.findIndex(item => item._id === over.id);
    const reordered = arrayMove(packages, oldIndex, newIndex);
    setPackages(reordered);
    setIsReordering(true);
    try {
      const response = await apiRequest('/api/packages/reorder', {
        method: 'PUT',
        body: {
          categoryId: id,
          packageIds: reordered.map(pkg => pkg._id),
        },
      });
      if (!response.ok) throw new Error('Failed to update order');
      showSuccess('Package order updated successfully!');
    } catch (err: any) {
      console.error('Error updating package order:', err);
      fetchCategoryAndPackages();
      showError('Failed to save the new order. Please try again.');
    } finally {
      setIsReordering(false);
    }
  };
  const handleTogglePublished = async (pkg: any) => {
    try {
      setUpdatingPublished(pkg._id);

      const response = await apiRequest(`/api/packages/${pkg._id}`, {
        method: 'PATCH',
        body: { published: !published[pkg._id] },
      });

      if (response.ok) {
        setPublished(prev => ({ ...prev, [pkg._id]: !prev[pkg._id] }));
        showSuccess(
          `Package ${published[pkg._id] ? 'unpublished' : 'published'} successfully!`
        );
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update published status');
      }
    } catch (err: any) {
      console.error('Error updating package published status:', err);
      showError(`Error updating published status: ${err.message}`);
    } finally {
      setUpdatingPublished(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: 32, color: '#000' }}>Loading packages...</div>
      </AdminLayout>
    );
  }

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
                cursor: 'pointer',
                transition: 'color 0.2s',
                fontFamily: 'sans-serif',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1d4ed8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#000000')}
              onClick={() => router.push('/admin/packages')}
            >
              Packages
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
                color: '#000000',
                fontWeight: '700',
                fontFamily: 'sans-serif',
              }}
            >
              {categoryName || 'Category'}
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
          <div style={{ fontWeight: 500, color: '#000' }}>Select Package</div>
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
            onClick={handleAddPackage}
          >
            Add Package
          </button>
        </div>
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
          <strong>Debug Info:</strong> Packages loaded: {packages.length} |
          Category ID: {id} | Category Name: {categoryName}
        </div> */}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={packages.map(p => p._id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {packages.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666',
                    fontSize: '16px',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  No packages found in this category. Create your first package
                  using the "Add new Package" button above.
                </div>
              ) : (
                packages.map(pkg => (
                  <SortablePackageCard
                    key={pkg._id}
                    pkg={pkg}
                    published={published}
                    onEdit={handleEditPackage}
                    onDelete={handleDeletePackage}
                    menuOpenId={menuOpenId}
                    onMenuOpen={handleMenuOpen}
                    onTogglePublished={handleTogglePublished}
                    isMobile={isMobile}
                    updatingPublished={updatingPublished}
                  />
                ))
              )}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 8,
                  padding: '0 16px',
                  minHeight: 64,
                  border: '1px solid #e0e0e0',
                  background: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  opacity: 0.8,
                }}
              >
                <DotHandle />
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: '#666',
                    borderRadius: 10,
                    marginRight: 16,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    fontSize: 17,
                    color: '#222',
                    fontWeight: 500,
                  }}
                >
                  {packages.find(p => p._id === activeId)?.name}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      padding: '4px 8px',
                      background: '#f0f0f0',
                      borderRadius: 4,
                      fontSize: 12,
                      color: '#666',
                    }}
                  >
                    {packages.find(p => p._id === activeId)?.days} days
                  </div>
                  <div
                    style={{
                      padding: '4px 8px',
                      background: '#f0f0f0',
                      borderRadius: 4,
                      fontSize: 12,
                      color: '#666',
                    }}
                  >
                    {packages.find(p => p._id === activeId)?.destinations}{' '}
                    destinations
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Add Package Modal */}
        {showAddPackageModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              fontFamily: 'sans-serif',
            }}
          >
            <div
              style={{
                background: '#f5f5f5',
                padding: '2rem',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '0.9rem',
                  }}
                >
                  Package Name :
                </label>
                <input
                  type='text'
                  value={newPackageData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='Type Package Name'
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: 'white',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '0.9rem',
                  }}
                >
                  Number of Days :
                </label>
                <input
                  type='number'
                  min='0'
                  value={newPackageData.days}
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (value >= 0) {
                      handleInputChange('days', e.target.value);
                    }
                  }}
                  placeholder='Type Days amount'
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: 'white',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '0.9rem',
                  }}
                >
                  Number of Destinations :
                </label>
                <input
                  type='number'
                  min='0'
                  value={newPackageData.destinations}
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (value >= 0) {
                      handleInputChange('destinations', e.target.value);
                    }
                  }}
                  placeholder='Type Destinations amount'
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: 'white',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={handleSubmitPackage}
                  disabled={isSubmitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? 'Adding...' : 'Add Package'}
                </button>
                <button
                  onClick={handleCloseModal}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'white',
                    color: '#3b82f6',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .packages-page {
            padding: 1.5rem;
          }

          /* Mobile responsive styles */
          @media (max-width: 768px) {
            .package-card {
              padding: 12px 16px !important;
            }

            .package-name {
              font-size: 16px !important;
              font-weight: 600 !important;
            }

            .package-checkbox {
              margin-right: 0 !important;
            }
          }

          .section-title {
            font-size: 1.25rem;
            font-weight: 500;
            color: #1e293b;
            margin: 0 0 1rem 0;
            letter-spacing: 0.3px;
          }

          .add-category-btn {
            padding: 0.75rem 1rem;
            background-color: #3b82f6;
            border: none;
            color: white;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 0.3px;
            transition: background-color 0.2s;
          }

          .add-category-btn:hover {
            background-color: #2563eb;
          }

          .category-input {
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 0.3px;
          }

          .action-btn {
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 0.3px;
          }

          .category-btn {
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 0.3px;
            text-align: left;
          }

          .category-action-btn {
            font-size: 0.9rem;
          }

          .edit-name-container {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .edit-name-input {
            padding: 0.25rem 0.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            width: 100%;
          }

          .edit-name-buttons {
            display: flex;
            gap: 0.5rem;
          }

          .save-button,
          .cancel-button {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            cursor: pointer;
            border: none;
          }

          .save-button {
            background-color: #3b82f6;
            color: white;
          }

          .save-button:hover {
            background-color: #2563eb;
          }

          .cancel-button {
            background-color: #e5e7eb;
            color: #374151;
          }

          .cancel-button:hover {
            background-color: #d1d5db;
          }

          .edit-name-button {
            background: none;
            border: none;
            color: #3b82f6;
            font-size: 0.75rem;
            cursor: pointer;
            padding: 0.125rem 0.25rem;
            margin-left: 0.5rem;
          }

          .edit-name-button:hover {
            text-decoration: underline;
          }

          /* Modal styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }

          .modal-content h3 {
            margin: 0 0 1rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
          }

          .modal-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
          }

          .category-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
            background-color: white;
            color: #374151;
          }

          .category-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background-color: white;
            color: #374151;
          }

          .action-btn {
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .save-btn {
            background-color: #3b82f6;
            color: white;
            border: none;
          }

          .save-btn:hover {
            background-color: #2563eb;
          }

          .cancel-btn {
            background-color: white;
            color: #ef4444;
            border: 1px solid #ef4444;
          }

          .cancel-btn:hover {
            background-color: #fee2e2;
          }
        `}</style>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          title='Delete Package'
          message={`Are you sure you want to delete "${packageToDelete?.name}"?`}
          itemName={packageToDelete?.name || ''}
          isLoading={deletingPackage === packageToDelete?._id}
          onConfirm={confirmDeletePackage}
          onClose={cancelDeletePackage}
        />
      </div>
    </AdminLayout>
  );
}

function DotHandle({ setActivatorNodeRef, listeners, attributes }: any) {
  return (
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
}

function SortablePackageCard({
  pkg,
  published,
  onEdit,
  onDelete,
  menuOpenId,
  onMenuOpen,
  onTogglePublished,
  isMobile,
  updatingPublished,
}: {
  pkg: any;
  published: { [id: string]: boolean };
  onEdit: (pkg: any) => void;
  onDelete: (pkg: any) => void;
  menuOpenId: string | null;
  onMenuOpen: (id: string) => void;
  onTogglePublished: (pkg: any) => void;
  isMobile: boolean;
  updatingPublished: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pkg._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f0f0f0' : '#fff',
  };

  return (
    <div
      ref={setNodeRef}
      className='package-card'
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
      <DotHandle
        setActivatorNodeRef={setActivatorNodeRef}
        listeners={listeners}
        attributes={attributes}
      />
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
        {(() => {
          console.log(`Package ${pkg.name} image fields:`, {
            image: pkg.image,
            instructionImage1: pkg.instructionImage1,
            imageUrl: pkg.imageUrl,
            images: pkg.images,
            images2: pkg.images2,
          });
          return null;
        })()}
        {pkg.image ? (
          <img
            src={pkg.image}
            alt={pkg.name}
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
        ) : pkg.instructionImage1 ? (
          <img
            src={pkg.instructionImage1}
            alt={pkg.name}
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
        ) : pkg.imageUrl ? (
          <img
            src={pkg.imageUrl}
            alt={pkg.name}
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
        ) : pkg.images && pkg.images.length > 0 && pkg.images[0] ? (
          <img
            src={pkg.images[0]}
            alt={pkg.name}
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
            pkg.image ||
            pkg.instructionImage1 ||
            pkg.imageUrl ||
            (pkg.images && pkg.images.length > 0 && pkg.images[0])
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
          {/* {pkg.name.charAt(0).toUpperCase()} */}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div
          className='package-name'
          style={{ fontSize: 17, color: '#222', fontWeight: 500 }}
        >
          {isMobile && pkg.name.length > 10
            ? `${pkg.name.substring(0, 10)}...`
            : pkg.name}
        </div>
        {!published[pkg._id] && (
          <div
            style={{
              fontSize: 12,
              color: '#6b7280',
              marginTop: 2,
              fontStyle: 'italic',
            }}
          ></div>
        )}
      </div>
      {!isMobile && (
        <>
          <div
            style={{
              minWidth: 100,
              textAlign: 'center',
              fontSize: 15,
              color: '#222',
            }}
          >
            {pkg.days} Days
          </div>
          <div
            style={{
              minWidth: 120,
              textAlign: 'center',
              fontSize: 15,
              color: '#222',
            }}
          >
            {pkg.destinations} Destinations
          </div>
        </>
      )}
      <div style={{ display: 'flex', alignItems: 'center', marginRight: 24 }}>
        <input
          type='checkbox'
          checked={published[pkg._id]}
          onChange={() => onTogglePublished(pkg)}
          disabled={updatingPublished === pkg._id}
          className='package-checkbox'
          style={{
            width: 18,
            height: 18,
            accentColor: '#2563eb',
            marginRight: 8,
            cursor: updatingPublished === pkg._id ? 'not-allowed' : 'pointer',
            opacity: updatingPublished === pkg._id ? 0.6 : 1,
          }}
        />
        {!isMobile && (
          <span
            style={{
              color: published[pkg._id] ? '#059669' : '#6b7280',
              fontSize: 15,
              fontWeight: published[pkg._id] ? '600' : '400',
              opacity: updatingPublished === pkg._id ? 0.6 : 1,
            }}
          >
            {updatingPublished === pkg._id
              ? 'Updating...'
              : published[pkg._id]
                ? 'Published'
                : 'Draft'}
          </span>
        )}
        {published[pkg._id] && !isMobile && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#059669',
              marginLeft: 8,
              opacity: updatingPublished === pkg._id ? 0.6 : 1,
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
            onMenuOpen(pkg._id);
          }}
        >
          <FaEllipsisV size={18} color='#888' />
        </button>
        {menuOpenId === pkg._id && (
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
              onClick={() => onEdit(pkg)}
            >
              <FaEdit size={17} color='#111' style={{ marginRight: 6 }} />
              Edit
            </div>
            <div style={{ height: 1, background: '#eee', margin: '0 8px' }} />
            <div
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#d32f2f',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => onDelete(pkg)}
            >
              <FaTrash size={15} /> Delete
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
