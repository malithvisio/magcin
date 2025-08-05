'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/util/api-utils';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

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
  FaPlus,
  FaImage,
  FaUpload,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaFolder,
  FaFolderOpen,
} from 'react-icons/fa';

interface GalleryImage {
  _id?: string;
  url: string;
  path: string;
  alt: string;
  topic: string;
  order: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploaded: boolean;
}

interface Gallery {
  _id: string;
  name: string;
  description: string;
  images: GalleryImage[];
  published: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// Sortable gallery image item component
function SortableGalleryImageItem({
  image,
  handleMenuOpen,
  menuOpenId,
  handleDelete,
  handleEditImage,
  isMobile,
}: {
  image: GalleryImage;
  handleMenuOpen: (id: string) => void;
  menuOpenId: string | null;
  handleDelete: (image: GalleryImage) => void;
  handleEditImage: (image: GalleryImage) => void;
  isMobile: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.path });

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
        borderRadius: 12,
        boxShadow: isDragging
          ? '0 4px 12px rgba(0,0,0,0.15)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 16,
        padding: isMobile ? '12px' : '16px',
        minHeight: isMobile ? 70 : 80,
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
          fontSize: 18,
          padding: '8px',
          borderRadius: '6px',
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
          width: isMobile ? 50 : 60,
          height: isMobile ? 50 : 60,
          background: '#f3f4f6',
          borderRadius: 12,
          marginRight: isMobile ? 12 : 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '2px solid #e5e7eb',
        }}
      >
        <img
          src={image.url}
          alt={image.alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 10,
          }}
          onError={e => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<FaImage size={24} color="#9ca3af" />';
            }
          }}
        />
      </div>

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
            fontSize: isMobile ? 14 : 16,
            color: '#111',
            fontWeight: 600,
          }}
        >
          {image.topic}
        </div>
        <div
          style={{
            fontSize: isMobile ? 12 : 14,
            color: '#6b7280',
          }}
        >
          {image.alt}
        </div>
        <div
          style={{
            fontSize: isMobile ? 10 : 12,
            color: '#9ca3af',
          }}
        >
          {/* {image.fileName} •  */}
          {(image.fileSize / 1024 / 1024).toFixed(2)} MB
        </div>
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
            handleMenuOpen(image.path);
          }}
        >
          <FaEllipsisV size={18} color='#888' />
        </button>
        {menuOpenId === image.path && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 36,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 10,
              minWidth: 120,
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
                window.open(image.url, '_blank');
              }}
            >
              <FaEye size={15} color='#111' style={{ marginRight: 6 }} />
              View
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
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={e => {
                e.stopPropagation();
                handleEditImage(image);
              }}
            >
              <FaEdit size={15} /> Edit
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
                handleDelete(image);
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

export default function AdminGallery() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [showEditGalleryModal, setShowEditGalleryModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showEditImageModal, setShowEditImageModal] = useState(false);
  const [galleryName, setGalleryName] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [imageTopic, setImageTopic] = useState('');
  const [imageAltText, setImageAltText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<
    Gallery | GalleryImage | null
  >(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    fetchGalleries();
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

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiRequest('/api/gallery');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch galleries');
      }

      setGalleries(data.galleries || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load galleries');
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

    if (!over || active.id === over.id || !selectedGallery) {
      return;
    }

    const oldIndex = selectedGallery.images.findIndex(
      item => item.path === active.id
    );
    const newIndex = selectedGallery.images.findIndex(
      item => item.path === over.id
    );

    const reordered = arrayMove(selectedGallery.images, oldIndex, newIndex);

    // Update local state
    setSelectedGallery({
      ...selectedGallery,
      images: reordered,
    });

    // Save the new order to the database
    try {
      setIsReordering(true);

      const response = await apiRequest('/api/gallery/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          galleryId: selectedGallery._id,
          images: reordered,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save new order');
      }

      showSuccess('Image order updated successfully!');
      setTimeout(() => {
        setIsReordering(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error saving order:', err);
      // Revert to original order on error
      await fetchGalleries();
      setIsReordering(false);
      showError(`Error updating image order: ${err.message}`);
    }
  };

  const handleMenuOpen = (id: string) => {
    setMenuOpenId(id);
  };

  const handleMenuClose = () => {
    setMenuOpenId(null);
  };

  const handleEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setImageTopic(image.topic);
    setImageAltText(image.alt);
    setShowEditImageModal(true);
    setMenuOpenId(null);
  };

  const handleDelete = async (item: Gallery | GalleryImage) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeletingItem('deleting');

      if ('images' in itemToDelete) {
        // Deleting a gallery
        const response = await apiRequest(`/api/gallery/${itemToDelete._id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete gallery');
        }

        setGalleries(prev =>
          prev.filter(gallery => gallery._id !== itemToDelete._id)
        );

        if (selectedGallery?._id === itemToDelete._id) {
          setSelectedGallery(null);
        }

        showSuccess('Gallery deleted successfully!');
      } else {
        // Deleting an image
        const response = await apiRequest(
          `/api/gallery/upload?galleryId=${selectedGallery?._id}&imagePath=${itemToDelete.path}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete image');
        }

        if (selectedGallery) {
          setSelectedGallery({
            ...selectedGallery,
            images: selectedGallery.images.filter(
              img => img.path !== itemToDelete.path
            ),
          });
        }

        showSuccess('Image deleted successfully!');
      }

      setDeleteModalOpen(false);
      setItemToDelete(null);
      handleMenuClose();
    } catch (err: any) {
      showError(`Error deleting item: ${err.message}`);
    } finally {
      setDeletingItem(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleAddGallery = async () => {
    if (!galleryName.trim()) {
      showError('Please enter a Album name');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiRequest('/api/gallery', {
        method: 'POST',
        body: JSON.stringify({
          name: galleryName.trim(),
          description: galleryDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add gallery');
      }

      setGalleries(prev => [...prev, data.gallery]);
      setGalleryName('');
      setGalleryDescription('');
      setShowAddGalleryModal(false);
      showSuccess('Album added successfully!');
    } catch (err: any) {
      showError(`Error adding gallery: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGallery = (gallery: Gallery) => {
    setEditingGallery(gallery);
    setGalleryName(gallery.name);
    setGalleryDescription(gallery.description || '');
    setShowEditGalleryModal(true);
  };

  const handleUpdateGallery = async () => {
    if (!editingGallery || !galleryName.trim()) {
      showError('Please enter a gallery name');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiRequest(`/api/gallery/${editingGallery._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: galleryName.trim(),
          description: galleryDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update gallery');
      }

      // Update galleries list
      setGalleries(prev =>
        prev.map(gallery =>
          gallery._id === editingGallery._id
            ? {
                ...gallery,
                name: galleryName.trim(),
                description: galleryDescription.trim(),
              }
            : gallery
        )
      );

      // Update selected gallery if it's the one being edited
      if (selectedGallery?._id === editingGallery._id) {
        setSelectedGallery({
          ...selectedGallery,
          name: galleryName.trim(),
          description: galleryDescription.trim(),
        });
      }

      setGalleryName('');
      setGalleryDescription('');
      setEditingGallery(null);
      setShowEditGalleryModal(false);
      showSuccess('Gallery updated successfully!');
    } catch (err: any) {
      showError(`Error updating gallery: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateImage = async () => {
    if (!editingImage || !imageTopic.trim()) {
      showError('Please enter an image topic');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiRequest(
        `/api/gallery/upload?galleryId=${selectedGallery?._id}&imagePath=${editingImage.path}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            topic: imageTopic.trim(),
            altText: imageAltText.trim(),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update image');
      }

      // Update the image in the selected gallery
      if (selectedGallery) {
        setSelectedGallery({
          ...selectedGallery,
          images: selectedGallery.images.map(img =>
            img.path === editingImage.path
              ? {
                  ...img,
                  topic: imageTopic.trim(),
                  alt: imageAltText.trim(),
                }
              : img
          ),
        });
      }

      setImageTopic('');
      setImageAltText('');
      setEditingImage(null);
      setShowEditImageModal(false);
      showSuccess('Image updated successfully!');
    } catch (err: any) {
      showError(`Error updating image: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        showError(
          'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showError('File size too large. Maximum size is 5MB.');
        return;
      }

      setSelectedFile(file);
      setImageAltText(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !selectedGallery || !imageTopic.trim()) {
      showError('Please select a file and enter a topic');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('galleryId', selectedGallery._id);
      formData.append('topic', imageTopic.trim());
      formData.append('altText', imageAltText.trim());

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || '',
          'x-user-email': user?.email || '',
          'x-root-user-id': user?.rootUserId || user?.id || '',
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        setSelectedGallery({
          ...selectedGallery,
          images: [...selectedGallery.images, result.image],
        });

        setSelectedFile(null);
        setImageTopic('');
        setImageAltText('');
        setShowAddImageModal(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        showSuccess('Image uploaded successfully!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      showError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div
          style={{
            background: '#f5f5f5',
            minHeight: '100vh',
            padding: isMobile ? 16 : 24,
          }}
        >
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
                Loading Albums...
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const activeImage =
    activeId && selectedGallery
      ? selectedGallery.images.find(img => img.path === activeId)
      : null;

  return (
    <AdminLayout>
      <div
        style={{
          background: '#f5f5f5',
          minHeight: '100vh',
          padding: isMobile ? 16 : 24,
        }}
      >
        {/* Modern Responsive Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: isMobile ? 16 : 24,
            padding: isMobile ? '12px 0' : '16px 0',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
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
            <FaImage size={16} color='white' />
          </div>

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
              Gallery
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 24,
            height: isMobile ? 'calc(100vh - 200px)' : 'auto',
            minHeight: isMobile ? 'calc(100vh - 200px)' : 'auto',
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          {/* Left Sidebar - Gallery List */}
          <div
            style={{
              width: isMobile ? '100%' : 300,
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: isMobile && selectedGallery ? 'none' : 'block',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>
                Albums
              </h2>
              <button
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={() => setShowAddGalleryModal(true)}
              >
                <FaPlus size={12} />
                Add Albums
              </button>
            </div>

            <div
              style={{
                maxHeight: isMobile ? 'calc(100vh - 300px)' : 'auto',
                overflowY: isMobile ? 'auto' : 'visible',
              }}
            >
              {galleries.length === 0 ? (
                <div
                  style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}
                >
                  <FaFolder
                    size={32}
                    style={{ marginBottom: 12, opacity: 0.5 }}
                  />
                  <div>No Albums yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    Create your first gallery
                  </div>
                </div>
              ) : (
                galleries.map(gallery => (
                  <div
                    key={gallery._id}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      cursor: 'pointer',
                      marginBottom: 8,
                      background:
                        selectedGallery?._id === gallery._id
                          ? '#f0f9ff'
                          : 'transparent',
                      border:
                        selectedGallery?._id === gallery._id
                          ? '2px solid #2563eb'
                          : '1px solid #e5e7eb',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setSelectedGallery(gallery)}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      {selectedGallery?._id === gallery._id ? (
                        <FaFolderOpen size={16} color='#2563eb' />
                      ) : (
                        <FaFolder size={16} color='#6b7280' />
                      )}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#111',
                          }}
                        >
                          {gallery.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {gallery.images.length} images
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 4,
                            borderRadius: 4,
                            color: '#2563eb',
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            handleEditGallery(gallery);
                          }}
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 4,
                            borderRadius: 4,
                            color: '#ef4444',
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(gallery);
                          }}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Content - Gallery Images */}
          <div
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: isMobile && !selectedGallery ? 'none' : 'block',
              height: isMobile ? 'auto' : 'fit-content',
              minHeight: isMobile ? 'auto' : 'fit-content',
            }}
          >
            {selectedGallery ? (
              <>
                {isMobile && (
                  <div style={{ marginBottom: 16 }}>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#2563eb',
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                      onClick={() => setSelectedGallery(null)}
                    >
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                      >
                        <path
                          d='M19 12H5M12 19l-7-7 7-7'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      Back to Albums
                    </button>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 16 : 0,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#111',
                        marginBottom: 4,
                      }}
                    >
                      {selectedGallery.name}
                    </h2>
                    {selectedGallery.description && (
                      <p style={{ fontSize: 14, color: '#6b7280' }}>
                        {selectedGallery.description}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      flexDirection: isMobile ? 'column' : 'row',
                      width: isMobile ? '100%' : 'auto',
                    }}
                  >
                    {/* <button
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                      onClick={() => handleEditGallery(selectedGallery)}
                    >
                      <FaEdit size={14} />
                      Edit Gallery
                    </button> */}
                    <button
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        justifyContent: 'center',
                        width: isMobile ? '100%' : 'auto',
                      }}
                      onClick={() => setShowAddImageModal(true)}
                    >
                      <FaUpload size={14} />
                      Add Image
                    </button>
                  </div>
                </div>

                {selectedGallery.images.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 60,
                      color: '#6b7280',
                    }}
                  >
                    <FaImage
                      size={48}
                      style={{ marginBottom: 16, opacity: 0.5 }}
                    />
                    <div style={{ fontSize: 16, marginBottom: 8 }}>
                      No images yet
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 20 }}>
                      Upload your first image to this gallery
                    </div>
                    <button
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 20px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowAddImageModal(true)}
                    >
                      Upload Image
                    </button>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedGallery.images.map(img => img.path)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div>
                        {selectedGallery.images.map(image => (
                          <SortableGalleryImageItem
                            key={image.path}
                            image={image}
                            handleMenuOpen={handleMenuOpen}
                            menuOpenId={menuOpenId}
                            handleDelete={handleDelete}
                            handleEditImage={handleEditImage}
                            isMobile={isMobile}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    <DragOverlay>
                      {activeImage ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#fff',
                            borderRadius: 12,
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                            padding: '16px',
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
                              fontSize: 18,
                              padding: '8px',
                              borderRadius: '6px',
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
                              width: 60,
                              height: 60,
                              background: '#f3f4f6',
                              borderRadius: 12,
                              marginRight: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              border: '2px solid #e5e7eb',
                            }}
                          >
                            <img
                              src={activeImage.url}
                              alt={activeImage.alt}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 10,
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: 16,
                              color: '#111',
                              fontWeight: 600,
                            }}
                          >
                            {activeImage.topic}
                          </div>
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </>
            ) : (
              <div
                style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}
              >
                <FaFolder
                  size={48}
                  style={{ marginBottom: 16, opacity: 0.5 }}
                />
                <div style={{ fontSize: 16, marginBottom: 8 }}>
                  {isMobile ? 'No Gallery Selected' : 'Select a Gallery'}
                </div>
                <div style={{ fontSize: 14 }}>
                  {isMobile
                    ? 'Select a gallery from the list above to view its images'
                    : 'Choose a gallery from the sidebar to view its images'}
                </div>
              </div>
            )}
          </div>
        </div>

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

      {/* Add Gallery Modal */}
      {showAddGalleryModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '16px' : '0',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowAddGalleryModal(false);
            }
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: isMobile ? 20 : 32,
              minWidth: isMobile ? 'auto' : 400,
              maxWidth: isMobile ? '100%' : '90vw',
              width: isMobile ? '100%' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? 16 : 20,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: '#111',
                fontSize: isMobile ? 18 : 20,
                textAlign: 'center',
              }}
            >
              Create New Album
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                Album Name *
              </div>
              <input
                type='text'
                placeholder='Enter Album name'
                value={galleryName}
                onChange={e => setGalleryName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                Description (Optional)
              </div>
              <textarea
                placeholder='Enter Album description'
                value={galleryDescription}
                onChange={e => setGalleryDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: 80,
                  resize: 'vertical',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 8,
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <button
                style={{
                  background: isSubmitting ? '#9ca3af' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  fontWeight: 500,
                  fontSize: isMobile ? 13 : 14,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  flex: 1,
                }}
                onClick={handleAddGallery}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Album'}
              </button>
              <button
                style={{
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  fontWeight: 500,
                  fontSize: isMobile ? 13 : 14,
                  cursor: 'pointer',
                  flex: 1,
                }}
                onClick={() => {
                  setShowAddGalleryModal(false);
                  setGalleryName('');
                  setGalleryDescription('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Gallery Modal */}
      {showEditGalleryModal && editingGallery && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '16px' : '0',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowEditGalleryModal(false);
              setEditingGallery(null);
            }
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: isMobile ? 20 : 32,
              minWidth: isMobile ? 'auto' : 400,
              maxWidth: isMobile ? '100%' : '90vw',
              width: isMobile ? '100%' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? 16 : 20,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: '#111',
                fontSize: isMobile ? 18 : 20,
                textAlign: 'center',
              }}
            >
              Edit Gallery
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                Gallery Name *
              </div>
              <input
                type='text'
                placeholder='Enter gallery name'
                value={galleryName}
                onChange={e => setGalleryName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                Description (Optional)
              </div>
              <textarea
                placeholder='Enter gallery description'
                value={galleryDescription}
                onChange={e => setGalleryDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: 80,
                  resize: 'vertical',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 8,
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <button
                style={{
                  background: isSubmitting ? '#9ca3af' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  fontWeight: 500,
                  fontSize: isMobile ? 13 : 14,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  flex: 1,
                }}
                onClick={handleUpdateGallery}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Gallery'}
              </button>
              <button
                style={{
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  fontWeight: 500,
                  fontSize: isMobile ? 13 : 14,
                  cursor: 'pointer',
                  flex: 1,
                }}
                onClick={() => {
                  setShowEditGalleryModal(false);
                  setEditingGallery(null);
                  setGalleryName('');
                  setGalleryDescription('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {showEditImageModal && editingImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '16px' : '0',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowEditImageModal(false);
              setEditingImage(null);
            }
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: isMobile ? 20 : 32,
              minWidth: isMobile ? 'auto' : 450,
              maxWidth: isMobile ? '100%' : '90vw',
              width: isMobile ? '100%' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? 16 : 20,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: '#111',
                fontSize: isMobile ? 18 : 20,
                textAlign: 'center',
              }}
            >
              Edit Image
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: isMobile ? 13 : 14,
                  marginBottom: isMobile ? 6 : 8,
                }}
              >
                Image Topic *
              </div>
              <input
                type='text'
                placeholder='Enter image topic'
                value={imageTopic}
                onChange={e => setImageTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: isMobile ? 13 : 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: isMobile ? 13 : 14,
                  marginBottom: isMobile ? 6 : 8,
                }}
              >
                Alt Text (Optional)
              </div>
              <input
                type='text'
                placeholder='Enter alt text for accessibility'
                value={imageAltText}
                onChange={e => setImageAltText(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: isMobile ? 13 : 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 8,
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <button
                style={{
                  background: isSubmitting ? '#9ca3af' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  fontWeight: 500,
                  fontSize: isMobile ? 13 : 14,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  flex: 1,
                }}
                onClick={handleUpdateImage}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Image'}
              </button>
              <button
                style={{
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  fontWeight: 500,
                  fontSize: isMobile ? 13 : 14,
                  cursor: 'pointer',
                  flex: 1,
                }}
                onClick={() => {
                  setShowEditImageModal(false);
                  setEditingImage(null);
                  setImageTopic('');
                  setImageAltText('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Image Modal */}
      {showAddImageModal && selectedGallery && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowAddImageModal(false);
            }
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: 32,
              minWidth: 450,
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: '#111',
                fontSize: 20,
                textAlign: 'center',
              }}
            >
              Upload Image to {selectedGallery.name}
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                Image Topic *
              </div>
              <input
                type='text'
                placeholder='Enter image topic (e.g., Beach Sunset, Mountain View)'
                value={imageTopic}
                onChange={e => setImageTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                Alt Text (Optional)
              </div>
              <input
                type='text'
                placeholder='Enter alt text for accessibility'
                value={imageAltText}
                onChange={e => setImageAltText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                Select Image *
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleFileSelect}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                Supported formats: JPEG, PNG, WebP (max 5MB)
              </div>
            </div>

            {isUploading && (
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    Uploading...
                  </span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {uploadProgress}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 4,
                    background: '#e5e7eb',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      background: '#2563eb',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                style={{
                  background: isUploading ? '#9ca3af' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onClick={handleUploadImage}
                disabled={isUploading || !selectedFile || !imageTopic.trim()}
              >
                {isUploading ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload size={14} />
                    Upload Image
                  </>
                )}
              </button>
              <button
                style={{
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  flex: 1,
                }}
                onClick={() => {
                  setShowAddImageModal(false);
                  setSelectedFile(null);
                  setImageTopic('');
                  setImageAltText('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isUploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={
          itemToDelete && 'images' in itemToDelete
            ? 'Delete Gallery'
            : 'Delete Image'
        }
        message='Are you sure you want to delete'
        itemName={
          itemToDelete
            ? 'images' in itemToDelete
              ? itemToDelete.name
              : itemToDelete.topic
            : undefined
        }
        isLoading={deletingItem === 'deleting'}
        loadingText='Deleting...'
        confirmText='Delete'
        cancelText='Cancel'
      />

      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </AdminLayout>
  );
}
