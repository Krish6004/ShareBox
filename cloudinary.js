// cloudinary.js
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// Configure Cloudinary v2 SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;

    // Retain file extension in public_id for raw files (like zip archives) so downloaded files keep their extension
    const isRaw = file.mimetype.includes("zip") || file.mimetype.includes("octet-stream") || ext === ".zip";
    const publicId = isRaw
      ? `${uniqueSuffix}-${baseName}${ext}`
      : `${uniqueSuffix}-${baseName}`;

    return {
      folder: "quickshare",
      resource_type: "auto",
      public_id: publicId,
    };
  },
});

module.exports = {
  cloudinary,
  storage,
};
