/**
 * Base path for the application (GitHub Pages subdirectory)
 * Must match the basePath in next.config.js
 */
const BASE_PATH = '/mtd-site';

/**
 * Get the full path for an image
 * Prepends the base path to the image path for GitHub Pages deployment
 * 
 * @param imagePath - The image path starting with / (e.g., "/images/logo.png")
 * @returns The full path with base path prepended
 */
export function getImagePath(imagePath: string): string {
  return `${BASE_PATH}${imagePath}`;
}


