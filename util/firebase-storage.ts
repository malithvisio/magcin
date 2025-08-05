import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'activities/images/')
 * @param fileName - Optional custom filename, if not provided will use file.name
 * @returns Promise<UploadResult> with download URL and storage path
 */
export async function uploadFile(
  file: File,
  path: string,
  fileName?: string
): Promise<UploadResult> {
  try {
    console.log('Starting file upload:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
    });

    // Generate unique filename if not provided
    const uniqueFileName = fileName || `${Date.now()}_${file.name}`;
    const fullPath = `${path}${uniqueFileName}`;

    console.log('Full path:', fullPath);

    // Create storage reference
    const storageRef = ref(storage, fullPath);

    // Upload file
    console.log('Uploading bytes...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload bytes completed');

    // Get download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained');

    return {
      url: downloadURL,
      path: fullPath,
    };
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw new Error(
      `Failed to upload file: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Delete a file from Firebase Storage
 * @param path - The storage path of the file to delete
 * @returns Promise<void>
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw error for delete operations as the file might not exist
  }
}

/**
 * Extract storage path from Firebase Storage URL
 * @param url - The Firebase Storage download URL
 * @returns The storage path or null if not a Firebase Storage URL
 */
export function extractStoragePath(url: string): string | null {
  try {
    // Firebase Storage URLs have a specific pattern
    const match = url.match(/firebasestorage\.app\/o\/([^?]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a URL is from Firebase Storage
 * @param url - The URL to check
 * @returns boolean
 */
export function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.app');
}
