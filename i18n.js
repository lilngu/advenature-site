/**
 * i18n.js - Hệ thống dịch thuật đơn giản cho Advenature
 * Đọc data-i18n từ DOM và apply text từ window.TEXTS
 */

// Cache các element đã xử lý để tránh query lại nhiều lần
const i18nCache = new Map();

/**
 * Lấy giá trị nested từ object theo key dạng "a.b.c"
 */
function getNestedValue(obj, key) {
    if (!obj || !key) return null;
    return key.split('.').reduce((o, k) => (o ? o[k] : null), obj);
}

/**
 * Format string với các placeholder {key}
 */
function formatString(str, args = {}) {
    if (typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, (match, key) => args[key] !== undefined ? args[key] : match);
}

/**
 * Parse data-i18n-args thành object
 */
function parseArgs(el) {
    const argsStr = el.dataset.i18nArgs;
    if (!argsStr) return {};
    try {
        return JSON.parse(argsStr);
    } catch {
        return {};
    }
}

/**
 * Apply translation cho một element
 */
function applyElement(el, key) {
    const text = getNestedValue(window.TEXTS, key);
    if (text === null || text === undefined) return false;

    const args = parseArgs(el);
    const formatted = formatString(text, args);

    // Xác định cách gán dựa trên attribute
    if (el.dataset.i18nPlaceholder) {
        el.placeholder = formatted;
    } else if (el.dataset.i18nAlt) {
        el.alt = formatted;
    } else if (el.dataset.i18nTitle) {
        el.title = formatted;
    } else if (el.dataset.i18nText) {
        el.textContent = formatted;
    } else if (el.dataset.i18n) {
        // Mặc định: innerHTML để hỗ trợ tag <i>, <b>...
        el.innerHTML = formatted;
    }
    return true;
}

/**
 * Hàm chính: Apply i18n cho toàn bộ document
 */
export function applyI18n(root = document) {
    // 1. Elements với data-i18n (main text)
    root.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (key) applyElement(el, key);
    });

    // 2. Placeholder
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (key) applyElement(el, key);
    });

    // 3. Alt text
    root.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const key = el.dataset.i18nAlt;
        if (key) applyElement(el, key);
    });

    // 4. Title/tooltip
    root.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.dataset.i18nTitle;
        if (key) applyElement(el, key);
    });

    // 5. TextContent only (không render HTML)
    root.querySelectorAll('[data-i18n-text]').forEach(el => {
        const key = el.dataset.i18nText;
        if (key) applyElement(el, key);
    });
}

/**
 * Apply i18n cho element mới được thêm vào DOM (dynamic content)
 */
export function applyI18nToElement(el) {
    if (!el || !el.querySelectorAll) return;
    applyI18n(el);
}

/**
 * Re-apply khi thay đổi ngôn ngữ (future)
 */
export function refreshI18n() {
    applyI18n(document);
}

// Export cho global access
window.applyI18n = applyI18n;
window.applyI18nToElement = applyI18nToElement;
window.refreshI18n = refreshI18n;