'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/util/api-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { uploadFile, deleteFile } from '@/util/firebase-utils';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

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

// Import ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
  imageUrl?: string;
  imageAlt?: string;
  reviewStars?: number;
}

export default function EditDestination() {
  const router = useRouter();
  const params = useParams();
  const destinationId = params.id as string;
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    images: [''],
    to_do: '',
    Highlight: [''],
    call_tagline: '',
    background: '',
    location: '',
    mini_description: '',
    description: '',
    moredes: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'inside'>('main');
  const [imagePreview, setImagePreview] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [reviewStars, setReviewStars] = useState('');
  const [highlight, setHighlight] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multiple images for inside page tab
  const [multipleImages, setMultipleImages] = useState<string[]>(['']);
  const [multipleImageFiles, setMultipleImageFiles] = useState<File[]>([]);
  const [multipleImagePreviews, setMultipleImagePreviews] = useState<string[]>(
    []
  );
  const [multipleImageAlts, setMultipleImageAlts] = useState<string[]>(['']);
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  // Track removed images for cleanup
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  const fetchDestination = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!user) {
        showError('Authentication required');
        return;
      }

      console.log('Edit page - Fetching destination:', destinationId);
      console.log('Edit page - User context:', {
        userId: user.id,
        rootUserId: user.rootUserId,
        companyId: user.companyId,
        tenantId: user.tenantId,
      });

      const response = await apiRequest(`/api/destinations/${destinationId}`);
      const data = await response.json();

      console.log('Edit page - API response:', {
        status: response.status,
        data: data,
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch destination');
      }

      const destination: Destination = data.destination;

      // Populate form with existing data
      setFormData({
        id: destination.id || '',
        name: destination.name || '',
        images:
          destination.images && destination.images.length > 0
            ? destination.images
            : [''],
        to_do: destination.to_do || '',
        Highlight:
          destination.Highlight && destination.Highlight.length > 0
            ? destination.Highlight
            : [''],
        call_tagline: destination.call_tagline || '',
        background: destination.background || '',
        location: destination.location || '',
        mini_description: destination.mini_description || '',
        description: destination.description || '',
        moredes: destination.moredes || '',
      });

      // Set image and review fields
      if (destination.imageUrl) {
        setImageUrl(destination.imageUrl);
        setOriginalImageUrl(destination.imageUrl);
      }
      if (destination.imageAlt) {
        setImageAlt(destination.imageAlt);
      }
      if (destination.reviewStars !== undefined) {
        setReviewStars(destination.reviewStars.toString());
      }

      // Set multiple images for inside page tab
      if (destination.images && destination.images.length > 0) {
        setMultipleImages(destination.images);
        setMultipleImageAlts(Array(destination.images.length).fill(''));
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load destination');
    } finally {
      setIsLoading(false);
    }
  }, [destinationId, user, showError]);

  useEffect(() => {
    if (destinationId) {
      fetchDestination();
    }
  }, [destinationId, fetchDestination]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    // if (error) setError(''); // This line was removed as per the edit hint
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map(
        (item: any, i: number) => (i === index ? value : item)
      ),
    }));
    // Clear error when user starts typing
    // if (error) setError(''); // This line was removed as per the edit hint
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), ''],
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  // Enhanced image upload handler with Firebase storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      // setError('Please select a valid image file'); // This line was removed as per the edit hint
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      // setError('Image size must be less than 5MB'); // This line was removed as per the edit hint
      return;
    }

    try {
      setIsUploading(true);
      // setError(''); // This line was removed as per the edit hint

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Store the file for later upload
      setUploadedFile(file);

      // Clear the URL field since we're uploading a new file
      setImageUrl('');
    } catch (err: any) {
      // setError('Failed to process image: ' + err.message); // This line was removed as per the edit hint
    } finally {
      setIsUploading(false);
    }
  };

  // Clear uploaded file and reset image state
  const clearUploadedFile = () => {
    setUploadedFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Multiple image upload handlers
  const handleMultipleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        // setError('Please select only valid image files'); // This line was removed as per the edit hint
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // setError('Each image must be less than 5MB'); // This line was removed as per the edit hint
        return;
      }
    }

    try {
      setIsUploadingMultiple(true);
      // setError(''); // This line was removed as per the edit hint

      // Create previews for all files
      const previews: string[] = [];
      for (const file of files) {
        const reader = new FileReader();
        const preview = await new Promise<string>(resolve => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        previews.push(preview);
      }

      // Add new files and previews
      setMultipleImageFiles(prev => [...prev, ...files]);
      setMultipleImagePreviews(prev => [...prev, ...previews]);
      setMultipleImageAlts(prev => [...prev, ...Array(files.length).fill('')]);

      // Clear the file input
      if (multipleFileInputRef.current) {
        multipleFileInputRef.current.value = '';
      }
    } catch (err: any) {
      // setError('Failed to process images: ' + err.message); // This line was removed as per the edit hint
    } finally {
      setIsUploadingMultiple(false);
    }
  };

  const removeMultipleImage = (index: number) => {
    setMultipleImageFiles(prev => prev.filter((_, i) => i !== index));
    setMultipleImagePreviews(prev => prev.filter((_, i) => i !== index));
    setMultipleImageAlts(prev => prev.filter((_, i) => i !== index));
    setMultipleImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateMultipleImageAlt = (index: number, alt: string) => {
    setMultipleImageAlts(prev =>
      prev.map((item, i) => (i === index ? alt : item))
    );
  };

  const addMultipleImageUrl = () => {
    setMultipleImages(prev => [...prev, '']);
    setMultipleImageAlts(prev => [...prev, '']);
  };

  const updateMultipleImageUrl = (index: number, url: string) => {
    setMultipleImages(prev =>
      prev.map((item, i) => (i === index ? url : item))
    );
  };

  const removeMultipleImageUrl = (index: number) => {
    setMultipleImages(prev => prev.filter((_, i) => i !== index));
    setMultipleImageAlts(prev => prev.filter((_, i) => i !== index));
  };

  // Enhanced remove function that deletes from Firebase storage
  const removeMultipleImageWithCleanup = async (index: number) => {
    try {
      setIsRemovingImage(true);

      // If it's a file (newly uploaded), just remove from state
      if (index < multipleImageFiles.length) {
        removeMultipleImage(index);
        return;
      }

      // If it's an existing URL, delete from Firebase storage
      const imageIndex = index - multipleImageFiles.length;
      const imageUrl = multipleImages[imageIndex];

      if (imageUrl && imageUrl.trim() !== '') {
        // Track for cleanup
        setRemovedImages(prev => [...prev, imageUrl]);
        // Delete from Firebase storage
        await deleteImageFromFirebase(imageUrl);
      }

      // Remove from state
      setMultipleImages(prev => prev.filter((_, i) => i !== imageIndex));
      setMultipleImageAlts(prev => prev.filter((_, i) => i !== imageIndex));
    } catch (error) {
      console.error('Failed to remove image:', error);
      // setError('Failed to remove image. Please try again.'); // This line was removed as per the edit hint
    } finally {
      setIsRemovingImage(false);
    }
  };

  // Enhanced remove URL function that deletes from Firebase storage
  const removeMultipleImageUrlWithCleanup = async (index: number) => {
    try {
      setIsRemovingImage(true);

      const imageUrl = multipleImages[index];

      if (imageUrl && imageUrl.trim() !== '') {
        // Track for cleanup
        setRemovedImages(prev => [...prev, imageUrl]);
        // Delete from Firebase storage
        await deleteImageFromFirebase(imageUrl);
      }

      // Remove from state
      setMultipleImages(prev => prev.filter((_, i) => i !== index));
      setMultipleImageAlts(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Failed to remove image URL:', error);
      // setError('Failed to remove image. Please try again.'); // This line was removed as per the edit hint
    } finally {
      setIsRemovingImage(false);
    }
  };

  // Upload image to Firebase storage
  const uploadImageToFirebase = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `destinations/${destinationId}/${timestamp}_${file.name}`;

    const result = await uploadFile(file, fileName);

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload image');
    }

    if (!result.url) {
      throw new Error('Failed to get upload URL');
    }

    return result.url;
  };

  // Delete image from Firebase storage
  const deleteImageFromFirebase = async (imageUrl: string) => {
    try {
      // Extract file path from Firebase Storage URL
      const urlObj = new URL(imageUrl);
      if (urlObj.hostname.includes('firebasestorage.googleapis.com')) {
        // Extract the path from the URL
        const pathMatch = urlObj.pathname.match(/\/v0\/b\/[^\/]+\/o\/([^?]+)/);
        if (pathMatch) {
          const filePath = decodeURIComponent(pathMatch[1]);
          await deleteFile(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to delete old image:', error);
      // Don't throw error as this is not critical
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      // If we have a new uploaded file, upload it to Firebase
      if (uploadedFile) {
        setIsUploading(true);
        finalImageUrl = await uploadImageToFirebase(uploadedFile);
        setIsUploading(false);

        // Delete the old image if it exists and is different
        if (originalImageUrl && originalImageUrl !== finalImageUrl) {
          await deleteImageFromFirebase(originalImageUrl);
        }

        // Clear the uploaded file state after successful upload
        setUploadedFile(null);
      }

      // Handle multiple images for inside page tab
      let finalMultipleImages = [...multipleImages];
      if (multipleImageFiles.length > 0) {
        setIsUploadingMultiple(true);
        const uploadedUrls: string[] = [];

        for (const file of multipleImageFiles) {
          const url = await uploadImageToFirebase(file);
          uploadedUrls.push(url);
        }

        // Combine existing URLs with newly uploaded ones
        finalMultipleImages = [
          ...multipleImages.filter(url => url.trim() !== ''),
          ...uploadedUrls,
        ];
        setIsUploadingMultiple(false);

        // Clear the uploaded files
        setMultipleImageFiles([]);
        setMultipleImagePreviews([]);
      }

      // Clean the data before sending - include all fields from both tabs
      let cleanData: any = {
        id: formData.id,
        name: formData.name,
        to_do: formData.to_do,
        Highlight: formData.Highlight.filter(
          highlight => highlight.trim() !== ''
        ),
        call_tagline: formData.call_tagline,
        background: formData.background,
        location: formData.location,
        mini_description: formData.mini_description,
        description: formData.description,
        moredes: formData.moredes,
        // Include image data - always include these fields
        images: finalMultipleImages.filter(url => url.trim() !== ''),
        imageUrl: finalImageUrl || '',
        imageAlt: imageAlt || '',
        reviewStars: reviewStars ? Number(reviewStars) : 0,
      };

      console.log('Form data being sent:', cleanData);
      console.log('Image URL:', finalImageUrl);
      console.log('Image Alt:', imageAlt);
      console.log('Review Stars:', reviewStars);

      const response = await apiRequest(`/api/destinations/${destinationId}`, {
        method: 'PUT',
        body: cleanData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update destination');
      }

      console.log('API Response:', data);

      // Clean up any remaining removed images from Firebase storage
      if (removedImages.length > 0) {
        for (const imageUrl of removedImages) {
          try {
            await deleteImageFromFirebase(imageUrl);
          } catch (error) {
            console.error('Failed to cleanup removed image:', error);
          }
        }
        setRemovedImages([]); // Clear the tracking array
      }

      showSuccess('Destination updated successfully! Redirecting...');

      // Redirect to destinations list after 2 seconds
      setTimeout(() => {
        router.push('/admin/destinations');
      }, 2000);
    } catch (err: any) {
      console.error('Update error:', err);
      showError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save as draft functionality
  const handleSaveAsDraft = async () => {
    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      // If we have a new uploaded file, upload it to Firebase
      if (uploadedFile) {
        setIsUploading(true);
        finalImageUrl = await uploadImageToFirebase(uploadedFile);
        setIsUploading(false);

        // Delete the old image if it exists and is different
        if (originalImageUrl && originalImageUrl !== finalImageUrl) {
          await deleteImageFromFirebase(originalImageUrl);
        }

        // Clear the uploaded file state after successful upload
        setUploadedFile(null);
      }

      // Handle multiple images for inside page tab
      let finalMultipleImages = [...multipleImages];
      if (multipleImageFiles.length > 0) {
        setIsUploadingMultiple(true);
        const uploadedUrls: string[] = [];

        for (const file of multipleImageFiles) {
          const url = await uploadImageToFirebase(file);
          uploadedUrls.push(url);
        }

        // Combine existing URLs with newly uploaded ones
        finalMultipleImages = [
          ...multipleImages.filter(url => url.trim() !== ''),
          ...uploadedUrls,
        ];
        setIsUploadingMultiple(false);

        // Clear the uploaded files
        setMultipleImageFiles([]);
        setMultipleImagePreviews([]);
      }

      // Clean the data before sending - include all fields from both tabs
      let cleanData: any = {
        id: formData.id,
        name: formData.name,
        to_do: formData.to_do,
        Highlight: formData.Highlight.filter(
          highlight => highlight.trim() !== ''
        ),
        call_tagline: formData.call_tagline,
        background: formData.background,
        location: formData.location,
        mini_description: formData.mini_description,
        description: formData.description,
        moredes: formData.moredes,
        // Include image data - always include these fields
        images: finalMultipleImages.filter(url => url.trim() !== ''),
        imageUrl: finalImageUrl || '',
        imageAlt: imageAlt || '',
        reviewStars: reviewStars ? Number(reviewStars) : 0,
        published: false, // Draft destinations are not published
        isDraft: true, // Flag to indicate this is a draft save
      };

      console.log('Sending draft data:', cleanData);

      const response = await apiRequest(`/api/destinations/${destinationId}`, {
        method: 'PUT',
        body: cleanData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save destination as draft');
      }

      // Clean up any remaining removed images from Firebase storage
      if (removedImages.length > 0) {
        for (const imageUrl of removedImages) {
          try {
            await deleteImageFromFirebase(imageUrl);
          } catch (error) {
            console.error('Failed to cleanup removed image:', error);
          }
        }
        setRemovedImages([]); // Clear the tracking array
      }

      showSuccess('Destination saved as draft successfully!');
    } catch (err: any) {
      console.error('Save as draft error:', err);
      showError(err.message || 'Failed to save as draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/destinations');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className='edit-destination-page'>
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Loading destination details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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
            onClick={() => router.push('/admin/destinations')}
          >
            Destinations
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
              color: '#374151',
              fontWeight: '600',
              fontFamily: 'sans-serif',
            }}
          >
            {formData.name || 'Edit Destination'}
          </span>
        </div>
      </div>
      <div
        style={{
          background: '#f7f7f9',
          minHeight: '100vh',
          padding: '2rem 0',
          fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        }}
      >
        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid #e5e7eb',
            margin: '24px 0 32px 0',
            paddingLeft: 16,
            overflowX: 'auto',
            alignItems: 'center',
          }}
        >
          <button
            className={activeTab === 'main' ? 'active' : ''}
            onClick={() => setActiveTab('main')}
            type='button'
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: 8,
              background: activeTab === 'main' ? '#2563eb' : '#e5e7eb',
              color: activeTab === 'main' ? '#fff' : '#888',
              fontWeight: 500,
              fontSize: 15,
              cursor: 'pointer',
              outline: 'none',
              marginRight: 4,
              minWidth: 120,
              transition: 'background 0.2s',
            }}
          >
            Main Page Card
          </button>
          <button
            className={activeTab === 'inside' ? 'active' : ''}
            onClick={() => setActiveTab('inside')}
            type='button'
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: 8,
              background: activeTab === 'inside' ? '#2563eb' : '#e5e7eb',
              color: activeTab === 'inside' ? '#fff' : '#888',
              fontWeight: 500,
              fontSize: 15,
              cursor: 'pointer',
              outline: 'none',
              minWidth: 120,
              transition: 'background 0.2s',
            }}
          >
            Inside page
          </button>
        </div>

        {/* Main Page Card Tab */}
        {activeTab === 'main' && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              padding: '2rem',
              maxWidth: 1100,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {/* Success/Error Messages */}
            {/* These were removed as per the edit hint */}
            <form onSubmit={handleSubmit}>
              {/* Destination ID */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Destination ID
              </label>
              <input
                id='id'
                type='text'
                placeholder='Enter Destination ID (e.g., sigiriya)'
                value={formData.id}
                onChange={e => handleInputChange('id', e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                }}
              />

              {/* Title */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Title
              </label>
              <input
                id='title'
                type='text'
                placeholder='Enter Title'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                }}
              />

              {/* Location */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Location
              </label>
              <input
                id='location'
                type='text'
                placeholder='Enter Location'
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                }}
              />

              {/* Background */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Background
              </label>
              <input
                id='background'
                type='text'
                placeholder='Enter Background'
                value={formData.background}
                onChange={e => handleInputChange('background', e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                }}
              />

              {/* To Do Section */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                To Do Section Title
              </label>
              <input
                id='to_do'
                type='text'
                placeholder='Enter To Do Section Title'
                value={formData.to_do}
                onChange={e => handleInputChange('to_do', e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                }}
              />

              {/* Highlights */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Highlights
              </label>
              {formData.Highlight.map((highlight, index) => (
                <div
                  key={index}
                  style={{ display: 'flex', gap: 8, marginBottom: 8 }}
                >
                  <input
                    type='text'
                    placeholder={`Highlight ${index + 1}`}
                    value={highlight}
                    onChange={e =>
                      handleArrayChange('Highlight', index, e.target.value)
                    }
                    style={{
                      flex: 1,
                      padding: 10,
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 16,
                      color: '#111',
                      background: '#fafbfc',
                    }}
                  />
                  <button
                    type='button'
                    onClick={() => removeArrayItem('Highlight', index)}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 12px',
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type='button'
                onClick={() => addArrayItem('Highlight')}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontSize: 16,
                  cursor: 'pointer',
                  marginBottom: 18,
                }}
              >
                Add Highlight
              </button>

              {/* Description */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Description
              </label>
              <input
                id='description'
                type='text'
                placeholder='Enter Description'
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                }}
              />

              {/* Image Upload/URL Row */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Image (Upload image or enter image url)
              </label>
              <div
                className='image-upload-container'
                style={{ display: 'flex', gap: 24, marginBottom: 18 }}
              >
                {/* Upload Image Button and Alt Text */}
                <div
                  className='upload-section'
                  style={{ flex: 1, minWidth: 220 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <input
                      id='image-upload'
                      type='file'
                      accept='image/*'
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    <label
                      htmlFor='image-upload'
                      style={{
                        background: isUploading ? '#9ca3af' : '#e5e7eb',
                        color: isUploading ? '#6b7280' : '#2563eb',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 18px',
                        fontWeight: 500,
                        fontSize: 15,
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s',
                        display: 'inline-block',
                        opacity: isUploading ? 0.7 : 1,
                      }}
                    >
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                  </div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div
                      style={{
                        width: 70,
                        height: 70,
                        background: '#e5e7eb',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 15,
                        color: '#888',
                        marginRight: 8,
                        position: 'relative',
                      }}
                    >
                      {imagePreview || imageUrl ? (
                        <>
                          <img
                            src={imagePreview || imageUrl}
                            alt={imageAlt || 'Image'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 6,
                            }}
                          />
                          {uploadedFile && (
                            <div
                              style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                background: '#10b981',
                                color: '#fff',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 'bold',
                              }}
                              title='New image selected for upload'
                            >
                              ✓
                            </div>
                          )}
                        </>
                      ) : (
                        'Image'
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: 4,
                          color: '#222',
                          fontSize: 14,
                        }}
                      >
                        Alt text
                      </label>
                      <input
                        type='text'
                        value={imageAlt}
                        onChange={e => setImageAlt(e.target.value)}
                        placeholder='Enter Alt Text'
                        style={{
                          width: '100%',
                          padding: 8,
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          fontSize: 15,
                          color: '#111',
                          background: '#fafbfc',
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Image URL */}
                <div className='url-section' style={{ flex: 2, minWidth: 320 }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 4,
                      color: '#222',
                      fontSize: 14,
                    }}
                  >
                    Image URL (Uploaded image or Existing image URL)
                  </label>
                  <input
                    type='text'
                    value={imageUrl}
                    onChange={e => {
                      setImageUrl(e.target.value);
                      setImagePreview('');
                      // Clear uploaded file when user manually enters URL
                      if (uploadedFile) {
                        setUploadedFile(null);
                      }
                    }}
                    placeholder='Image URL'
                    style={{
                      width: '100%',
                      padding: 8,
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 15,
                      color: '#111',
                      background: '#fafbfc',
                    }}
                  />
                </div>
              </div>

              {/* Review Stars */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Review Stars amount (Add number less than 5)
              </label>
              <input
                id='reviewStars'
                type='number'
                min='0'
                max='5'
                placeholder='Enter Number of Review Stars'
                value={reviewStars}
                onChange={e => setReviewStars(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                }}
              />

              {/* Highlight Checkbox - Only show on mobile */}
              {isMobile && (
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
                      background: '#fff',
                      border: '1.5px solid #bbb',
                      borderRadius: 4,
                    }}
                  />
                  <label
                    htmlFor='highlight'
                    style={{ color: '#222', userSelect: 'none', fontSize: 15 }}
                  >
                    Highlight this destination
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div
                className='action-buttons-container'
                style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'flex-start',
                  marginTop: 32,
                }}
              >
                <button
                  type='submit'
                  className='publish-btn-ui'
                  disabled={isSubmitting}
                  style={{
                    background: isSubmitting ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'sans-serif',
                    opacity: isSubmitting ? 0.6 : 1,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isSubmitting) {
                      e.currentTarget.style.background = '#1d4ed8';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSubmitting) {
                      e.currentTarget.style.background = isSubmitting
                        ? '#9ca3af'
                        : '#2563eb';
                    }
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save and Publish'}
                </button>
                <button
                  type='button'
                  className='draft-btn-ui'
                  style={{
                    background: 'white',
                    color: '#2563eb',
                    border: '1px solid #d1d5db',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'sans-serif',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={handleSaveAsDraft}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  Save as draft
                </button>
                <button
                  type='button'
                  className='cancel-btn-ui'
                  style={{
                    background: 'white',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'sans-serif',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={handleCancel}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Inside Page Tab */}
        {activeTab === 'inside' && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              padding: '2rem',
              maxWidth: 1100,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {/* Success/Error Messages */}
            {/* These were removed as per the edit hint */}
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Title
              </label>
              <input
                id='inside-title'
                type='text'
                placeholder='Enter Title'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                }}
              />

              {/* Description (Rich Text Editor) */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Description
              </label>
              <div style={{ marginBottom: 18 }}>
                <ReactQuill
                  value={formData.description}
                  onChange={value => handleInputChange('description', value)}
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

              {/* More Description */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                More Description
              </label>
              <textarea
                id='moredes'
                placeholder='Enter additional description'
                value={formData.moredes}
                onChange={e => handleInputChange('moredes', e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                  minHeight: 100,
                  resize: 'vertical',
                }}
              />

              {/* Images for header or sliders */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Images for header or sliders
              </label>

              {/* Multiple Image Upload Section */}
              <div style={{ marginBottom: 24 }}>
                {/* Upload Button */}
                <div style={{ marginBottom: 16 }}>
                  <input
                    id='multiple-image-upload'
                    type='file'
                    accept='image/*'
                    multiple
                    style={{ display: 'none' }}
                    ref={multipleFileInputRef}
                    onChange={handleMultipleImageUpload}
                  />
                  <label
                    htmlFor='multiple-image-upload'
                    style={{
                      background: isUploadingMultiple ? '#9ca3af' : '#e5e7eb',
                      color: isUploadingMultiple ? '#6b7280' : '#2563eb',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 18px',
                      fontWeight: 500,
                      fontSize: 15,
                      cursor: isUploadingMultiple ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                      display: 'inline-block',
                      opacity: isUploadingMultiple ? 0.7 : 1,
                    }}
                  >
                    {isUploadingMultiple
                      ? 'Uploading...'
                      : 'Upload Multiple Images'}
                  </label>
                  <span style={{ marginLeft: 12, fontSize: 14, color: '#666' }}>
                    Select multiple images for header or sliders
                  </span>
                </div>

                {/* Uploaded Images Preview */}
                {multipleImageFiles.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4
                      style={{ fontSize: 14, color: '#222', marginBottom: 8 }}
                    >
                      New Images to Upload:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {multipleImageFiles.map((file, index) => (
                        <div
                          key={`file-${index}`}
                          style={{
                            position: 'relative',
                            width: 100,
                            height: 100,
                            borderRadius: 8,
                            overflow: 'hidden',
                            border: '2px solid #10b981',
                          }}
                        >
                          <img
                            src={multipleImagePreviews[index]}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <button
                            type='button'
                            onClick={() => removeMultipleImage(index)}
                            disabled={isRemovingImage}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: isRemovingImage
                                ? '#9ca3af'
                                : '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              fontSize: 12,
                              cursor: isRemovingImage
                                ? 'not-allowed'
                                : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: isRemovingImage ? 0.7 : 1,
                            }}
                          >
                            {isRemovingImage ? '...' : '×'}
                          </button>
                          <input
                            type='text'
                            value={multipleImageAlts[index] || ''}
                            onChange={e =>
                              updateMultipleImageAlt(index, e.target.value)
                            }
                            placeholder='Alt text'
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              border: 'none',
                              padding: '4px 8px',
                              fontSize: 12,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Images */}
                {multipleImages.length > 0 &&
                  multipleImages.some(url => url.trim() !== '') && (
                    <div style={{ marginBottom: 16 }}>
                      <h4
                        style={{ fontSize: 14, color: '#222', marginBottom: 8 }}
                      >
                        Existing Images:
                      </h4>
                      <div
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}
                      >
                        {multipleImages.map(
                          (url, index) =>
                            url.trim() !== '' && (
                              <div
                                key={`url-${index}`}
                                style={{
                                  position: 'relative',
                                  width: 100,
                                  height: 100,
                                  borderRadius: 8,
                                  overflow: 'hidden',
                                  border: '2px solid #e5e7eb',
                                }}
                              >
                                <img
                                  src={url}
                                  alt={`Image ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                                <button
                                  type='button'
                                  onClick={() =>
                                    removeMultipleImageUrlWithCleanup(index)
                                  }
                                  disabled={isRemovingImage}
                                  style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    background: isRemovingImage
                                      ? '#9ca3af'
                                      : '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 24,
                                    height: 24,
                                    fontSize: 12,
                                    cursor: isRemovingImage
                                      ? 'not-allowed'
                                      : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: isRemovingImage ? 0.7 : 1,
                                  }}
                                >
                                  {isRemovingImage ? '...' : '×'}
                                </button>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  )}

                {/* Add Image URL Button */}
                <button
                  type='button'
                  onClick={addMultipleImageUrl}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontSize: 14,
                    cursor: 'pointer',
                    marginBottom: 16,
                  }}
                >
                  + Add Image URL
                </button>

                {/* Image URL Inputs */}
                {multipleImages.map((url, index) => (
                  <div
                    key={`url-input-${index}`}
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginBottom: 12,
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type='text'
                      value={url}
                      onChange={e =>
                        updateMultipleImageUrl(index, e.target.value)
                      }
                      placeholder='Image URL'
                      style={{
                        flex: 1,
                        padding: 8,
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 15,
                        color: '#111',
                        background: '#fafbfc',
                      }}
                    />
                    <input
                      type='text'
                      value={multipleImageAlts[index] || ''}
                      onChange={e =>
                        updateMultipleImageAlt(index, e.target.value)
                      }
                      placeholder='Alt text'
                      style={{
                        width: 150,
                        padding: 8,
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 15,
                        color: '#111',
                        background: '#fafbfc',
                      }}
                    />
                    <button
                      type='button'
                      onClick={() => removeMultipleImageUrlWithCleanup(index)}
                      disabled={isRemovingImage}
                      style={{
                        background: isRemovingImage ? '#9ca3af' : '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 12px',
                        fontSize: 14,
                        cursor: isRemovingImage ? 'not-allowed' : 'pointer',
                        opacity: isRemovingImage ? 0.7 : 1,
                      }}
                    >
                      {isRemovingImage ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Short Description (meta) */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Short Description (For meta description, Total characters less
                than 168)
              </label>
              <input
                id='inside-short-description'
                type='text'
                maxLength={168}
                placeholder='Enter Short Description'
                value={formData.mini_description}
                onChange={e =>
                  handleInputChange('mini_description', e.target.value)
                }
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                }}
              />

              {/* Tab Title */}
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  color: '#222',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Tab Title
              </label>
              <input
                id='inside-tab-title'
                type='text'
                placeholder='Enter Tab Title'
                value={formData.call_tagline}
                onChange={e =>
                  handleInputChange('call_tagline', e.target.value)
                }
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 18,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  color: '#111',
                  background: '#fafbfc',
                }}
              />

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'flex-start',
                  marginTop: 32,
                }}
              >
                <button
                  type='submit'
                  className='publish-btn-ui'
                  disabled={isSubmitting || isUploading || isUploadingMultiple}
                  style={{
                    background:
                      isSubmitting || isUploading || isUploadingMultiple
                        ? '#9ca3af'
                        : '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor:
                      isSubmitting || isUploading || isUploadingMultiple
                        ? 'not-allowed'
                        : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'sans-serif',
                    opacity:
                      isSubmitting || isUploading || isUploadingMultiple
                        ? 0.6
                        : 1,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isSubmitting && !isUploading && !isUploadingMultiple) {
                      e.currentTarget.style.background = '#1d4ed8';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSubmitting && !isUploading && !isUploadingMultiple) {
                      e.currentTarget.style.background = '#2563eb';
                    }
                  }}
                >
                  {isUploadingMultiple
                    ? 'Uploading Images...'
                    : isUploading
                      ? 'Uploading...'
                      : isSubmitting
                        ? 'Saving...'
                        : 'Save and Publish'}
                </button>
                <button
                  type='button'
                  className='draft-btn-ui'
                  style={{
                    background: 'white',
                    color: '#2563eb',
                    border: '1px solid #d1d5db',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'sans-serif',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={handleSaveAsDraft}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  Save as draft
                </button>
                <button
                  type='button'
                  className='cancel-btn-ui'
                  style={{
                    background: 'white',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'sans-serif',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={handleCancel}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <style jsx global>{`
        .ql-editor {
          min-height: 200px;
          font-family: 'Inter, Segoe UI, Arial, sans-serif';
          font-size: 16px;
          line-height: 1.6;
          color: #111;
        }
        .ql-toolbar {
          border: 1px solid #e5e7eb;
          border-radius: 8 8 0 0;
          background: #fafbfc;
        }
        .ql-container {
          border: 1px solid #e5e7eb;
          border-radius: 0 0 8 8;
          background: #fff;
        }
        .ql-editor em,
        .ql-editor i {
          font-style: italic !important;
        }

        /* Mobile responsive styles for image upload container */
        @media (max-width: 768px) {
          .image-upload-container {
            flex-direction: column !important;
            gap: 16px !important;
          }

          .upload-section,
          .url-section {
            flex: none !important;
            min-width: auto !important;
            width: 100% !important;
          }

          /* Mobile responsive styles for action buttons */
          .action-buttons-container {
            flex-direction: column !important;
            gap: 12px !important;
            justify-content: stretch !important;
          }

          .action-buttons-container button {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        /* Checkbox styling */
        input[type='checkbox'] {
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          width: 18px !important;
          height: 18px !important;
          border: 1.5px solid #bbb !important;
          border-radius: 4px !important;
          background: #fff !important;
          cursor: pointer !important;
          position: relative !important;
        }

        input[type='checkbox']:checked {
          background: #2563eb !important;
          border-color: #2563eb !important;
        }

        input[type='checkbox']:checked::after {
          content: '✓' !important;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: bold !important;
        }
      `}</style>
    </AdminLayout>
  );
}
