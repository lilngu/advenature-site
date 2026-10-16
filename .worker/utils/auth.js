// ======================================================
// AUTHENTICATION & AUTHORIZATION UTILITY (P0 SECURITY FIX)
// ======================================================
// Secure admin authentication using secret key header

/**
 * Admin-protected endpoints that require x-admin-key header
 * Add new admin endpoints here as needed
 */
const ADMIN_ENDPOINTS = [
  "/api/user/add-points",
  "/api/admin/users-list",
  "/api/admin/update-user-avatar"
];

/**
 * Check if endpoint requires admin authentication
 * @param {string} path - Request path
 * @returns {boolean} true if endpoint requires admin key
 */
export function isAdminEndpoint(path) {
  return ADMIN_ENDPOINTS.some(endpoint => path.startsWith(endpoint));
}

/**
 * Verify admin secret key from request header
 * @param {Request} request - Incoming request
 * @param {Object} env - Cloudflare environment bindings
 * @returns {boolean} true if valid admin key
 */
export function verifyAdminKey(request, env) {
  const providedKey = request.headers.get("x-admin-key");
  const validKey = env.ADMIN_SECRET_KEY || "AdvenatureAdmin2026@"; // Fallback (change in production!)
  
  if (!providedKey) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(providedKey, validKey);
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} true if strings are equal
 */
function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Create unauthorized response
 * @param {string} message - Error message
 * @returns {Response} 401 Unauthorized response
 */
export function createUnauthorizedResponse(message = "Unauthorized access") {
  return new Response(
    JSON.stringify({ 
      error: message,
      code: "UNAUTHORIZED"
    }), 
    {
      status: 401,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

/**
 * Create forbidden response
 * @param {string} message - Error message
 * @returns {Response} 403 Forbidden response
 */
export function createForbiddenResponse(message = "Access denied") {
  return new Response(
    JSON.stringify({ 
      error: message,
      code: "FORBIDDEN"
    }), 
    {
      status: 403,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

/**
 * Verify user has admin role in database (secondary check)
 * Use this in addition to API key check for extra security
 * @param {Object} env - Cloudflare environment bindings
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} true if user is admin
 */
export async function verifyAdminRole(env, userId) {
  if (!userId || !env.DB) {
    return false;
  }
  
  try {
    const user = await env.DB.prepare(
      "SELECT role FROM users WHERE id = ? LIMIT 1"
    ).bind(userId).first();
    
    return user && user.role === "admin";
  } catch (error) {
    console.error("[AUTH] Error checking admin role:", error);
    return false;
  }
}

/**
 * Middleware: Check admin authentication
 * Call this early in admin endpoint handlers
 * @param {Request} request - Incoming request
 * @param {Object} env - Cloudflare environment bindings
 * @returns {Response|null} Error response if not authorized, null if authorized
 */
export function checkAdminAuth(request, env) {
  if (!verifyAdminKey(request, env)) {
    return createUnauthorizedResponse(
      "Invalid or missing admin key. Please provide x-admin-key header."
    );
  }
  return null; // Authorized
}
