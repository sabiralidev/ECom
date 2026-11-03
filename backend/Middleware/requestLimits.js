const rateLimit = require("express-rate-limit");

const createRequestLimiter = ({ windowMs, limit, message }) => rateLimit({
  windowMs,
  limit,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ message }),
});

const authLimiter = createRequestLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many authentication attempts. Please try again later.",
});

const newsletterLimiter = createRequestLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many subscription attempts. Please try again later.",
});

const checkoutLimiter = createRequestLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: "Too many checkout requests. Please try again later.",
});

module.exports = { authLimiter, newsletterLimiter, checkoutLimiter };
