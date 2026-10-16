// ======================================================
// CORS CONFIGURATION (P0 SECURITY FIX)
// ======================================================
// Whitelist specific domains instead of allowing all origins
// Aligned with inline worker.js (2026-10-16)

/**
 * Allowed origins - ONLY these domains can make API requests
 */
export const ALLOWED_ORIGINS = [
  "https://rungtinhlinh.com",
  "https://advenature-site.pages.dev",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:5501",
  "http://localhost:5501",
  "http://127.0.0.1:8788",
  "http://localhost:8788"
];

/**
 * Get CORS headers with whitelisted origin
 * @param {Request} request - Incoming request
 * @returns {Object} CORS headers object
 */
export function getCORSHeaders(request) {
  const origin = request.headers.get("Origin");
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "3600"
  };
}

/**
 * Create OPTIONS response for CORS preflight
 * @param {Request} request - Incoming request
 * @returns {Response} CORS preflight response
 */
export function handleCORSPreflight(request) {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(request)
  });
}

/**
 * Add CORS headers to an existing response
 * @param {Response} response - Response to modify
 * @param {Request} request - Original request
 * @returns {Response} Response with CORS headers
 */
export function addCORSHeaders(response, request) {
  const corsHeaders = getCORSHeaders(request);
  const headers = new Headers(response.headers);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (value) headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
