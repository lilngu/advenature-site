// ======================================================
// INPUT SANITIZATION UTILITY (P0 SECURITY FIX)
// ======================================================
// Prevents XSS attacks by sanitizing user input

/**
 * Escape HTML special characters to prevent XSS
 * @param {any} value - Value to escape
 * @returns {string} Escaped string safe for HTML output
 */
export function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize user input by removing potentially dangerous content
 * @param {string} input - User input string
 * @param {number} maxLength - Maximum allowed length (default: 1000)
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input, maxLength = 1000) {
  if (!input) return "";
  
  let cleaned = String(input).trim();
  
  // Limit length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, "");
  
  // Remove control characters except newline and tab
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  
  return cleaned;
}

/**
 * Validate and sanitize email address
 * @param {string} email - Email to validate
 * @returns {string|null} Sanitized email or null if invalid
 */
export function sanitizeEmail(email) {
  if (!email) return null;
  
  const cleaned = sanitizeInput(email, 254).toLowerCase(); // RFC 5321
  
  // Basic email regex (not perfect but good enough)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(cleaned) ? cleaned : null;
}

/**
 * Validate and sanitize adventurer code (AWxxxx format)
 * @param {string} code - Code to validate
 * @returns {string|null} Sanitized code or null if invalid
 */
export function sanitizeAdventurerCode(code) {
  if (!code) return null;
  
  const cleaned = sanitizeInput(code, 20).toUpperCase();
  
  // Must match AWxxxx format (AW followed by 4 digits)
  const codeRegex = /^AW\d{4}$/;
  
  return codeRegex.test(cleaned) ? cleaned : null;
}

/**
 * Sanitize user name (for display)
 * @param {string} name - Name to sanitize
 * @param {number} minLength - Minimum length (default: 2)
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string|null} Sanitized name or null if invalid
 */
export function sanitizeName(name, minLength = 2, maxLength = 50) {
  if (!name) return null;
  
  const cleaned = sanitizeInput(name, maxLength).trim();
  
  // Check length
  if (cleaned.length < minLength || cleaned.length > maxLength) {
    return null;
  }
  
  // Remove excessive whitespace
  return cleaned.replace(/\s+/g, " ");
}

/**
 * Validate URL is safe (http/https only, no javascript:, data:, etc.)
 * @param {string} url - URL to validate
 * @returns {string|null} Sanitized URL or null if invalid
 */
export function sanitizeURL(url) {
  if (!url) return null;
  
  const cleaned = sanitizeInput(url, 300).trim();
  
  // Only allow http and https protocols
  if (!/^https?:\/\//i.test(cleaned)) {
    return null;
  }
  
  // Block potentially dangerous patterns
  if (/javascript:|data:|vbscript:|file:/i.test(cleaned)) {
    return null;
  }
  
  return cleaned;
}

/**
 * Sanitize phone number (basic validation)
 * @param {string} phone - Phone number to sanitize
 * @returns {string|null} Sanitized phone or null if invalid
 */
export function sanitizePhone(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters except + at start
  let cleaned = String(phone).trim();
  cleaned = cleaned.replace(/[^\d+]/g, "");
  
  // + can only be at the start
  if (cleaned.includes("+")) {
    if (!cleaned.startsWith("+")) return null;
    cleaned = "+" + cleaned.replace(/\+/g, "");
  }
  
  // Length check (international format: 8-15 digits)
  const digitCount = cleaned.replace(/\+/g, "").length;
  if (digitCount < 8 || digitCount > 15) {
    return null;
  }
  
  return cleaned;
}

/**
 * Sanitize object with multiple fields
 * Useful for sanitizing entire request bodies
 * @param {Object} data - Object to sanitize
 * @param {Object} schema - Schema defining how to sanitize each field
 * @returns {Object} Sanitized object
 * 
 * @example
 * const sanitized = sanitizeObject(
 *   { name: "John<script>", email: "JOHN@EXAMPLE.COM " },
 *   { name: "name", email: "email" }
 * );
 */
export function sanitizeObject(data, schema) {
  const result = {};
  
  for (const [field, type] of Object.entries(schema)) {
    const value = data[field];
    
    switch (type) {
      case "name":
        result[field] = sanitizeName(value);
        break;
      case "email":
        result[field] = sanitizeEmail(value);
        break;
      case "code":
        result[field] = sanitizeAdventurerCode(value);
        break;
      case "url":
        result[field] = sanitizeURL(value);
        break;
      case "phone":
        result[field] = sanitizePhone(value);
        break;
      case "html":
        result[field] = escapeHTML(value);
        break;
      default:
        result[field] = sanitizeInput(value);
    }
  }
  
  return result;
}
