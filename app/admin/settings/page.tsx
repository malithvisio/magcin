'use client';
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/util/api-utils';
import { uploadFile, deleteFile } from '@/util/firebase-utils';
import { useToast } from '@/contexts/ToastContext';

const initialWebsite = { type: '', url: '' };

export default function AdminSettings() {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({
    currencyType: '',
    logoImage: '',
    logoImagePath: '', // Store the file path for easy deletion
    faviconIcon: '',
    companyName: '',
    companyDescription: '',
    homePageTabTitle: '',
    phoneNumber: '',
    whatsappNumber: '',
    emailAddress: '',
    hotlineAssistantName: '',
    websites: [{ ...initialWebsite }],
  });
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to extract file path from Firebase Storage URL
  const extractFilePathFromURL = (url: string): string | null => {
    try {
      // Firebase Storage URLs have this pattern:
      // https://firebasestorage.googleapis.com/v0/b/PROJECT_ID/o/PATH%2FTO%2FFILE?alt=media&token=...
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('firebasestorage.googleapis.com')) {
        // Extract the path from the 'o' parameter
        const pathParam = urlObj.searchParams.get('o');
        if (pathParam) {
          // Decode the URL-encoded path
          const decodedPath = decodeURIComponent(pathParam);
          console.log('Extracted file path:', decodedPath);
          return decodedPath;
        }

        // Alternative: try to extract from the pathname
        const pathname = urlObj.pathname;
        const pathMatch = pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+)/);
        if (pathMatch) {
          const decodedPath = decodeURIComponent(pathMatch[1]);
          console.log('Extracted file path from pathname:', decodedPath);
          return decodedPath;
        }
      }
      console.log('Could not extract file path from URL:', url);
      return null;
    } catch (error) {
      console.error('Error extracting file path from URL:', error);
      return null;
    }
  };

  const websiteOptions = [
    { value: '', label: 'Choose Website' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'custom', label: 'Custom' },
  ];

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleWebsiteChange = (idx: number, key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      websites: prev.websites.map((w, i) =>
        i === idx ? { ...w, [key]: value } : w
      ),
    }));
  };

  const handleAddWebsite = () => {
    setForm(prev => ({
      ...prev,
      websites: [...prev.websites, { ...initialWebsite }],
    }));
  };

  const handleRemoveWebsite = (idx: number) => {
    setForm(prev => ({
      ...prev,
      websites:
        prev.websites.length === 1
          ? prev.websites
          : prev.websites.filter((_, i) => i !== idx),
    }));
  };

  // Handle logo file upload
  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      showError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showError('File size must be less than 5MB');
      return;
    }

    setUploadingLogo(true);

    try {
      // Delete old logo if it exists
      if (form.logoImagePath) {
        console.log('Deleting old logo at path:', form.logoImagePath);
        try {
          const deleteResult = await deleteFile(form.logoImagePath);
          if (deleteResult.success) {
            console.log('Old logo deleted successfully');
          } else {
            console.warn('Failed to delete old logo:', deleteResult.error);
          }
        } catch (deleteError) {
          console.warn('Failed to delete old logo:', deleteError);
          // Continue with upload even if deletion fails
        }
      } else if (form.logoImage) {
        // Fallback: try to extract path from URL
        console.log('Current logo URL:', form.logoImage);
        const oldFilePath = extractFilePathFromURL(form.logoImage);
        if (oldFilePath) {
          try {
            console.log('Attempting to delete old logo at path:', oldFilePath);
            const deleteResult = await deleteFile(oldFilePath);
            if (deleteResult.success) {
              console.log('Old logo deleted successfully');
            } else {
              console.warn('Failed to delete old logo:', deleteResult.error);
            }
          } catch (deleteError) {
            console.warn('Failed to delete old logo:', deleteError);
            // Continue with upload even if deletion fails
          }
        } else {
          console.log('Could not extract file path from current logo URL');
        }
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `logos/logo_${timestamp}.${fileExtension}`;

      // Upload to Firebase Storage
      const result = await uploadFile(file, fileName);

      if (result.success) {
        setForm(prev => ({
          ...prev,
          logoImage: result.url || '',
          logoImagePath: fileName, // Store the file path for future deletion
        }));

        showSuccess(
          'Logo uploaded successfully! Previous logo has been replaced.'
        );
      } else {
        showError(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      showError('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle logo removal
  const handleRemoveLogo = async () => {
    if (!form.logoImage) return;

    setRemovingLogo(true);

    try {
      // Use stored path if available, otherwise extract from URL
      const filePath =
        form.logoImagePath || extractFilePathFromURL(form.logoImage);
      if (filePath) {
        const deleteResult = await deleteFile(filePath);
        if (deleteResult.success) {
          console.log('Logo deleted from storage successfully');
        } else {
          console.warn(
            'Failed to delete logo from storage:',
            deleteResult.error
          );
        }
      }

      setForm(prev => ({ ...prev, logoImage: '', logoImagePath: '' }));
      showSuccess('Logo removed successfully!');
    } catch (error) {
      console.error('Error removing logo:', error);
      showError('Failed to remove logo. Please try again.');
    } finally {
      setRemovingLogo(false);
    }
  };

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiRequest('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setForm({
            currencyType: data.currencyType || '',
            logoImage: data.logoImage || '',
            logoImagePath: data.logoImagePath || '',
            faviconIcon: data.faviconIcon || '',
            companyName: data.companyName || '',
            companyDescription: data.companyDescription || '',
            homePageTabTitle: data.homePageTabTitle || '',
            phoneNumber: data.phoneNumber || '',
            whatsappNumber: data.whatsappNumber || '',
            emailAddress: data.emailAddress || '',
            hotlineAssistantName: data.hotlineAssistantName || '',
            websites:
              data.websites && data.websites.length > 0
                ? data.websites
                : [{ ...initialWebsite }],
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty website entries
      const filteredWebsites = form.websites.filter(
        website => website.type && website.url
      );

      const response = await apiRequest('/api/settings', {
        method: 'POST',
        body: {
          ...form,
          websites: filteredWebsites,
        },
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Settings saved successfully!');
        // Update form with the saved data
        setForm(prev => ({
          ...prev,
          websites:
            filteredWebsites.length > 0
              ? filteredWebsites
              : [{ ...initialWebsite }],
        }));
      } else {
        showError(data.error || 'Failed to save settings');
      }
    } catch (error) {
      showError('An error occurred while saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className='settings-form-wrapper'>
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
              fontSize: '14px',
            }}
          >
            Settings
          </span>
        </div>
        <form
          className='settings-form'
          autoComplete='off'
          onSubmit={handleSubmit}
        >
          {/* New fields at the top */}

          <div className='form-group'>
            <label>Company Name</label>
            <input
              type='text'
              placeholder='Enter Company Name'
              value={form.companyName}
              onChange={e => handleChange('companyName', e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label>Company Description</label>
            <textarea
              placeholder='Enter Company Description'
              value={form.companyDescription}
              onChange={e => handleChange('companyDescription', e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label>Home Page Tab Title</label>
            <input
              type='text'
              placeholder='Enter Home Page Tab Title'
              value={form.homePageTabTitle}
              onChange={e => handleChange('homePageTabTitle', e.target.value)}
            />
          </div>
          <div className='form-row'>
            <div className='form-group half'>
              <label>Phone Number</label>
              <input
                type='text'
                placeholder='Enter Phone Number'
                value={form.phoneNumber}
                onChange={e => handleChange('phoneNumber', e.target.value)}
              />
            </div>
            <div className='form-group half'>
              <label>Whatsapp Number</label>
              <input
                type='text'
                placeholder='Enter Whatsapp Number'
                value={form.whatsappNumber}
                onChange={e => handleChange('whatsappNumber', e.target.value)}
              />
            </div>
          </div>
          <div className='form-row'>
            <div className='form-group half'>
              <label>Email Address</label>
              <input
                type='email'
                placeholder='Enter Email Address'
                value={form.emailAddress}
                onChange={e => handleChange('emailAddress', e.target.value)}
              />
            </div>
            <div className='form-group half'>
              <label>Hotline Assistant Name</label>
              <input
                type='text'
                placeholder='Enter Hotline Assistant Name'
                value={form.hotlineAssistantName}
                onChange={e =>
                  handleChange('hotlineAssistantName', e.target.value)
                }
              />
            </div>
          </div>
          <div className='profile-urls-label'>Profile URLs</div>
          <hr className='divider' />
          {form.websites.map((website, idx) => (
            <div className='form-row website-row' key={idx}>
              <div className='form-group half'>
                <label className='sr-only'>Choose website</label>
                <select
                  value={website.type}
                  onChange={e =>
                    handleWebsiteChange(idx, 'type', e.target.value)
                  }
                >
                  {websiteOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='form-group half website-url-group-flex'>
                <label className='sr-only'>Website URL</label>
                <div className='website-url-flex'>
                  <input
                    type='text'
                    placeholder='Enter Website URL'
                    value={website.url}
                    onChange={e =>
                      handleWebsiteChange(idx, 'url', e.target.value)
                    }
                  />
                  {form.websites.length > 1 && (
                    <button
                      type='button'
                      className='remove-website-btn'
                      title='Remove this website'
                      onClick={() => handleRemoveWebsite(idx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type='button'
            className='add-website-btn'
            onClick={handleAddWebsite}
          >
            Add Another Website
          </button>
          <div className='form-group'>
            <label>Select currency type displaying in website</label>
            <input
              type='text'
              placeholder='Enter Currency Type'
              value={form.currencyType}
              onChange={e => handleChange('currencyType', e.target.value)}
            />
          </div>

          {/* Logo Upload Section */}
          <div className='form-group'>
            <label>Logo Image</label>
            <div className='logo-upload-container'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <div className='logo-upload-area-compact'>
                {form.logoImage ? (
                  <div className='logo-preview-compact'>
                    <div className='logo-image-compact'>
                      <img
                        src={form.logoImage}
                        alt='Company Logo'
                        className='logo-img'
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove(
                            'hidden'
                          );
                        }}
                      />
                      <div className='logo-fallback-compact hidden'>
                        <svg
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='1.5'
                        >
                          <rect
                            x='3'
                            y='3'
                            width='18'
                            height='18'
                            rx='2'
                            ry='2'
                          />
                          <circle cx='8.5' cy='8.5' r='1.5' />
                          <polyline points='21,15 16,10 5,21' />
                        </svg>
                      </div>
                    </div>
                    <div className='logo-actions-compact'>
                      <button
                        type='button'
                        onClick={triggerFileInput}
                        className='change-logo-btn-compact'
                        disabled={uploadingLogo}
                      >
                        <svg
                          width='14'
                          height='14'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                          <polyline points='7,10 12,15 17,10' />
                          <line x1='12' y1='15' x2='12' y2='3' />
                        </svg>
                        {uploadingLogo ? 'Uploading...' : 'Change'}
                      </button>
                      <button
                        type='button'
                        onClick={handleRemoveLogo}
                        className='remove-logo-btn-compact'
                        title='Remove logo'
                        disabled={removingLogo}
                      >
                        <svg
                          width='14'
                          height='14'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <polyline points='3,6 5,6 21,6' />
                          <path d='M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2' />
                        </svg>
                        {removingLogo ? 'Removing...' : ''}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='logo-upload-placeholder-compact'>
                    <div className='logo-placeholder-compact'>
                      <div className='upload-icon-circle'>
                        <svg
                          width='20'
                          height='20'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                          <polyline points='7,10 12,15 17,10' />
                          <line x1='12' y1='15' x2='12' y2='3' />
                        </svg>
                      </div>
                      <div className='upload-text-compact'>
                        <span>No logo uploaded</span>
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={triggerFileInput}
                      className='add-image-btn-compact'
                      disabled={uploadingLogo}
                    >
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                        <polyline points='7,10 12,15 17,10' />
                        <line x1='12' y1='15' x2='12' y2='3' />
                      </svg>
                      {uploadingLogo ? 'Uploading...' : 'Add Image'}
                    </button>
                  </div>
                )}
              </div>
              {uploadingLogo && (
                <div className='upload-progress-compact'>
                  <div className='progress-bar-compact'>
                    <div className='progress-fill-compact'></div>
                  </div>
                  <span>Uploading...</span>
                </div>
              )}
            </div>
          </div>

          {/* <div className='form-group'>
            <label>Favicon Icon</label>
            <input
              type='text'
              placeholder='Enter Favicon URL'
              value={form.faviconIcon}
              onChange={e => handleChange('faviconIcon', e.target.value)}
            />
          </div> */}
          <button
            type='submit'
            className='save-btn'
            disabled={loading}
            style={{
              alignSelf: 'flex-end',
              marginTop: '1.5rem',
              background: loading ? '#9ca3af' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 2.2rem',
              fontWeight: 500,
              fontSize: '1.1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
        <style jsx>{`
          .settings-form-wrapper {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            background: #f5f6fa;
            min-height: 100vh;
            padding: 0;
          }
          .settings-breadcrumb {
            background: #ececec;
            padding: 1rem 0.75rem;
            font-size: 1rem;
            color: #222;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 1.5rem;
          }
          .settings-form {
            background: #fff;
            border-radius: 8px;
            max-width: 100vw;
            margin: 0 auto;
            padding: 2rem 1.5rem 2.5rem 1.5rem;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .form-row {
            display: flex;
            gap: 1.5rem;
            width: 100%;
          }
          .form-group.half {
            flex: 1 1 0;
          }
          label {
            font-size: 1rem;
            color: #222;
            font-weight: 500;
          }
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
          }
          input,
          textarea,
          select {
            font-family: inherit;
            font-size: 1rem;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 0.85rem 1rem;
            background: #fafbfc;
            color: #222;
            transition: border 0.2s;
          }
          input:focus,
          textarea:focus,
          select:focus {
            outline: none;
            border-color: #3b82f6;
            background: #fff;
          }
          textarea {
            min-height: 48px;
            resize: vertical;
          }
          .profile-urls-label {
            font-size: 1rem;
            color: #222;
            font-weight: 500;
            margin-top: 0.5rem;
          }
          .divider {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 0.5rem 0 1rem 0;
          }
          .add-website-btn {
            width: 100%;
            margin-top: 1.5rem;
            background: #f5faff;
            border: 1.5px dashed #3b82f6;
            color: #2563eb;
            font-weight: 500;
            font-size: 1.1rem;
            border-radius: 8px;
            padding: 0.85rem 0;
            cursor: pointer;
            transition:
              background 0.2s,
              border 0.2s;
          }
          .add-website-btn:hover {
            background: #e0f0ff;
            border-color: #2563eb;
          }
          .website-row {
            align-items: flex-end;
          }
          .website-url-group-flex {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
          }
          .website-url-flex {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 0.5rem;
          }
          .remove-website-btn {
            background: #fff;
            color: #e11d48;
            border: 1px solid #e0e0e0;
            border-radius: 50%;
            width: 2rem;
            height: 2rem;
            font-size: 1.3rem;
            font-weight: bold;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 0.5rem;
            cursor: pointer;
            transition:
              background 0.15s,
              border 0.15s;
          }
          .remove-website-btn:hover {
            background: #ffe4e6;
            border-color: #e11d48;
          }

          /* Logo Upload Styles */
          .logo-upload-container {
            width: 100%;
          }
          .logo-upload-area {
            width: 100%;
            min-height: 120px;
            border: 2px dashed #e0e0e0;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            position: relative;
            overflow: hidden;
          }
          .logo-upload-area:hover {
            border-color: #3b82f6;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          }
          .logo-upload-area::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              45deg,
              transparent 30%,
              rgba(59, 130, 246, 0.05) 50%,
              transparent 70%
            );
            transform: translateX(-100%);
            transition: transform 0.6s ease;
          }
          .logo-upload-area:hover::before {
            transform: translateX(100%);
          }
          .logo-upload-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2.5rem 2rem;
            text-align: center;
            color: #6b7280;
            position: relative;
            z-index: 1;
          }
          .upload-icon {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 50%;
            transition: all 0.3s ease;
          }
          .logo-upload-area:hover .upload-icon {
            background: rgba(59, 130, 246, 0.15);
            transform: scale(1.05);
          }
          .upload-text h4 {
            margin: 0 0 0.75rem 0;
            color: #1f2937;
            font-size: 1.125rem;
            font-weight: 600;
          }
          .upload-text p {
            margin: 0 0 1rem 0;
            color: #6b7280;
            font-size: 0.95rem;
          }
          .upload-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            color: #9ca3af;
            font-size: 0.8rem;
            font-weight: 500;
          }
          .upload-info span {
            padding: 0.25rem 0.75rem;
            background: rgba(156, 163, 175, 0.1);
            border-radius: 12px;
            display: inline-block;
          }
          .logo-preview {
            position: relative;
            width: 100%;
            height: 160px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .logo-image-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-image {
            max-width: 80%;
            max-height: 80%;
            object-fit: contain;
            border-radius: 8px;
            transition: transform 0.3s ease;
          }
          .logo-preview:hover .logo-image {
            transform: scale(1.02);
          }
          .logo-fallback {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
            backdrop-filter: blur(4px);
          }
          .logo-fallback.hidden {
            display: none;
          }
          .logo-fallback svg {
            margin-bottom: 0.5rem;
            opacity: 0.8;
          }
          .logo-fallback span {
            font-size: 0.875rem;
            font-weight: 500;
            opacity: 0.9;
          }
          .logo-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.3s ease;
            backdrop-filter: blur(2px);
          }
          .logo-preview:hover .logo-overlay {
            opacity: 1;
          }
          .logo-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            align-items: center;
          }
          .change-logo-btn {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
          }
          .change-logo-btn:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          }
          .change-logo-btn:disabled {
            background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .remove-logo-btn {
            background: rgba(255, 255, 255, 0.95);
            color: #e11d48;
            border: 2px solid rgba(225, 29, 72, 0.3);
            border-radius: 50%;
            width: 2.75rem;
            height: 2.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(4px);
          }
          .remove-logo-btn:hover {
            background: rgba(225, 29, 72, 0.1);
            border-color: #e11d48;
            transform: scale(1.1);
          }
          .upload-progress {
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            color: #6b7280;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.75rem 1rem;
            background: rgba(59, 130, 246, 0.05);
            border-radius: 8px;
            border: 1px solid rgba(59, 130, 246, 0.1);
          }
          .progress-bar {
            width: 120px;
            height: 8px;
            background-color: rgba(156, 163, 175, 0.3);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 4px;
            animation: progress-animation 2s ease-in-out infinite;
            width: 60%;
          }
          @keyframes progress-animation {
            0%,
            100% {
              width: 60%;
            }
            50% {
              width: 80%;
            }
          }

          /* New styles for horizontal layout */
          .logo-upload-placeholder-horizontal {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
            width: 100%;
          }
          .logo-placeholder-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2.5rem 2rem;
            text-align: center;
            color: #6b7280;
            position: relative;
            z-index: 1;
          }
          .add-image-btn {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
          }
          .add-image-btn:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          }
          .add-image-btn:disabled {
            background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .logo-preview-horizontal {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 160px;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .logo-image-section {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          .logo-image-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-image {
            max-width: 80%;
            max-height: 80%;
            object-fit: contain;
            border-radius: 8px;
            transition: transform 0.3s ease;
          }
          .logo-preview-horizontal:hover .logo-image {
            transform: scale(1.02);
          }
          .logo-actions-section {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          .logo-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            align-items: center;
          }
          .change-logo-btn {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
          }
          .change-logo-btn:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          }
          .change-logo-btn:disabled {
            background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .remove-logo-btn {
            background: rgba(255, 255, 255, 0.95);
            color: #e11d48;
            border: 2px solid rgba(225, 29, 72, 0.3);
            border-radius: 50%;
            width: 2.75rem;
            height: 2.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(4px);
          }
          .remove-logo-btn:hover {
            background: rgba(225, 29, 72, 0.1);
            border-color: #e11d48;
            transform: scale(1.1);
          }

          /* Compact Logo Upload Styles */
          .logo-upload-area-compact {
            width: 100%;
            min-height: 120px;
            border: 2px dashed #e0e0e0;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            position: relative;
            overflow: hidden;
          }
          .logo-upload-area-compact:hover {
            border-color: #3b82f6;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          }
          .logo-upload-area-compact::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              45deg,
              transparent 30%,
              rgba(59, 130, 246, 0.05) 50%,
              transparent 70%
            );
            transform: translateX(-100%);
            transition: transform 0.6s ease;
          }
          .logo-upload-area-compact:hover::before {
            transform: translateX(100%);
          }
          .logo-upload-placeholder-compact {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 1.5rem;
            width: 100%;
            color: #6b7280;
            position: relative;
            z-index: 1;
          }
          .upload-icon-compact {
            padding: 0.5rem;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 50%;
            transition: all 0.3s ease;
          }

          .upload-icon-circle {
            width: 40px;
            height: 40px;
            background: rgba(59, 130, 246, 0.1);
            border: 2px solid rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            color: #3b82f6;
            margin-right: 0.75rem;
          }
          .logo-upload-area-compact:hover .upload-icon-compact {
            background: rgba(59, 130, 246, 0.15);
            transform: scale(1.05);
          }

          .logo-upload-area-compact:hover .upload-icon-circle {
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.4);
            transform: scale(1.05);
            color: #2563eb;
          }
          .upload-text-compact {
            margin: 0;
          }
          .upload-text-compact span {
            color: #6b7280;
            font-size: 0.95rem;
          }
          .add-image-btn-compact {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
          }
          .add-image-btn-compact:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          }
          .add-image-btn-compact:disabled {
            background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .logo-preview-compact {
            position: relative;
            width: 100%;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            border-radius: 12px;
            overflow: hidden;
          }
          .logo-image-compact {
            position: relative;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            background: transparent;
          }
          .logo-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 4px;
            transition: transform 0.3s ease;
          }
          .logo-preview-compact:hover .logo-img {
            transform: scale(1.02);
          }
          .logo-fallback-compact {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
            backdrop-filter: blur(4px);
          }
          .logo-fallback-compact.hidden {
            display: none;
          }
          .logo-fallback-compact svg {
            margin-bottom: 0.5rem;
            opacity: 0.8;
          }
          .logo-fallback-compact span {
            font-size: 0.875rem;
            font-weight: 500;
            opacity: 0.9;
          }
          .logo-actions-compact {
            display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
            align-items: center;
            flex-shrink: 0;
          }
          .change-logo-btn-compact {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
          }
          .change-logo-btn-compact:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          }
          .change-logo-btn-compact:disabled {
            background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .remove-logo-btn-compact {
            background: rgba(255, 255, 255, 0.95);
            color: #e11d48;
            border: 2px solid rgba(225, 29, 72, 0.3);
            border-radius: 50%;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(4px);
          }
          .remove-logo-btn-compact:hover {
            background: rgba(225, 29, 72, 0.1);
            border-color: #e11d48;
            transform: scale(1.1);
          }
          .upload-progress-compact {
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            color: #6b7280;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.75rem 1rem;
            background: rgba(59, 130, 246, 0.05);
            border-radius: 8px;
            border: 1px solid rgba(59, 130, 246, 0.1);
          }
          .progress-bar-compact {
            width: 120px;
            height: 8px;
            background-color: rgba(156, 163, 175, 0.3);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
          }
          .progress-fill-compact {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 4px;
            animation: progress-animation 2s ease-in-out infinite;
            width: 60%;
          }
          @keyframes progress-animation {
            0%,
            100% {
              width: 60%;
            }
            50% {
              width: 80%;
            }
          }

          @media (max-width: 900px) {
            .form-row {
              flex-direction: column;
              gap: 0.5rem;
            }
            .website-url-group-flex {
              flex-direction: column;
            }
            .website-url-flex {
              flex-direction: row;
              align-items: center;
            }
          }

          /* Mobile styles for Profile URLs section */
          @media (max-width: 768px) {
            .website-row {
              flex-direction: row !important;
              gap: 0.75rem !important;
              align-items: flex-end !important;
            }

            .website-row .form-group.half {
              flex: 1 !important;
              min-width: 0 !important;
            }

            .website-row .form-group.half:first-child {
              flex: 0 0 40% !important;
            }

            .website-row .form-group.half:last-child {
              flex: 0 0 60% !important;
            }

            .website-url-group-flex {
              flex-direction: column !important;
            }

            .website-url-flex {
              flex-direction: row !important;
              align-items: center !important;
            }

            .website-row select,
            .website-row input {
              font-size: 14px !important;
              padding: 0.75rem 0.75rem !important;
              height: 44px !important;
              box-sizing: border-box !important;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
