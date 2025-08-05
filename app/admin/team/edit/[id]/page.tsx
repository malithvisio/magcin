'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/util/api-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

function TextField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
}: any) {
  return (
    <div style={{ flex: 1, minWidth: 250 }}>
      <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
        {label}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
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
  );
}

function ImageUploadField({
  altText,
  setAltText,
  imageUrl,
  setImageUrl,
  showSuccess,
  showError,
}: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
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

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'main');
      formData.append('activityId', 'team'); // Using 'team' as the activityId for team images
      if (imageUrl) {
        formData.append('oldImageUrl', imageUrl);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload to Firebase with authentication headers
      const response = await fetch('/api/upload', {
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
        setImageUrl(result.url);
        // Set alt text if not already set
        if (!altText.trim()) {
          setAltText(file.name.replace(/\.[^/.]+$/, '')); // Remove file extension
        }
        showSuccess('Image uploaded successfully!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      showError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 500, color: '#444', marginBottom: 6 }}>
        Image (Upload image or enter image url)
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/jpg,image/png,image/webp'
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        type='button'
        onClick={handleUploadClick}
        disabled={uploading}
        style={{
          background: uploading ? '#9ca3af' : '#e5e7eb',
          color: uploading ? '#6b7280' : '#2563eb',
          border: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 500,
          fontSize: 16,
          cursor: uploading ? 'not-allowed' : 'pointer',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {uploading ? (
          <>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            Uploading... ({uploadProgress}%)
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
                d='M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 20.5 19 20.5H5C4.46957 20.5 3.96086 20.2893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15'
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
            Upload Image
          </>
        )}
      </button>

      {/* Upload progress bar */}
      {uploading && (
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
                borderRadius: '2px',
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
            border: imageUrl ? '1px solid #e0e0e0' : 'none',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={altText || 'Team member image'}
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
            className='image-upload-flex'
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
              <div style={{ fontWeight: 400, color: '#444', marginBottom: 4 }}>
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
              <div style={{ fontWeight: 400, color: '#444', marginBottom: 4 }}>
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
  );
}

export default function EditTeamMemberPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [teamMemberName, setTeamMemberName] = useState('');

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [email, setEmail] = useState('');
  const [altText, setAltText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  // New fields
  const [shortIntro, setShortIntro] = useState('');
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [linktree, setLinktree] = useState('');

  // Fetch team member data on component mount
  useEffect(() => {
    const fetchTeamMember = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(`/api/team/${params.id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch team member');
        }

        const data = await response.json();
        const teamMember = data.teamMember;

        // Set team member name for breadcrumb
        setTeamMemberName(teamMember.name || '');

        // Populate form fields with existing data
        setName(teamMember.name || '');
        setPosition(teamMember.position || '');
        setImageUrl(teamMember.image || '');
        setShortIntro(teamMember.bio || '');

        // Set other fields if they exist in the database
        setPhone1(teamMember.phone1 || '');
        setPhone2(teamMember.phone2 || '');
        setEmail(teamMember.email || '');
        setAltText(teamMember.altText || '');
        setFacebook(teamMember.facebook || '');
        setLinkedin(teamMember.linkedin || '');
        setInstagram(teamMember.instagram || '');
        setTiktok(teamMember.tiktok || '');
        setLinktree(teamMember.linktree || '');
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching team member:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTeamMember();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation
    if (!name.trim()) {
      showError('Please enter the team member name');
      return;
    }

    if (!position.trim()) {
      showError('Please enter the team member position');
      return;
    }

    // Email validation if provided
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showError('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data for database save
      const updateData = {
        name: name.trim(),
        position: position.trim(),
        image: imageUrl.trim() || '',
        bio: shortIntro.trim() || '',
        phone1: phone1.trim() || '',
        phone2: phone2.trim() || '',
        email: email.trim() || '',
        altText: altText.trim() || '',
        facebook: facebook.trim() || '',
        linkedin: linkedin.trim() || '',
        instagram: instagram.trim() || '',
        tiktok: tiktok.trim() || '',
        linktree: linktree.trim() || '',
        published: true, // Ensure the team member is published
        updatedAt: new Date().toISOString(), // Add timestamp
      };

      console.log('Saving team member data to database:', updateData);

      const response = await apiRequest(`/api/team/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to update team member in database'
        );
      }

      console.log('Team member saved successfully:', data);
      showSuccess('Team member data saved successfully to database!');
      router.push('/admin/team');
    } catch (err: any) {
      console.error('Error saving team member data:', err);
      showError(`Error saving team member data: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/team');
  };

  if (loading) {
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
              <a
                href='/admin'
                style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontFamily: 'sans-serif',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                Admin
              </a>

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
                  fontWeight: '600',
                  fontFamily: 'sans-serif',
                }}
              >
                Team
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
                Edit Team Member
              </span>
            </div>
          </div>
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
                Loading team member details...
              </div>
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
              <a
                href='/admin'
                style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontFamily: 'sans-serif',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                Admin
              </a>

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
                  fontWeight: '600',
                  fontFamily: 'sans-serif',
                }}
              >
                Team
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
                Edit Team Member
              </span>
            </div>
          </div>
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
            Error: {error}
          </div>
          <button
            onClick={() => router.push('/admin/team')}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            Back to Team Members
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style jsx>{`
        @media (max-width: 768px) {
          .responsive-row {
            flex-direction: column !important;
            gap: 0 !important;
          }
          .responsive-row > div {
            width: 100% !important;
            min-width: 0 !important;
            margin-bottom: 16px;
          }
          .image-upload-flex {
            flex-direction: column !important;
            gap: 0 !important;
          }
          .image-upload-flex > div {
            width: 100% !important;
            min-width: 0 !important;
            margin-bottom: 12px;
          }
          .action-buttons-container {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .action-buttons-container button {
            width: 100% !important;
            margin-bottom: 4px;
          }
          .action-buttons-container button:last-child {
            margin-bottom: 0;
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
            {/* <a
              href='/admin'
              style={{
                color: '#6b7280',
                textDecoration: 'none',
                fontFamily: 'sans-serif',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              Admfgin
            </a> */}

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
                fontWeight: '600',
                fontFamily: 'sans-serif',
              }}
            >
              Team
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
              {teamMemberName || 'Edit Team Member'}
            </span>
          </div>
        </div>
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
          {/* Name and Position */}
          <div className='responsive-row' style={{ display: 'flex', gap: 24 }}>
            <TextField
              label='Name'
              placeholder='Enter Name'
              value={name}
              onChange={setName}
            />
            <TextField
              label='Position'
              placeholder='Enter Position'
              value={position}
              onChange={setPosition}
            />
          </div>
          {/* Phone Numbers */}
          <div className='responsive-row' style={{ display: 'flex', gap: 24 }}>
            <TextField
              label='Phone Number 1'
              placeholder='Enter Phone Number'
              value={phone1}
              onChange={setPhone1}
            />
            <TextField
              label='Phone Number 2'
              placeholder='Enter Phone Number'
              value={phone2}
              onChange={setPhone2}
            />
          </div>
          <TextField
            label='Email Address'
            placeholder='Enter Email Address'
            value={email}
            onChange={setEmail}
            type='email'
          />
          {/* Image Upload Section */}
          <ImageUploadField
            altText={altText}
            setAltText={setAltText}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            showSuccess={showSuccess}
            showError={showError}
          />

          {/* Short Introduction */}
          <div>
            <div style={{ fontWeight: 500, color: '#222', marginBottom: 6 }}>
              Short Introduction
            </div>
            <textarea
              placeholder='Enter Short Introduction'
              value={shortIntro}
              onChange={e => setShortIntro(e.target.value)}
              style={{
                width: '100%',
                minHeight: 48,
                padding: '12px 14px',
                borderRadius: 8,
                border: '1.5px solid #e0e0e0',
                fontSize: 16,
                color: '#444',
                background: '#fff',
                outline: 'none',
                fontWeight: 400,
                resize: 'none',
              }}
            />
          </div>

          {/* Profile Links */}
          <div>
            <div style={{ fontWeight: 500, color: '#222', marginBottom: 6 }}>
              Profile Links
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type='text'
                placeholder='Enter Facebook Profile Link'
                value={facebook}
                onChange={e => setFacebook(e.target.value)}
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
              <input
                type='text'
                placeholder='Enter Linkedin Profile Link'
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
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
              <input
                type='text'
                placeholder='Enter Instagram Profile Link'
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
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
              <input
                type='text'
                placeholder='Enter Tiktok Profile Link'
                value={tiktok}
                onChange={e => setTiktok(e.target.value)}
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
              <input
                type='text'
                placeholder='Enter LinkTree Profile Link'
                value={linktree}
                onChange={e => setLinktree(e.target.value)}
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
              onClick={handleCancel}
              style={{
                background: '#e5e7eb',
                color: '#2563eb',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontWeight: 500,
                fontSize: 16,
                cursor: 'pointer',
                minWidth: '100px',
              }}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={submitting}
              style={{
                background: submitting ? '#9ca3af' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontWeight: 500,
                fontSize: 16,
                cursor: submitting ? 'not-allowed' : 'pointer',
                minWidth: '150px',
              }}
            >
              {submitting ? 'Saving to Database...' : 'Save to Database'}
            </button>
          </div>
        </form>

        {/* Success Message */}
        {submitting && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              textAlign: 'center',
              minWidth: '300px',
            }}
          >
            <div
              style={{
                marginBottom: '12px',
                fontSize: '18px',
                fontWeight: '500',
              }}
            >
              Saving Team Member Data...
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Please wait while we save the data to the database.
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
