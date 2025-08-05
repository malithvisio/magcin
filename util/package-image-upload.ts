export interface UploadedImage {
  url: string;
  path: string;
  alt: string;
  order: number;
  fileName: string;
}

export interface UploadProgress {
  current: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  images?: UploadedImage[];
  error?: string;
}

/**
 * Upload multiple images for a package
 * @param files - Array of files to upload
 * @param packageId - The package ID
 * @param imageType - Type of images ('instruction', 'slider', 'accommodation', 'review')
 * @param altTexts - Array of alt texts for the images
 * @param accommodationIndex - Index for accommodation images (optional)
 * @param reviewIndex - Index for review images (optional)
 * @param onProgress - Callback for upload progress
 * @returns Promise<UploadResult>
 */
export async function uploadPackageImages(
  files: File[],
  packageId: string,
  imageType: 'instruction' | 'slider' | 'accommodation' | 'review',
  altTexts: string[] = [],
  accommodationIndex?: number,
  reviewIndex?: number,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    if (!files || files.length === 0) {
      return { success: false, error: 'No files provided' };
    }

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error:
            'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        };
      }

      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size too large. Maximum size is 5MB per file.',
        };
      }
    }

    // Create FormData
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('packageId', packageId);
    formData.append('imageType', imageType);

    // Add alt texts
    altTexts.forEach(altText => formData.append('altTexts', altText));

    // Add optional indices
    if (accommodationIndex !== undefined) {
      formData.append('accommodationIndex', accommodationIndex.toString());
    }
    if (reviewIndex !== undefined) {
      formData.append('reviewIndex', reviewIndex.toString());
    }

    // Upload files
    const response = await fetch('/api/packages/upload-images', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to upload images',
      };
    }

    return {
      success: true,
      images: result.images,
    };
  } catch (error: any) {
    console.error('Error uploading package images:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload images',
    };
  }
}

/**
 * Delete a package image
 * @param imagePath - The Firebase Storage path of the image
 * @param packageId - The package ID
 * @param imageType - Type of image
 * @param fieldPath - MongoDB field path to clear (optional)
 * @returns Promise<boolean>
 */
export async function deletePackageImage(
  imagePath: string,
  packageId: string,
  imageType: string,
  fieldPath?: string
): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      path: imagePath,
      packageId,
      imageType,
    });

    if (fieldPath) {
      params.append('fieldPath', fieldPath);
    }

    const response = await fetch(`/api/packages/upload-images?${params}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to delete image:', result.error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting package image:', error);
    return false;
  }
}

/**
 * Generate a unique filename for uploaded images
 * @param originalName - Original filename
 * @param index - Index in the upload batch
 * @returns string
 */
export function generateImageFilename(
  originalName: string,
  index: number = 0
): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || 'jpg';
  return `package_image_${timestamp}_${index}.${extension}`;
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns { isValid: boolean; error?: string }
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size is 5MB.',
    };
  }

  return { isValid: true };
}
