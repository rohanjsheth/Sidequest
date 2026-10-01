// Twilio Verify rate-limit uniqueName — must match the rate limit created by
// scripts/setup-twilio-ratelimits.ts and the rateLimits key in /auth/start.
export const RATE_LIMIT_PHONE = "end_user_phone";

// countries /auth/start and /auth/verify will text. anything else is rejected
// before it reaches Twilio (SMS pumping).
export const PHONE_ALLOW_LIST = ["US"];
