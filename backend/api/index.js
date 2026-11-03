const { app, corsMiddleware } = require("../server");
const dbConnect = require("../config/dbConnect");
const { assertTransactionSupport } = require("../config/assertTransactionSupport");
const logger = require("../utils/logger");

let databaseConnection;

const connectDatabase = () => {
  if (!databaseConnection) {
    databaseConnection = dbConnect()
      .then(async (connection) => {
        await assertTransactionSupport(connection);
        return connection;
      })
      .catch((error) => {
        databaseConnection = null;
        throw error;
      });
  }
  return databaseConnection;
};

const handler = async (req, res) => {
  const requestPath = new URL(req.url, "http://localhost").pathname;
  if (requestPath === "/" || requestPath === "/health" || req.method === "OPTIONS") {
    return app(req, res);
  }

  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    logger.error({ err: error, method: req.method, path: requestPath }, "serverless request initialization failed");
    if (res.headersSent) return;
    return corsMiddleware(req, res, (corsError) => {
      res.statusCode = corsError ? corsError.statusCode || 403 : 503;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const message = corsError
        ? "Origin is not allowed by CORS"
        : "Backend database is unavailable. Check the deployment database configuration.";
      return res.end(JSON.stringify({ message }));
    });
  }
};

module.exports = handler;
