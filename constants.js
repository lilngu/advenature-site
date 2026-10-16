// ======================================================
// CONSTANTS — Config & Magic Numbers (P1 Refactor)
// ======================================================
// Tập trung toàn bộ hard-coded values để dễ tweak & audit.

// ---- API Config ----
export const API_URL = "https://advenature-api.lilnguyen-dcr.workers.dev";
export const GOOGLE_CLIENT_ID = "581456693359-uuhqadehjdotrjr37mo8iei02pvilthf.apps.googleusercontent.com";
export const CLOUDINARY_CLOUD_NAME = "aurorawoods";
export const CLOUDINARY_UPLOAD_PRESET = "advenature";

// ---- Timing (ms) ----
export const TIMING = {
  // Helper delays
  GUIDE_HELPER_DELAY: 2000,
  LORE_HELPER_DELAY: 3000,
  GEM_LB_HELPER_DELAY: 3500,
  GUEST_HELPER_DELAY: 300,
  WELCOME_VOICE_DELAY: 800,
  AVATAR_TOOLTIP_SHOW: 700,
  AVATAR_TOOLTIP_HIDE: 30000,
  TOOLTIP_FADE: 300,
  BANNER_EXIT: 3000,
  // Polling
  QR_POLL_INTERVAL: 2000,
  GOOGLE_CHECK_INTERVAL: 100,
  // Animation
  ANIMATION_DURATION: 800,
  TOOLTIP_FADE_MS: 300,
};

// ---- UI Constants ----
export const UI = {
  HELPER_OFFSET_X: 150,
  HELPER_OFFSET_Y: 50,
  DOCK_HEIGHT: 120,
  GACHA_VIEWPORT_HEIGHT: "60vh",
  INVENTORY_GRID_SIZE: 25,
  LEADERBOARD_TOP_N: 10,
  QUIZ_CORRECT_TARGET: 10,
  SHOP_SKELETON_COUNT: 6,
};

// ---- API Timeouts (ms) ----
export const API_TIMEOUT = {
  DEFAULT: 15000,
  UPLOAD: 30000,
  QR_CHECK: 10000,
};

// ---- Rate Limit Defaults (fallback) ----
export const RATE_LIMIT_DEFAULT = { limit: 10, window: 60 };

// ---- Validation ----
export const VALIDATION = {
  USER_ID_MAX_LENGTH: 128,
  USER_ID_PATTERN: /^[A-Za-z0-9\-_]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  INPUT_MAX_LENGTH: 1000,
  URL_MAX_LENGTH: 300,
  PHONE_MIN_LENGTH: 8,
  PHONE_MAX_LENGTH: 15,
};

// ---- Pagination Defaults ----
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  GEMS_DEFAULT_LIMIT: 200,
  GEMS_MAX_LIMIT: 500,
};

// ---- Gacha / Game Balance ----
export const GAME = {
  GACHA_RATE_LIMIT: 5,      // per minute
  QUEST_RATE_LIMIT: 10,     // per minute
  AUTH_RATE_LIMIT: 3,       // per minute
  SHOP_RATE_LIMIT: 5,       // per hour
  ADMIN_RATE_LIMIT: 20,     // per minute
  SYNC_RATE_LIMIT: 30,      // per minute
  PROFILE_RATE_LIMIT: 5,    // per minute
  ADMIN_IP_RATE_LIMIT: 30,  // per minute
  ADMIN_LOCKOUT_THRESHOLD: 5, // fails before lockout
  ADMIN_LOCKOUT_TTL: 600,   // seconds
};
