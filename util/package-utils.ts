/**
 * Convert a package name to a URL-friendly slug
 * @param name - The package name
 * @returns URL-friendly slug
 */
export function createPackageSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert a URL slug back to a readable package name
 * @param slug - The URL slug
 * @returns Readable package name
 */
export function slugToPackageName(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
}

/**
 * Generate a tour detail URL for a package
 * @param packageData - The package data
 * @returns Tour detail URL
 */
export function generateTourDetailUrl(packageData: {
  id: string;
  name: string;
}): string {
  const slug = createPackageSlug(packageData.name);
  return `/tour-detail/${slug}`;
}
