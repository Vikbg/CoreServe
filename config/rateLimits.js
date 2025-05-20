// config/rateLimits.js
export const PLAN_LIMITS = {
  free: { max: 100, windowMs: 15 * 60 * 1000 },
  pro: { max: 1000, windowMs: 15 * 60 * 1000 },
  admin: { max: 10000, windowMs: 15 * 60 * 1000 },
};
