// ======================================================
// RATE LIMITING UTILITY (P0 SECURITY FIX)
// ======================================================
// Prevents API abuse by limiting requests per endpoint per user
// Uses Cloudflare KV for distributed rate limiting

/**
 * Check and enforce rate limit for a user on a specific endpoint
 * @param {Object} env - Cloudflare environment bindings
 * @param {string} userId - User identifier
 * @param {string} endpoint - API endpoint name (e.g., "gacha", "quiz")
 * @param {number} limit - Maximum requests allowed in the time window
 * @param {number} windowSeconds - Time window in seconds (default: 60)
 * @returns {Promise<boolean>} true if allowed, false if rate limit exceeded
 * @throws {Error} if rate limit is exceeded
 */
export async function checkRateLimit(env, userId, endpoint, limit = 10, windowSeconds = 60) {
  if (!env.QUIZ_KV) {
    // No KV available - allow request but log warning
    console.warn(`[RATE_LIMIT] KV not available - rate limiting disabled for ${endpoint}`);
    return true;
  }

  const key = `ratelimit:${userId}:${endpoint}`;
  
  try {
    const countStr = await env.QUIZ_KV.get(key);
    const count = countStr ? parseInt(countStr, 10) : 0;
    
    if (count >= limit) {
      throw new Error(`Rate limit exceeded. Maximum ${limit} requests per ${windowSeconds} seconds for ${endpoint}. Please try again later.`);
    }
    
    // Increment counter with TTL
    await env.QUIZ_KV.put(key, String(count + 1), {
      expirationTtl: windowSeconds
    });
    
    return true;
  } catch (error) {
    // If it's our rate limit error, rethrow it
    if (error.message.includes('Rate limit exceeded')) {
      throw error;
    }
    // For other KV errors, log and allow (fail open)
    console.error(`[RATE_LIMIT] KV error for ${key}:`, error);
    return true;
  }
}

/**
 * Rate limit configurations for different endpoints
 * Adjust these based on your API usage patterns
 */
export const RATE_LIMITS = {
  // Gacha system - 5 requests per minute
  gacha: { limit: 5, window: 60 },
  
  // Quest completions - 10 per minute (some users might spam refresh)
  quest: { limit: 10, window: 60 },
  
  // Auth endpoints - 3 per minute (prevent brute force)
  auth: { limit: 3, window: 60 },
  
  // Shop orders - 5 per hour (prevent spam orders)
  shop: { limit: 5, window: 3600 },
  
  // Admin operations - 20 per minute (admins need more headroom)
  admin: { limit: 20, window: 60 },
  
  // Sync endpoint - 30 per minute (called frequently by client)
  sync: { limit: 30, window: 60 },
  
  // Profile updates - 5 per minute
  profile: { limit: 5, window: 60 }
};

/**
 * Apply rate limit with predefined config
 * @param {Object} env - Cloudflare environment bindings
 * @param {string} userId - User identifier
 * @param {string} endpointType - Type from RATE_LIMITS config
 */
export async function applyRateLimit(env, userId, endpointType) {
  const config = RATE_LIMITS[endpointType];
  if (!config) {
    console.warn(`[RATE_LIMIT] No config found for ${endpointType}, using default`);
    return checkRateLimit(env, userId, endpointType, 10, 60);
  }
  return checkRateLimit(env, userId, endpointType, config.limit, config.window);
}
