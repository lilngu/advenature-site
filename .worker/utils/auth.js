// ======================================================
// AUTHENTICATION & AUTHORIZATION UTILITY (P0 SECURITY FIX)
// ======================================================
// Aligned with inline worker.js (2026-10-16)
// Includes: VIEW/WRITE roles, lockout, audit log, constant-time compare

/**
 * Admin-protected endpoints
 */
export const ADMIN_ENDPOINTS = ["/api/user/add-points", "/api/admin/"];

/**
 * Write endpoints: POST that changes data requires WRITE key
 */
export const ADMIN_WRITE_PATHS = [
  "/api/user/add-points",
  "/api/admin/update-",
  "/api/admin/delete-",
  "/api/admin/grant-",
  "/api/admin/remove-",
  "/api/admin/reset-daily",
  "/api/admin/shop-product-",
  "/api/admin/guild-quest-"
];

/**
 * Check if endpoint requires admin authentication
 */
export function isAdminEndpoint(path) {
  return ADMIN_ENDPOINTS.some(endpoint => path.startsWith(endpoint));
}

/**
 * Check if endpoint requires WRITE key (POST that changes data)
 */
export function requiresWriteKey(path, method) {
  if (method !== "POST") return false;
  return ADMIN_WRITE_PATHS.some(p => path.startsWith(p));
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request) {
  return request.headers.get("cf-connecting-ip")
    || (request.headers.get("x-forwarded-for") || "").split(",")[0].trim()
    || "unknown";
}

/**
 * Verify admin role from request header
 * @returns {string|null} "write" | "view" | null
 */
export function verifyAdminRole(request, env) {
  const providedKey = request.headers.get("x-admin-key");
  if (!providedKey) return null;
  const writeKey = env.ADMIN_SECRET_KEY || "AdvenatureAdmin2026@";
  if (constantTimeCompare(providedKey, writeKey)) return "write";
  const viewKey = env.ADMIN_VIEW_KEY || "";
  if (viewKey && constantTimeCompare(providedKey, viewKey)) return "view";
  return null;
}

/**
 * Verify admin key (any valid key)
 */
export function verifyAdminKey(request, env) {
  return verifyAdminRole(request, env) !== null;
}

/**
 * Check if admin IP is locked out
 */
export async function isAdminLocked(env, ip) {
  if (!env.QUIZ_KV || ip === "unknown") return false;
  try {
    const v = await env.QUIZ_KV.get(`admin_lock:${ip}`);
    return !!v;
  } catch (_e) { return false; }
}

/**
 * Record admin auth failure, lock after 5 fails
 */
export async function recordAdminFail(env, ip) {
  if (!env.QUIZ_KV || ip === "unknown") return;
  try {
    const k = `admin_fail:${ip}`;
    const cur = Number(await env.QUIZ_KV.get(k) || 0) + 1;
    await env.QUIZ_KV.put(k, String(cur), { expirationTtl: 600 });
    if (cur >= 5) {
      await env.QUIZ_KV.put(`admin_lock:${ip}`, String(Date.now()), { expirationTtl: 600 });
    }
  } catch (_e) {}
}

/**
 * Clear admin auth failures on success
 */
export async function clearAdminFail(env, ip) {
  if (!env.QUIZ_KV || ip === "unknown") return;
  try { await env.QUIZ_KV.delete(`admin_fail:${ip}`); } catch (_e) {}
}

/**
 * Check admin rate limit per IP (30 req/min)
 */
export async function checkAdminRateLimit(env, ip) {
  if (!env.QUIZ_KV || ip === "unknown") return true;
  const k = `admin_rl:${ip}`;
  const cur = Number(await env.QUIZ_KV.get(k) || 0);
  if (cur >= 30) throw new Error("Admin rate limit: tối đa 30 request/phút/IP. Thử lại sau.");
  await env.QUIZ_KV.put(k, String(cur + 1), { expirationTtl: 60 });
  return true;
}

/**
 * Middleware: Check admin authentication
 * @returns {Response|null} Error response if not authorized, null if authorized
 */
export function checkAdminAuth(request, env, opts) {
  const needWrite = !!(opts && opts.requireWrite);
  const role = verifyAdminRole(request, env);
  if (!role) {
    return new Response(JSON.stringify({
      error: "Invalid or missing admin key. Please provide x-admin-key header.",
      code: "UNAUTHORIZED"
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (needWrite && role !== "write") {
    return new Response(JSON.stringify({
      error: "Key VIEW chỉ được đọc. Thao tác ghi cần key WRITE.",
      code: "FORBIDDEN"
    }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  return null;
}

/**
 * Log admin action to audit table (auto-creates table)
 */
export async function logAdminAction(env, request, action, targetId, detail) {
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      target_id TEXT,
      detail TEXT,
      ip TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();
    await env.DB.prepare(
      "INSERT INTO admin_audit (action, target_id, detail, ip) VALUES (?, ?, ?, ?)"
    ).bind(
      String(action).slice(0, 80),
      targetId ? String(targetId).slice(0, 200) : null,
      detail ? String(detail).slice(0, 1000) : null,
      getClientIP(request).slice(0, 60)
    ).run();
  } catch (_e) {}
}
