const pino = require("pino");

const logger = pino({
    level: "info",
    base: { service: "ecom-api" },
    redact: {
        paths: [
            "password",
            "token",
            "authorization",
            "cookie",
            "*.password",
            "*.token",
            "*.authorization",
            "*.cookie",
        ],
        censor: "[Redacted]",
    },
});

module.exports = logger;
