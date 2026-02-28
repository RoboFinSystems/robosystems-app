/**
 * API configuration constants
 */
export const API_ENDPOINTS = {
  CONTACT: '/api/contact',
} as const

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]
