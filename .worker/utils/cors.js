// ======================================================
// CORS CONFIGURATION (P0 SECURITY FIX)
// ======================================================
// Whitelist specific domains instead of allowing all origins

/**
 * Allowed origins - ONLY these domains can make API requests
 * Add your production and staging domains here
 */
const ALLOWED_ORIGINS = [
  "https://advenature.pages.dev",           // Cloudflare Pages production
  "https://advenature-staging.pages.dev",   // Staging environment (if you have one)
  "http://localhost:3000",                  // Local development
  "http://localhost:8788",                  // Wrangler dev server
  "http://127.0.0.1:3000",                  // Alternative localhost
  "http://127.0.0.1:8788"                   // Alternative localhost
];

/**
 * Get CORS headers with whitelisted origin
 * @param {Request} request - Incoming request
 * @returns {Object} CORS headers object
 */
export function getCORSHeaders(request) {
  const origin = request.headers.get("Origin");
  
  // Check if origin is in whitelist
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "";
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
    // Optional: Allow credentials (cookies, authorization headers)
    "Access-Control-Allow-Credentials": "true",
    // Cache preflight requests for 1 hour
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
    if (value) { // Only add if value is not empty
      headers.set(key, value);
    }
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
