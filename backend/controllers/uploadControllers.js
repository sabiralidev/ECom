const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const logger = require("../utils/logger");

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   // Fixed: no spaces or `-` in env names
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
      const error = new Error("Only JPEG, PNG, WebP, and GIF images are supported");
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

const hasValidImageSignature = (file) => {
  const buffer = file?.buffer;
  if (!Buffer.isBuffer(buffer)) {
    return false;
  }

  switch (file.mimetype) {
    case "image/jpeg":
      return buffer.length >= 3 &&
        buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/png":
      return buffer.length >= 8 &&
        buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/webp":
      return buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP";
    case "image/gif":
      return buffer.length >= 6 &&
        ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6));
    default:
      return false;
  }
};

const adminImageUpload = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Image must be 5 MB or smaller" });
      }
      if (error.statusCode === 400) {
        return res.status(400).json({ message: error.message });
      }
      logger.warn({ err: error }, "image upload request rejected");
      return res.status(400).json({ message: "Image upload request was rejected" });
    }
    if (req.file && !hasValidImageSignature(req.file)) {
      return res.status(400).json({ message: "Image contents do not match a supported image format" });
    }
    return next();
  });
};

// Function to stream upload to Cloudinary
const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error || new Error("Image provider did not return an upload result"));
      }
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Controller function for uploading
const uploads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({ message: "Image upload is not configured on this server" });
    }

    const result = await streamUpload(req.file.buffer);
    return res.status(201).json({ imageUrl: result.secure_url });
  } catch (error) {
    logger.error({ err: error }, "image upload failed");
    return res.status(500).json({
      message: "Server error while uploading image",
    });
  }
};

module.exports = {
  adminImageUpload,
  uploads,
  hasValidImageSignature,
};
