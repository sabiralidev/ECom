const mongoSanitize = require("express-mongo-sanitize");

const sanitizeRequest = (req, res, next) => {
  if (req.originalUrl.split("?")[0] === "/api/checkout/webhook") {
    return next();
  }

  if (req.body && typeof req.body === "object") {
    req.body = mongoSanitize.sanitize(req.body);
  }
  if (req.params && typeof req.params === "object") {
    req.params = mongoSanitize.sanitize(req.params);
  }

  const sanitizedQuery = mongoSanitize.sanitize(req.query);
  Object.defineProperty(req, "query", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: sanitizedQuery,
  });

  return next();
};

module.exports = { sanitizeRequest };
