'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { authService } from '@/util/auth';
import { useToast } from '@/contexts/ToastContext';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
  insideImages?: Array<{
    url: string;
    alt: string;
    path: string;
    order: number;
  }>;
  insideShortDescription?: string;
  insideTabTitle?: string;
  highlights?: Array<{
    point: string;
    order: number;
  }>;
  published?: boolean;
}

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params.id as string;
  const { showSuccess, showError } = useToast();

  const [tab, setTab] = useState('main');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activity, setActivity] = useState<Activity | null>(null);
  const [imagesLoading, setImagesLoading] = useState(false);

  // Main page card fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [altText, setAltText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [reviewStars, setReviewStars] = useState('');
  const [highlight, setHighlight] = useState(false);

  // Image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  // Multiple images state
  const [insideImages, setInsideImages] = useState<
    Array<{
      url: string;
      alt: string;
      path: string;
      order: number;
    }>
  >([]);

  // Alt text editing state
  const [editingAltText, setEditingAltText] = useState<number | null>(null);
  const [tempAltText, setTempAltText] = useState('');

  // Multiple upload with alt text state
  const [showAltTextModal, setShowAltTextModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [altTexts, setAltTexts] = useState<string[]>([]);

  // Inside page fields
  const [insideTitle, setInsideTitle] = useState('');
  const [insideDescription, setInsideDescription] = useState('');
  const [insideImageAlt, setInsideImageAlt] = useState('');
  const [insideImageUrl, setInsideImageUrl] = useState('');
  const [insideShortDescription, setInsideShortDescription] = useState('');
  const [insideTabTitle, setInsideTabTitle] = useState('');

  // Highlights state
  const [highlights, setHighlights] = useState<
    Array<{ point: string; order: number }>
  >([]);
  const [newHighlight, setNewHighlight] = useState('');

  // Fetch activity data
  const fetchActivity = useCallback(async () => {
    try {
      setIsLoading(true);
      setImagesLoading(true);
      const response = await authService.authenticatedRequest(
        `/api/activities/${activityId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activity');
      }

      const activityData = data.activity;
      setActivity(activityData);

      // Debug logging for raw API response
      console.log('Raw API response:', {
        success: data.success,
        activityData: activityData,
        insideImages: activityData?.insideImages,
        insideImagesType: typeof activityData?.insideImages,
        insideImagesLength: activityData?.insideImages?.length || 0,
      });

      // Populate main page card fields
      setTitle(activityData.title || '');
      setDescription(activityData.description || '');
      setAltText(activityData.altText || '');
      setImageUrl(activityData.imageUrl || '');
      setReviewStars(activityData.reviewStars?.toString() || '');
      setHighlight(activityData.highlight || false);

      // Populate inside page fields
      setInsideTitle(activityData.insideTitle || '');
      setInsideDescription(activityData.insideDescription || '');
      setInsideImageAlt(activityData.insideImageAlt || '');
      setInsideImageUrl(activityData.insideImageUrl || '');

      // Ensure insideImages is properly set
      const insideImagesData = activityData.insideImages || [];
      console.log('Setting insideImages state:', {
        insideImagesData,
        length: insideImagesData.length,
        isArray: Array.isArray(insideImagesData),
      });
      setInsideImages(insideImagesData);

      setInsideShortDescription(activityData.insideShortDescription || '');
      setInsideTabTitle(activityData.insideTabTitle || '');
      setHighlights(activityData.highlights || []);

      // Debug logging for state after setting
      console.log('State after setting insideImages:', {
        insideImages: insideImagesData,
        insideImagesLength: insideImagesData.length,
      });

      // Debug logging
      console.log('Activity data loaded:', {
        insideImages: activityData.insideImages,
        insideImagesLength: activityData.insideImages?.length || 0,
        insideImagesType: typeof activityData.insideImages,
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
      setError('Failed to fetch activity');
    } finally {
      setIsLoading(false);
      setImagesLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    if (activityId) {
      fetchActivity();
    }
  }, [activityId, fetchActivity]);

  // Debug: Monitor insideImages state changes
  useEffect(() => {
    console.log('insideImages state changed:', {
      insideImages,
      length: insideImages.length,
    });
  }, [insideImages]);

  // Debug: Monitor activity state changes
  useEffect(() => {
    console.log('activity state changed:', {
      activity,
      hasActivity: !!activity,
      insideImagesFromActivity: activity?.insideImages,
      insideImagesLength: activity?.insideImages?.length || 0,
    });
  }, [activity]);

  // Fallback: If activity has insideImages but state is empty, update state
  useEffect(() => {
    if (
      activity &&
      activity.insideImages &&
      activity.insideImages.length > 0 &&
      insideImages.length === 0
    ) {
      console.log('Fallback: Setting insideImages from activity data:', {
        activityInsideImages: activity.insideImages,
        currentInsideImages: insideImages,
      });
      setInsideImages(activity.insideImages);
    }
  }, [activity, insideImages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug logging
    console.log('Submitting form data:', {
      title,
      description,
      imageUrl,
      altText,
      reviewStars: reviewStars ? Number(reviewStars) : undefined,
      highlight,
      insideTitle,
      insideDescription,
      insideImageUrl,
      insideImageAlt,
      insideImages,
      insideShortDescription,
      insideTabTitle,
    });

    try {
      const response = await authService.authenticatedRequest(
        `/api/activities/${activityId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            title,
            description,
            imageUrl,
            altText,
            reviewStars: reviewStars ? Number(reviewStars) : undefined,
            highlight,
            insideTitle,
            insideDescription,
            insideImageUrl,
            insideImageAlt,
            insideImages,
            insideShortDescription,
            insideTabTitle,
            highlights,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update activity');
      }

      showSuccess('Activity updated successfully!');
      router.push('/admin/activities');
    } catch (err: any) {
      showError(`Error updating activity: ${err.message}`);
    }
  };

  const handleCancel = () => {
    router.push('/admin/activities');
  };

  // Image upload functions for main page
  const handleImageUpload = async (file: File, type: 'main') => {
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('activityId', activityId);

      // Add old image URL for deletion
      if (type === 'main' && imageUrl) {
        formData.append('oldImageUrl', imageUrl);
      }

      // Get auth headers but exclude Content-Type for FormData
      const user = authService.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const headers: HeadersInit = {
        'x-user-id': user.id,
        'x-user-email': user.email,
        'x-tenant-id': user.tenantId,
      };

      if (user.companyId) {
        headers['x-company-id'] = user.companyId;
      }

      console.log('Uploading image:', {
        fileName: file.name,
        size: file.size,
        type,
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      console.log('Upload successful:', data);

      // Update the appropriate image URL
      if (type === 'main') {
        setImageUrl(data.url);
      }

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'main'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file, type);
    }
  };

  const triggerFileInput = (type: 'main') => {
    if (type === 'main') {
      fileInputRef.current?.click();
    }
  };

  // Multiple image upload functions
  const handleMultipleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();

      // Append all files
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      formData.append('type', 'inside');
      formData.append('activityId', activityId);

      // Get auth headers but exclude Content-Type for FormData
      const user = authService.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const headers: HeadersInit = {
        'x-user-id': user.id,
        'x-user-email': user.email,
        'x-tenant-id': user.tenantId,
      };

      if (user.companyId) {
        headers['x-company-id'] = user.companyId;
      }

      console.log('Uploading multiple images:', { filesCount: files.length });

      const response = await fetch('/api/upload-multiple', {
        method: 'POST',
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      console.log('Multiple upload successful:', data);

      // Add new images to existing ones with proper order
      const newImages = data.images.map((image: any, index: number) => ({
        ...image,
        order: insideImages.length + index, // Maintain proper order
      }));

      const updatedImages = [...insideImages, ...newImages];
      setInsideImages(updatedImages);

      // Save the updated images to the database immediately
      try {
        const saveResponse = await authService.authenticatedRequest(
          `/api/activities/${activityId}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              insideImages: updatedImages,
            }),
          }
        );

        const saveData = await saveResponse.json();

        if (!saveResponse.ok) {
          throw new Error(
            saveData.error || 'Failed to save images to database'
          );
        }

        console.log('Images saved to database successfully');

        // Show success message
        alert('Images uploaded and saved successfully!');
      } catch (error: any) {
        console.error('Error saving images to database:', error);
        alert(
          `Images uploaded but failed to save to database: ${error.message}`
        );
      }

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      console.error('Multiple upload error:', error);
      alert(`Error uploading images: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMultipleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      // If single file, upload directly without modal
      if (files.length === 1) {
        handleDirectUpload(files[0]);
      } else {
        // Multiple files, show modal for alt text input
        setSelectedFiles(files);
        const initialAltTexts = Array.from(files).map(file =>
          file.name.replace(/\.[^/.]+$/, '')
        );
        setAltTexts(initialAltTexts);
        setShowAltTextModal(true);
      }
    }
  };

  const triggerMultipleFileInput = () => {
    multipleFileInputRef.current?.click();
  };

  const removeImage = async (imagePath: string, imageIndex: number) => {
    try {
      const user = authService.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const headers: HeadersInit = {
        'x-user-id': user.id,
        'x-user-email': user.email,
        'x-tenant-id': user.tenantId,
      };

      if (user.companyId) {
        headers['x-company-id'] = user.companyId;
      }

      const response = await fetch(
        `/api/upload-multiple?path=${encodeURIComponent(imagePath)}&activityId=${activityId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete image');
      }

      // Remove image from state
      const updatedImages = insideImages.filter(
        (_, index) => index !== imageIndex
      );
      setInsideImages(updatedImages);

      // Save the updated images to the database immediately
      try {
        const response = await authService.authenticatedRequest(
          `/api/activities/${activityId}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              insideImages: updatedImages,
            }),
          }
        );

        const saveData = await response.json();

        if (!response.ok) {
          throw new Error(
            saveData.error || 'Failed to save updated images to database'
          );
        }

        console.log('Image removed and database updated successfully');
        showSuccess('Image removed successfully!');
      } catch (error: any) {
        console.error('Error saving updated images to database:', error);
        showError(
          `Image removed but failed to update database: ${error.message}`
        );
      }
    } catch (error: any) {
      console.error('Error removing image:', error);
      showError(`Error removing image: ${error.message}`);
    }
  };

  // Alt text editing functions
  const startEditingAltText = (index: number, currentAlt: string) => {
    setEditingAltText(index);
    setTempAltText(currentAlt);
  };

  const saveAltText = async (index: number) => {
    const updatedImages = insideImages.map((image, i) =>
      i === index ? { ...image, alt: tempAltText } : image
    );
    setInsideImages(updatedImages);

    // Save the updated images to the database immediately
    try {
      const response = await authService.authenticatedRequest(
        `/api/activities/${activityId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            insideImages: updatedImages,
          }),
        }
      );

      const saveData = await response.json();

      if (!response.ok) {
        throw new Error(
          saveData.error || 'Failed to save alt text to database'
        );
      }

      console.log('Alt text saved to database successfully');
      showSuccess('Alt text updated successfully!');
    } catch (error: any) {
      console.error('Error saving alt text to database:', error);
      showError(
        `Alt text updated but failed to save to database: ${error.message}`
      );
    }

    setEditingAltText(null);
    setTempAltText('');
  };

  const cancelAltTextEdit = () => {
    setEditingAltText(null);
    setTempAltText('');
  };

  const handleAltTextModalSubmit = async () => {
    if (!selectedFiles) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();

      // Append all files
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file);
      });

      // Append alt texts
      altTexts.forEach(altText => {
        formData.append('altTexts', altText);
      });

      formData.append('type', 'inside');
      formData.append('activityId', activityId);

      // Get auth headers but exclude Content-Type for FormData
      const user = authService.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const headers: HeadersInit = {
        'x-user-id': user.id,
        'x-user-email': user.email,
        'x-tenant-id': user.tenantId,
      };

      if (user.companyId) {
        headers['x-company-id'] = user.companyId;
      }

      console.log('Uploading multiple images with alt texts:', {
        filesCount: selectedFiles.length,
        altTexts,
      });

      const response = await fetch('/api/upload-multiple', {
        method: 'POST',
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      console.log('Multiple upload successful:', data);

      // Add new images to existing ones with proper order
      const newImages = data.images.map((image: any, index: number) => ({
        ...image,
        order: insideImages.length + index, // Maintain proper order
      }));

      const updatedImages = [...insideImages, ...newImages];
      setInsideImages(updatedImages);

      // Save the updated images to the database immediately
      try {
        const saveResponse = await authService.authenticatedRequest(
          `/api/activities/${activityId}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              insideImages: updatedImages,
            }),
          }
        );

        const saveData = await saveResponse.json();

        if (!saveResponse.ok) {
          throw new Error(
            saveData.error || 'Failed to save images to database'
          );
        }

        console.log('Images saved to database successfully');

        // Show success message
        alert('Images uploaded and saved successfully!');
      } catch (error: any) {
        console.error('Error saving images to database:', error);
        alert(
          `Images uploaded but failed to save to database: ${error.message}`
        );
      }

      // Reset modal state
      setShowAltTextModal(false);
      setSelectedFiles(null);
      setAltTexts([]);

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      console.error('Multiple upload error:', error);
      alert(`Error uploading images: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const cancelAltTextModal = () => {
    setShowAltTextModal(false);
    setSelectedFiles(null);
    setAltTexts([]);
  };

  // Highlights management functions
  const addHighlight = () => {
    if (newHighlight.trim()) {
      const newHighlightItem = {
        point: newHighlight.trim(),
        order: highlights.length,
      };
      setHighlights([...highlights, newHighlightItem]);
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    const updatedHighlights = highlights.filter((_, i) => i !== index);
    // Reorder the remaining highlights
    const reorderedHighlights = updatedHighlights.map((highlight, i) => ({
      ...highlight,
      order: i,
    }));
    setHighlights(reorderedHighlights);
  };

  const moveHighlightUp = (index: number) => {
    if (index > 0) {
      const updatedHighlights = [...highlights];
      [updatedHighlights[index], updatedHighlights[index - 1]] = [
        updatedHighlights[index - 1],
        updatedHighlights[index],
      ];
      // Update order numbers
      const reorderedHighlights = updatedHighlights.map((highlight, i) => ({
        ...highlight,
        order: i,
      }));
      setHighlights(reorderedHighlights);
    }
  };

  const moveHighlightDown = (index: number) => {
    if (index < highlights.length - 1) {
      const updatedHighlights = [...highlights];
      [updatedHighlights[index], updatedHighlights[index + 1]] = [
        updatedHighlights[index + 1],
        updatedHighlights[index],
      ];
      // Update order numbers
      const reorderedHighlights = updatedHighlights.map((highlight, i) => ({
        ...highlight,
        order: i,
      }));
      setHighlights(reorderedHighlights);
    }
  };

  const handleDirectUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('files', file);
      formData.append('altTexts', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('type', 'inside');
      formData.append('activityId', activityId);

      // Get auth headers but exclude Content-Type for FormData
      const user = authService.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const headers: HeadersInit = {
        'x-user-id': user.id,
        'x-user-email': user.email,
        'x-tenant-id': user.tenantId,
      };

      if (user.companyId) {
        headers['x-company-id'] = user.companyId;
      }

      console.log('Uploading single image directly:', { fileName: file.name });

      const response = await fetch('/api/upload-multiple', {
        method: 'POST',
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      console.log('Direct upload successful:', data);

      // Add new image to existing ones with proper order
      const newImages = data.images.map((image: any, index: number) => ({
        ...image,
        order: insideImages.length + index, // Maintain proper order
      }));

      const updatedImages = [...insideImages, ...newImages];
      setInsideImages(updatedImages);

      // Save the updated images to the database immediately
      try {
        const saveResponse = await authService.authenticatedRequest(
          `/api/activities/${activityId}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              insideImages: updatedImages,
            }),
          }
        );

        const saveData = await saveResponse.json();

        if (!saveResponse.ok) {
          throw new Error(
            saveData.error || 'Failed to save images to database'
          );
        }

        console.log('Images saved to database successfully');

        // Show success message
        alert('Image uploaded and saved successfully!');
      } catch (error: any) {
        console.error('Error saving images to database:', error);
        alert(
          `Image uploaded but failed to save to database: ${error.message}`
        );
      }

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      console.error('Direct upload error:', error);
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 24 }}>
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: 18, color: '#666' }}>
              Loading activity...
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 24 }}>
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: 18, color: '#dc2626' }}>Error: {error}</div>
            <button
              onClick={() => router.push('/admin/activities')}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: 16,
              }}
            >
              Back to Activities
            </button>
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

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
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
              onClick={() => router.push('/admin/activities')}
            >
              Activities
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
              Edit Activity
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
              {activity?.name || 'Loading...'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button
            style={{
              background: tab === 'main' ? '#2563eb' : '#e5e7eb',
              color: tab === 'main' ? '#fff' : '#2563eb',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontWeight: 500,
              fontSize: 16,
              cursor: 'pointer',
            }}
            onClick={() => setTab('main')}
          >
            Main Page Card
          </button>
          <button
            style={{
              background: tab === 'inside' ? '#2563eb' : '#e5e7eb',
              color: tab === 'inside' ? '#fff' : '#2563eb',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontWeight: 500,
              fontSize: 16,
              cursor: 'pointer',
            }}
            onClick={() => setTab('inside')}
          >
            Inside page
          </button>
        </div>
        {tab === 'main' && (
          <form
            onSubmit={handleSubmit}
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Title
              </div>
              <input
                type='text'
                placeholder='Enter Title'
                value={title}
                onChange={e => setTitle(e.target.value)}
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
                Description
              </div>
              <input
                type='text'
                placeholder='Enter Description'
                value={description}
                onChange={e => setDescription(e.target.value)}
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
                Image (Upload image or enter image url)
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e, 'main')}
              />

              <button
                type='button'
                disabled={isUploading}
                onClick={() => triggerFileInput('main')}
                style={{
                  background: isUploading ? '#9ca3af' : '#e5e7eb',
                  color: '#2563eb',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontWeight: 500,
                  fontSize: 16,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  marginBottom: 16,
                  opacity: isUploading ? 0.7 : 1,
                }}
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </button>

              {/* Upload progress */}
              {isUploading && (
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      width: '100%',
                      height: '4px',
                      background: '#e5e7eb',
                      borderRadius: '2px',
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

              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: imageUrl ? 'transparent' : '#d1d5db',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontWeight: 500,
                    fontSize: 18,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt='Activity'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  ) : (
                    'Image'
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginBottom: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
                      <div
                        style={{
                          fontWeight: 400,
                          color: '#444',
                          marginBottom: 4,
                        }}
                      >
                        Alt text
                      </div>
                      <input
                        type='text'
                        placeholder='Enter Alt Text'
                        value={altText}
                        onChange={e => setAltText(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1.5px solid #e0e0e0',
                          fontSize: 15,
                          color: '#444',
                          background: '#fff',
                          outline: 'none',
                          fontWeight: 400,
                        }}
                      />
                    </div>
                    <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
                      <div
                        style={{
                          fontWeight: 400,
                          color: '#444',
                          marginBottom: 4,
                        }}
                      >
                        Image URL (Uploaded image or Existing image URL)
                      </div>
                      <input
                        type='text'
                        placeholder='Image URL'
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1.5px solid #e0e0e0',
                          fontSize: 15,
                          color: '#444',
                          background: '#fff',
                          outline: 'none',
                          fontWeight: 400,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Review Stars amount (Add number less than 5)
              </div>
              <input
                type='number'
                min='0'
                max='5'
                step='0.1'
                placeholder='Enter Number of Review Stars'
                value={reviewStars}
                onChange={e => setReviewStars(e.target.value)}
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 18,
                gap: 8,
              }}
            >
              <input
                id='highlight'
                type='checkbox'
                checked={highlight}
                onChange={e => setHighlight(e.target.checked)}
                style={{
                  marginRight: 8,
                  width: 18,
                  height: 18,
                  accentColor: '#2563eb',
                  background: '#ffffff',
                  border: '1.5px solid #bbb',
                  borderRadius: 4,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  position: 'relative',
                }}
              />
              <label
                htmlFor='highlight'
                style={{ color: '#222', userSelect: 'none', fontSize: 15 }}
              >
                Highlight this activity
              </label>
            </div>
            <div
              className='action-buttons-container'
              style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'flex-end',
                marginTop: 32,
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}
            >
              <button
                type='button'
                className='cancel-btn-ui'
                onClick={handleCancel}
                style={{
                  background: '#e5e7eb',
                  color: '#222',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: '120px',
                  flex: '0 0 auto',
                }}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='publish-btn-ui'
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: '120px',
                  flex: '0 0 auto',
                }}
              >
                Save and Publish
              </button>
            </div>
          </form>
        )}
        {tab === 'inside' && (
          <form
            onSubmit={handleSubmit}
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {/* Title */}
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Title
              </div>
              <input
                type='text'
                placeholder='Enter Title'
                value={insideTitle}
                onChange={e => setInsideTitle(e.target.value)}
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
            {/* Description (Rich Text Editor) */}
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Description
              </div>
              <div style={{ marginBottom: 8 }}>
                <ReactQuill
                  value={insideDescription}
                  onChange={setInsideDescription}
                  theme='snow'
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ color: [] }, { background: [] }],
                      [{ align: [] }],
                      ['clean'],
                    ],
                  }}
                  formats={[
                    'header',
                    'bold',
                    'italic',
                    'underline',
                    'color',
                    'background',
                    'align',
                  ]}
                  style={{
                    background: '#fff',
                    color: '#111',
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
            {/* Multiple Images for header or sliders */}
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Multiple Images for header or sliders
              </div>

              {/* Hidden file input */}
              <input
                ref={multipleFileInputRef}
                type='file'
                accept='image/*'
                multiple
                style={{ display: 'none' }}
                onChange={handleMultipleFileSelect}
              />

              <div style={{ marginBottom: 16 }}>
                <button
                  type='button'
                  disabled={isUploading}
                  onClick={triggerMultipleFileInput}
                  style={{
                    background: isUploading ? '#9ca3af' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontWeight: 500,
                    fontSize: 16,
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    opacity: isUploading ? 0.7 : 1,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {isUploading ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
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
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M17 8L12 3L7 8'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M12 3V15'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      Upload Images
                    </>
                  )}
                </button>

                {/* <div
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginTop: '4px',
                    marginBottom: '8px',
                  }}
                >
                  Images will be uploaded to Firebase and saved to MongoDB
                  automatically
                </div> */}

                {/* Debug button - only show in development */}
                {/* {process.env.NODE_ENV === 'development' && (
                  <button
                    type='button'
                    onClick={() => {
                      console.log('Debug: Current state:', {
                        insideImages,
                        activityInsideImages: activity?.insideImages,
                        imagesLoading,
                      });
                      if (
                        activity?.insideImages &&
                        activity.insideImages.length > 0
                      ) {
                        setInsideImages(activity.insideImages);
                        alert('Images refreshed from activity data');
                      } else {
                        alert('No images found in activity data');
                      }
                    }}
                    style={{
                      background: '#f59e0b',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginBottom: '8px',
                    }}
                  >
                    🔧 Debug: Refresh Images
                  </button>
                )} */}
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      width: '100%',
                      height: '4px',
                      background: '#e5e7eb',
                      borderRadius: '2px',
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

              {/* Multiple images with existing layout */}
              {imagesLoading ? (
                <div
                  style={{
                    marginTop: 24,
                    padding: '32px 24px',
                    border: '2px dashed #d1d5db',
                    borderRadius: 8,
                    background: '#f9fafb',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid #e5e7eb',
                      borderTop: '3px solid #2563eb',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}
                  >
                    Loading images...
                  </div>
                </div>
              ) : insideImages.length > 0 ? (
                <div style={{ marginTop: 24 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      color: '#444',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>Multiple Images ({insideImages.length} images)</span>
                    <div
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      Saved Successfully
                    </div>
                  </div>
                  {insideImages.map((image, index) => (
                    <div
                      key={`${image.url}-${index}`}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 16,
                        background: '#fff',
                        position: 'relative',
                      }}
                    >
                      {/* Image order indicator */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: '#2563eb',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          zIndex: 1,
                        }}
                      >
                        {index + 1}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 16,
                          alignItems: 'flex-start',
                        }}
                      >
                        {/* Image preview */}
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            background: 'transparent',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0,
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
                              borderRadius: '6px',
                            }}
                            onError={e => {
                              // Show placeholder if image fails to load
                              e.currentTarget.style.background = '#f3f4f6';
                              e.currentTarget.style.display = 'flex';
                              e.currentTarget.style.alignItems = 'center';
                              e.currentTarget.style.justifyContent = 'center';
                              e.currentTarget.style.color = '#9ca3af';
                              e.currentTarget.style.fontSize = '12px';
                              e.currentTarget.src = '';
                              e.currentTarget.alt = 'Image failed to load';
                            }}
                          />
                          <button
                            type='button'
                            onClick={() => removeImage(image.path, index)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: '#dc2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              zIndex: 2,
                            }}
                            title='Remove image'
                          >
                            ×
                          </button>
                        </div>

                        {/* Alt text and URL inputs - same layout as single image */}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: 12,
                              marginBottom: 8,
                              flexWrap: 'wrap',
                            }}
                          >
                            <div
                              style={{ flex: '1 1 300px', minWidth: '250px' }}
                            >
                              <div
                                style={{
                                  fontWeight: 400,
                                  color: '#444',
                                  marginBottom: 4,
                                }}
                              >
                                Alt text
                              </div>
                              <input
                                type='text'
                                placeholder='Enter Alt Text'
                                value={image.alt}
                                onChange={async e => {
                                  const updatedImages = insideImages.map(
                                    (img, i) =>
                                      i === index
                                        ? { ...img, alt: e.target.value }
                                        : img
                                  );
                                  setInsideImages(updatedImages);

                                  // Save the updated images to the database immediately
                                  try {
                                    const response =
                                      await authService.authenticatedRequest(
                                        `/api/activities/${activityId}`,
                                        {
                                          method: 'PUT',
                                          body: JSON.stringify({
                                            insideImages: updatedImages,
                                          }),
                                        }
                                      );

                                    const saveData = await response.json();

                                    if (!response.ok) {
                                      throw new Error(
                                        saveData.error ||
                                          'Failed to save alt text to database'
                                      );
                                    }

                                    console.log(
                                      'Alt text saved to database successfully'
                                    );
                                  } catch (error: any) {
                                    console.error(
                                      'Error saving alt text to database:',
                                      error
                                    );
                                    alert(
                                      `Alt text updated but failed to save to database: ${error.message}`
                                    );
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  borderRadius: 8,
                                  border: '1.5px solid #e0e0e0',
                                  fontSize: 15,
                                  color: '#444',
                                  background: '#fff',
                                  outline: 'none',
                                  fontWeight: 400,
                                }}
                              />
                            </div>
                            <div
                              style={{ flex: '1 1 300px', minWidth: '250px' }}
                            >
                              <div
                                style={{
                                  fontWeight: 400,
                                  color: '#444',
                                  marginBottom: 4,
                                }}
                              >
                                Image URL (Uploaded image or Existing image URL)
                              </div>
                              <input
                                type='text'
                                placeholder='Image URL'
                                value={image.url}
                                onChange={async e => {
                                  const updatedImages = insideImages.map(
                                    (img, i) =>
                                      i === index
                                        ? { ...img, url: e.target.value }
                                        : img
                                  );
                                  setInsideImages(updatedImages);

                                  // Save the updated images to the database immediately
                                  try {
                                    const response =
                                      await authService.authenticatedRequest(
                                        `/api/activities/${activityId}`,
                                        {
                                          method: 'PUT',
                                          body: JSON.stringify({
                                            insideImages: updatedImages,
                                          }),
                                        }
                                      );

                                    const saveData = await response.json();

                                    if (!response.ok) {
                                      throw new Error(
                                        saveData.error ||
                                          'Failed to save URL to database'
                                      );
                                    }

                                    console.log(
                                      'URL saved to database successfully'
                                    );
                                  } catch (error: any) {
                                    console.error(
                                      'Error saving URL to database:',
                                      error
                                    );
                                    alert(
                                      `URL updated but failed to save to database: ${error.message}`
                                    );
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  borderRadius: 8,
                                  border: '1.5px solid #e0e0e0',
                                  fontSize: 15,
                                  color: '#444',
                                  background: '#fff',
                                  outline: 'none',
                                  fontWeight: 400,
                                }}
                              />
                            </div>
                          </div>

                          {/* Image info */}
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              marginTop: '4px',
                            }}
                          >
                            <span>Path: {image.path}</span>
                            <span style={{ marginLeft: '12px' }}>
                              Order: {image.order}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 24,
                    padding: '32px 24px',
                    border: '2px dashed #d1d5db',
                    borderRadius: 8,
                    background: '#f9fafb',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '48px',
                      color: '#9ca3af',
                      marginBottom: '16px',
                    }}
                  >
                    📷
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#6b7280',
                      marginBottom: '8px',
                      fontWeight: '500',
                    }}
                  >
                    No images uploaded yet
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#9ca3af',
                    }}
                  >
                    Upload images to see them displayed here
                  </div>
                </div>
              )}
            </div>
            {/* Short Description (meta) */}
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Short Description (For meta description, Total characters less
                than 168)
              </div>
              <input
                type='text'
                placeholder='Enter Short Description'
                value={insideShortDescription}
                onChange={e => setInsideShortDescription(e.target.value)}
                maxLength={168}
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
            {/* Highlights */}
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Highlights
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    type='text'
                    placeholder='Enter a highlight point'
                    value={newHighlight}
                    onChange={e => setNewHighlight(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHighlight();
                      }
                    }}
                    style={{
                      flex: 1,
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
                  <button
                    type='button'
                    onClick={addHighlight}
                    disabled={!newHighlight.trim()}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 8,
                      border: 'none',
                      background: newHighlight.trim() ? '#2563eb' : '#9ca3af',
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 500,
                      cursor: newHighlight.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Add
                  </button>
                </div>

                {highlights.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div
                      style={{
                        fontWeight: 500,
                        color: '#444',
                        marginBottom: 8,
                      }}
                    >
                      Current Highlights ({highlights.length})
                    </div>
                    {highlights.map((highlight, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          marginBottom: 8,
                          background: '#f9fafb',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 500,
                              color: '#374151',
                              marginBottom: 4,
                            }}
                          >
                            Point {index + 1}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: 14 }}>
                            {highlight.point}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            type='button'
                            onClick={() => moveHighlightUp(index)}
                            disabled={index === 0}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 4,
                              border: '1px solid #d1d5db',
                              background: index === 0 ? '#f3f4f6' : '#fff',
                              color: index === 0 ? '#9ca3af' : '#374151',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              fontSize: 12,
                            }}
                          >
                            ↑
                          </button>
                          <button
                            type='button'
                            onClick={() => moveHighlightDown(index)}
                            disabled={index === highlights.length - 1}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 4,
                              border: '1px solid #d1d5db',
                              background:
                                index === highlights.length - 1
                                  ? '#f3f4f6'
                                  : '#fff',
                              color:
                                index === highlights.length - 1
                                  ? '#9ca3af'
                                  : '#374151',
                              cursor:
                                index === highlights.length - 1
                                  ? 'not-allowed'
                                  : 'pointer',
                              fontSize: 12,
                            }}
                          >
                            ↓
                          </button>
                          <button
                            type='button'
                            onClick={() => removeHighlight(index)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 4,
                              border: '1px solid #ef4444',
                              background: '#fff',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tab Title */}
            <div>
              <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
                Tab Title
              </div>
              <input
                type='text'
                placeholder='Enter Tab Title'
                value={insideTabTitle}
                onChange={e => setInsideTabTitle(e.target.value)}
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
            {/* Action Buttons */}
            <div
              className='action-buttons-container'
              style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'flex-end',
                marginTop: 32,
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}
            >
              <button
                type='button'
                className='cancel-btn-ui'
                onClick={handleCancel}
                style={{
                  background: '#e5e7eb',
                  color: '#222',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: '120px',
                  flex: '0 0 auto',
                }}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='publish-btn-ui'
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: '120px',
                  flex: '0 0 auto',
                }}
              >
                Save and Publish
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Alt Text Modal */}
      {showAltTextModal && selectedFiles && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <h3
                style={{
                  margin: 0,
                  color: '#1f2937',
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                Set Alt Text for Images
              </h3>
              <p
                style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: 14 }}
              >
                Enter alt text for each image to improve accessibility
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              {Array.from(selectedFiles).map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                    padding: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: '#f9fafb',
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      background: '#e5e7eb',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: '#6b7280',
                      flexShrink: 0,
                    }}
                  >
                    IMG
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#374151',
                        marginBottom: 4,
                      }}
                    >
                      {file.name}
                    </div>
                    <input
                      type='text'
                      value={altTexts[index] || ''}
                      onChange={e => {
                        const newAltTexts = [...altTexts];
                        newAltTexts[index] = e.target.value;
                        setAltTexts(newAltTexts);
                      }}
                      placeholder='Enter alt text for this image'
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}
            >
              <button
                type='button'
                onClick={cancelAltTextModal}
                style={{
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleAltTextModalSubmit}
                disabled={isUploading}
                style={{
                  background: isUploading ? '#9ca3af' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.7 : 1,
                }}
              >
                {isUploading ? 'Uploading...' : 'Upload Images'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
