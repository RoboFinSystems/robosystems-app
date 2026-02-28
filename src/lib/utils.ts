/**
 * Utility functions for the application
 */

/**
 * Normalize URLs for local development (LocalStack compatibility)
 * Replaces container hostnames with localhost for browser-accessible URLs
 */
export function normalizeLocalUrl(url: string): string {
  if (process.env.NODE_ENV === 'development') {
    // Replace all occurrences (global), case-insensitive
    return url.replace(/localstack:4566/gi, 'localhost:4566')
  }
  return url
}
