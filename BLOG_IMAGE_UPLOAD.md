# Blog Image Upload with Firebase Storage

This document explains how blog image uploads work in the TourTrails admin panel.

## Overview

Blog images are now uploaded to Firebase Storage and the URLs are saved in the MongoDB Blog
collection. This provides:

- **Secure storage**: Images are stored in Firebase Storage with proper access controls
- **CDN delivery**: Fast image loading through Firebase's global CDN
- **Automatic cleanup**: Old images are deleted when new ones are uploaded
- **File validation**: Type and size validation before upload

## Implementation Details

### 1. API Endpoint

**File**: `app/api/blogs/upload/route.ts`

- **Method**: POST
- **Authentication**: Required (user context from headers)
- **File validation**:
  - Allowed types: JPEG, PNG, WebP
  - Max size: 5MB
- **Storage path**: `blogs/{blogId}/`
- **Old image cleanup**: Automatically deletes previous image from Firebase Storage

### 2. Frontend Integration

**File**: `app/admin/blogs/edit/[id]/page.tsx`

- **Upload progress**: Shows real-time upload progress with spinner
- **File validation**: Client-side validation before upload
- **Error handling**: User-friendly error messages
- **Success feedback**: Visual confirmation when upload completes

### 3. Database Schema

**File**: `models/Blog.ts`

The Blog model includes these image-related fields:

```typescript
imageUrl: {
  type: String,
  trim: true,
},
imageAlt: {
  type: String,
  trim: true,
},
```

## Usage

### For Blog Editors

1. **Navigate** to the blog edit page (`/admin/blogs/edit/[id]`)
2. **Click** "Upload Image" button
3. **Select** an image file (JPEG, PNG, or WebP, max 5MB)
4. **Wait** for upload to complete (progress indicator shown)
5. **Add** alt text for accessibility
6. **Save** the blog - the Firebase URL is automatically saved

### For Developers

#### Uploading an Image

```typescript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('blogId', blogId);
formData.append('oldImageUrl', currentImageUrl); // Optional

const response = await fetch('/api/blogs/upload', {
  method: 'POST',
  headers: {
    'x-user-id': user.id,
    'x-user-email': user.email,
    'x-tenant-id': user.tenantId,
  },
  body: formData,
});

const result = await response.json();
// result.url contains the Firebase Storage URL
```

#### Saving to Database

```typescript
const blogData = {
  title: 'Blog Title',
  imageUrl: result.url, // Firebase Storage URL
  imageAlt: 'Alt text for accessibility',
  // ... other fields
};

await apiRequest(`/api/blogs/${blogId}`, {
  method: 'PUT',
  body: blogData,
});
```

## Security Features

1. **Authentication**: All uploads require valid user authentication
2. **File validation**: Only image files under 5MB are accepted
3. **Path isolation**: Images are stored in blog-specific folders
4. **Automatic cleanup**: Old images are deleted to save storage space

## Error Handling

- **File too large**: "File size too large. Maximum size is 5MB."
- **Invalid file type**: "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
- **Authentication**: "Authentication required"
- **Upload failure**: Detailed error message from Firebase

## Storage Structure

```
Firebase Storage:
└── blogs/
    └── {blogId}/
        ├── {timestamp}_{filename}.jpg
        ├── {timestamp}_{filename}.png
        └── ...
```

## Benefits

1. **Performance**: Images load faster through CDN
2. **Scalability**: Firebase Storage handles large files efficiently
3. **Cost-effective**: Pay only for storage and bandwidth used
4. **Reliability**: Firebase's global infrastructure ensures high availability
5. **Security**: Proper access controls and authentication

## Troubleshooting

### Common Issues

1. **Upload fails**: Check user authentication and file size/type
2. **Image not showing**: Verify the URL is accessible and not expired
3. **Old images not deleted**: Check Firebase Storage permissions

### Debug Steps

1. Check browser console for error messages
2. Verify user authentication in network tab
3. Check Firebase Storage console for file uploads
4. Validate file size and type before upload

## Future Enhancements

- **Image optimization**: Automatic resizing and compression
- **Multiple images**: Support for blog galleries
- **Drag & drop**: Enhanced upload interface
- **Image cropping**: In-browser image editing
