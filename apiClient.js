// ======================================================
// API CLIENT — Centralized API calls (P1 Refactor)
// ======================================================
// Tập trung mọi fetch() vào 1 file để dễ audit, retry, timeout.

import { API_URL, API_TIMEOUT } from './constants.js';

/**
 * Fetch JSON with timeout + res.ok check.
 * @param {string} url
 * @param {object} options - fetch options
 * @param {number} timeoutMs
 * @returns {Promise<object>}
 */
export async function fetchJSON(url, options = {}, timeoutMs = API_TIMEOUT.DEFAULT) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Safe API call wrapper — không bao giờ crash app.
 * @param {Function} fn - async function
 * @param {*} fallback - return value on error
 * @param {string} logTag
 * @returns {Promise<*>}
 */
export async function safeApiCall(fn, fallback = null, logTag = "API") {
    try {
        return await fn();
    } catch (e) {
        if (e?.name === "AbortError") console.warn(`[${logTag}] timeout`);
        else console.warn(`[${logTag}]`, e);
        try {
            // Lazy import toast to avoid circular dependency
            const { toast } = await import('./toast.js');
            toast?.error?.("LỖI KẾT NỐI", "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
        } catch (_) {}
        return fallback;
    }
}

// ======================================================
// API ENDPOINTS
// ======================================================

export async function apiSyncUser(userId) {
    return fetchJSON(`${API_URL}/api/user/sync?userId=${encodeURIComponent(userId)}`);
}

export async function apiGetLeaderboard() {
    return fetchJSON(`${API_URL}/api/leaderboard/gems`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
    });
}

export async function apiGetProfile(userId) {
    return fetchJSON(`${API_URL}/api/user/profile?userId=${encodeURIComponent(userId)}`);
}

export async function apiGetGuildQuests() {
    return fetchJSON(`${API_URL}/api/guild-quests`, { cache: "default" });
}

export async function apiRegisterGuildQuest(data) {
    return fetchJSON(`${API_URL}/api/quest/register-guild-quest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiGetGemMilestone() {
    return fetchJSON(`${API_URL}/api/gem-milestone`);
}

export async function apiGoogleLogin(data) {
    return fetchJSON(`${API_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiRegisterFirstGacha(data) {
    return fetchJSON(`${API_URL}/api/auth/register-first-gacha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiGacha(data) {
    return fetchJSON(`${API_URL}/api/gacha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiUseBuff(data) {
    return fetchJSON(`${API_URL}/api/inventory/use-buff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiCheckQR(token) {
    return fetchJSON(`${API_URL}/api/inventory/check-qr?token=${encodeURIComponent(token)}`);
}

export async function apiGetShopProducts() {
    return fetchJSON(`${API_URL}/api/shop-products`, {
        headers: { "Content-Type": "application/json" }
    });
}

export async function apiPlaceShopOrder(data) {
    return fetchJSON(`${API_URL}/api/shop-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiCheckin(data) {
    return fetchJSON(`${API_URL}/api/quest/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiSubmitFB(data) {
    return fetchJSON(`${API_URL}/api/quest/submit-fb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiRequestChangeName(data) {
    return fetchJSON(`${API_URL}/api/user/request-change-name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiReferral(data) {
    return fetchJSON(`${API_URL}/api/quest/referral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiGetQuizQuestions() {
    return fetchJSON(`${API_URL}/api/quest/quiz-questions`);
}

export async function apiQuizComplete(data) {
    return fetchJSON(`${API_URL}/api/quest/quiz-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function apiSyncPoints(tq = 0, ch = 0) {
    return fetchJSON(`${API_URL}/api/user/add-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tq, ch })
    });
}

export async function apiUpdateAvatar(data) {
    return fetchJSON(`${API_URL}/api/user/update-avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

// ---- Paginated endpoints (P0) ----

export async function apiGetInventoryList(userId, page = 1, limit = 50) {
    return fetchJSON(`${API_URL}/api/inventory/list?userId=${encodeURIComponent(userId)}&page=${page}&limit=${limit}`);
}

export async function apiGetGemsList(userId, page = 1, limit = 200) {
    return fetchJSON(`${API_URL}/api/gems/list?userId=${encodeURIComponent(userId)}&page=${page}&limit=${limit}`);
}
