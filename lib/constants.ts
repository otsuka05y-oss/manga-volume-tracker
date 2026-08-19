export const STALE_THRESHOLD_DAYS = 60;

// Keep in sync with supabase/migrations/0002_add_spine_color.sql's default.
export const DEFAULT_SPINE_COLOR = "#78716c";

// Uniform background for every spine — spine_color is used only as the
// volume-number label color now, not the spine background.
export const SPINE_CREAM_COLOR = "#f1e6d0";

export const NOTIFY_LOOKAHEAD_DAYS = 0;
export const NOTIFY_LAG_DAYS = 7;

export const RELEASE_CHECK_BATCH_SIZE = 30;
export const RELEASE_RECHECK_WITHIN_DAYS = 30;

export const SESSION_COOKIE_NAME = "session";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
