// ======================================================
// RESPONSE HELPER UTILITY (P0 FIX)
// ======================================================
// Centralized response creation with automatic CORS headers

import { addCORSHeaders } from './cors.js';

/**
 * Create JSON response with CORS headers
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @param {Request} request - Original request for CORS
 * @returns {Response} Response with CORS headers
 */
export function jsonResponse(data, status = 200, request) {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: { 
      "Content-Type": "application/json"
    }
  });
  
  return addCORSHeaders(response, request);
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 400)
 * @param {Request} request - Original request for CORS
 * @returns {Response} Error response with CORS headers
 */
export function errorResponse(message, status = 400, request) {
  return jsonResponse({ 
    error: message,
    success: false 
  }, status, request);
}

/**
 * Create success response
 * @param {Object} data - Success data
 * @param {Request} request - Original request for CORS
 * @returns {Response} Success response with CORS headers
 */
export function successResponse(data, request) {
  return jsonResponse({
    success: true,
    ...data
  }, 200, request);
}

/**
 * Create not found response
 * @param {string} message - Custom message (default: "Not Found")
 * @param {Request} request - Original request for CORS
 * @returns {Response} 404 response with CORS headers
 */
export function notFoundResponse(message = "Not Found", request) {
  return errorResponse(message, 404, request);
}

/**
 * Create unauthorized response
 * @param {string} message - Custom message
 * @param {Request} request - Original request for CORS
 * @returns {Response} 401 response with CORS headers
 */
export function unauthorizedResponse(message = "Unauthorized", request) {
  return errorResponse(message, 401, request);
}

/**
 * Create forbidden response
 * @param {string} message - Custom message
 * @param {Request} request - Original request for CORS
 * @returns {Response} 403 response with CORS headers
 */
export function forbiddenResponse(message = "Access denied", request) {
  return errorResponse(message, 403, request);
}

/**
 * Create rate limit exceeded response
 * @param {number} limit - Rate limit that was exceeded
 * @param {number} window - Time window in seconds
 * @param {Request} request - Original request for CORS
 * @returns {Response} 429 response with CORS headers
 */
export function rateLimitResponse(limit, window, request) {
  return jsonResponse({
    error: `Rate limit exceeded. Maximum ${limit} requests per ${window} seconds. Please try again later.`,
    success: false,
    retryAfter: window
  }, 429, request);
}

/**
 * Create server error response
 * @param {string} message - Error message
 * @param {Request} request - Original request for CORS
 * @returns {Response} 500 response with CORS headers
 */
export function serverErrorResponse(message = "Internal server error", request) {
  return errorResponse(message, 500, request);
}
