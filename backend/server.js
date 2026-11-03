// Imports Packages Which Use in BackEnd Application
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const { sanitizeRequest } = require("./Middleware/sanitizeRequest");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(helmet());

// Stripe webhook must receive the raw body for signature verification.
app.use("/api/checkout/webhook", express.raw({ type: "application/json" }));

app.use((req, res, next) => {
  if (req.originalUrl === "/api/checkout/webhook") {
    return next();
  }
  return express.json({ limit: "100kb" })(req, res, next);
});
app.use(morgan("dev"));

const defaultFrontendOrigin = process.env.NODE_ENV === "production"
  ? "https://e-com-sabir-dev.vercel.app"
  : "http://localhost:5173";
const allowedOrigins = new Set(
  (process.env.FRONTEND_URL || defaultFrontendOrigin)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.add("http://localhost:5173");
  allowedOrigins.add("http://127.0.0.1:5173");
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    const error = new Error("Origin is not allowed by CORS");
    error.statusCode = 403;
    return callback(error);
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type", "Stripe-Signature"],
  credentials: true,
}));

app.use(sanitizeRequest);

const userRoute = require("./routes/userRoutes")
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoutes");
const checkoutRoute = require("./routes/checkoutRoutes");
const orderRoute = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoute");
const subscriberRoutes = require("./routes/subscriberRoutes");
// Admin Imports Routes
const adminRoutes = require("./routes/Admin/adminRoutes");
const adminProductRoutes = require("./routes/Admin/productAdminRoutes");
const adminOrderRoutes = require("./routes/Admin/adminOrderRoutes");
const dbConnect = require("./config/dbConnect");

app.get("/", (req, res) => {
  res.status(200).json({ message: "API Run Sucessfully" });
});
app.get("/health", (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  return res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "unavailable",
    database: databaseConnected ? "connected" : "disconnected",
  });
});
// API Routes
// Users
app.use("/api/users", userRoute);
// Products
app.use("/api/product", productRoute);
app.use("/api/products", productRoute);
// Carts
app.use("/api/cart", cartRoute);
// Checkouts
app.use("/api/checkout", checkoutRoute);
// Orders
app.use("/api/order", orderRoute);
// Uploads
app.use("/api/upload", uploadRoutes);
// Subscribe
app.use("/api/subscribe", subscriberRoutes);

// Admin Routes
app.use("/auth/admin", adminRoutes);
app.use("/auth/admin", adminProductRoutes);
app.use("/auth/admin", adminOrderRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : Number.isInteger(error.status)
      ? error.status
      : 500;
  const message = statusCode >= 500
    ? "Internal server error"
    : statusCode === 403
      ? "Origin is not allowed by CORS"
      : statusCode === 413
        ? "Request body is too large"
        : statusCode === 400
          ? "Invalid request"
          : "Request could not be completed";

  if (statusCode >= 500) {
    console.error("Unhandled request error:", error);
  }

  return res.status(statusCode).json({ message });
});

const port = process.env.PORT || 5100;
const host = process.env.HOST || "localhost";
const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must be set to at least 32 characters");
    }
    await dbConnect();
    app.listen(port, host, () => {
      console.log(`Server is running at http://${host}:${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
