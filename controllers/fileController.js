const path = require("path");
const crypto = require("crypto");
const https = require("https");
const http = require("http");
const File = require("../models/File");
const User = require("../models/User");
const { cloudinary } = require("../cloudinary");
const connectDB = require("../db");

// Short ID Generator (8 chars hex = 4 bytes)
const generateShortId = () => crypto.randomBytes(4).toString("hex");

// Dynamically determine the frontend client base URL from request origin/referer or env
const getClientBaseUrl = (req) => {
  const origin = req.get("origin") || req.get("referer");
  if (origin && !origin.includes("localhost")) {
    try {
      return new URL(origin).origin;
    } catch (_) {
      return origin.replace(/\/+$/, "");
    }
  }
  if (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes("localhost")) {
    return process.env.CLIENT_URL.trim().replace(/\/+$/, "");
  }
  if (origin) {
    try {
      return new URL(origin).origin;
    } catch (_) {
      return origin.replace(/\/+$/, "");
    }
  }
  return (process.env.CLIENT_URL || "http://localhost:5173").trim().replace(/\/+$/, "");
};

/**
 * @route   POST /api (or POST /api/files)
 * @desc    Upload file to Cloudinary & MongoDB (associates with user if authenticated)
 * @access  Public / Optional Auth
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const cloudUrl = req.file?.path || req.file?.secure_url;
    if (!cloudUrl) {
      console.error("❌ Cloudinary URL missing in upload response");
      return res.status(500).json({ error: "Cloudinary upload failed: file URL not found." });
    }

    // Check if MongoDB is configured
    if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === "") {
      return res.status(503).json({
        error: "Database not configured yet. Please configure MONGO_URI in .env to save share links.",
        cloudUrl,
      });
    }

    await connectDB();

    const publicId = req.file?.filename || null;
    const fileSize = req.file.size || 0;
    const fileType = req.file.mimetype || "application/octet-stream";
    const ownerId = req.user ? req.user._id : null;

    const newFile = new File({
      filename: req.file.originalname,
      uuid: generateShortId(),
      path: cloudUrl,
      size: fileSize,
      owner: ownerId,
      fileType,
      cloudinaryPublicId: publicId,
    });

    const response = await newFile.save();

    // If uploaded by an authenticated user, update their storage quota & upload count
    if (ownerId) {
      await User.findByIdAndUpdate(ownerId, {
        $inc: {
          uploads: 1,
          storageUsed: fileSize,
        },
      });
    }

    const clientURL = getClientBaseUrl(req);
    const fileLink = `${clientURL}/download/${response.uuid}`;

    return res.json({
      fileLink,
      uuid: response.uuid,
      fileName: response.filename,
      fileSize: (fileSize / 1024 / 1024).toFixed(2) + " MB",
      owner: ownerId,
      createdAt: response.createdAt,
    });
  } catch (routeErr) {
    console.error("❌ Error saving file record:", routeErr);
    return res.status(500).json({ error: routeErr.message || "Something went wrong while processing the file." });
  }
};

/**
 * @route   GET /api/files/:uuid (also GET /files/:uuid)
 * @desc    Get file metadata & increment download count
 * @access  Public
 */
const getFileMetadata = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    // Validate UUID format
    if (!uuid || typeof uuid !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(uuid)) {
      return res.status(400).json({ message: "Invalid file identifier format." });
    }

    if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === "") {
      return res.status(503).json({ message: "Database not configured yet. Please configure MONGO_URI in .env." });
    }

    await connectDB();
    const file = await File.findOne({ uuid });
    if (!file) {
      return res.status(404).json({ message: "File not found or expired." });
    }

    // Increment download count on File and owner User
    file.downloadCount = (file.downloadCount || 0) + 1;
    await file.save();

    if (file.owner) {
      await User.findByIdAndUpdate(file.owner, {
        $inc: { downloads: 1 },
      }).catch((err) => console.error("Error updating user download count:", err));
    }

    // Generate signed authenticated Cloudinary download URL (bypasses ACL restrictions on free accounts)
    const ext = path.extname(file.filename || "").replace(".", "").toLowerCase();
    let resourceType = "image";
    if (file.path && file.path.includes("/video/upload/")) {
      resourceType = "video";
    } else if (file.path && file.path.includes("/raw/upload/")) {
      resourceType = "raw";
    }

    let signedDownloadUrl = file.path;
    if (file.cloudinaryPublicId) {
      try {
        signedDownloadUrl = cloudinary.utils.private_download_url(
          file.cloudinaryPublicId,
          resourceType === "raw" ? "" : ext,
          {
            resource_type: resourceType,
            type: "upload",
            attachment: true,
            expires_at: Math.floor(Date.now() / 1000) + 86400,
          }
        );
      } catch (signErr) {
        console.warn("Could not generate signed download URL:", signErr.message);
      }
    }

    return res.json({
      fileName: file.filename,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
      cloudLink: file.path,
      downloadLink: `/api/files/${file.uuid}/download`,
      directDownloadUrl: signedDownloadUrl,
      downloadCount: file.downloadCount,
      fileType: file.fileType,
      createdAt: file.createdAt,
      uuid: file.uuid,
    });
  } catch (err) {
    console.error("❌ Error fetching file:", err);
    return res.status(500).json({ message: "Something went wrong retrieving the file." });
  }
};

/**
 * @route   GET /api/files/my
 * @desc    Get all files uploaded by the authenticated user
 * @access  Private
 */
const getMyFiles = async (req, res, next) => {
  try {
    await connectDB();

    const files = await File.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const clientURL = getClientBaseUrl(req);

    const formattedFiles = files.map((file) => {
      // Calculate remaining TTL (24h = 86400s)
      const createdAtMs = new Date(file.createdAt).getTime();
      const expiresAtMs = createdAtMs + 24 * 60 * 60 * 1000;
      const nowMs = Date.now();
      const isExpired = nowMs >= expiresAtMs;
      const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000));

      let category = "other";
      const mime = (file.fileType || "").toLowerCase();
      const ext = path.extname(file.filename || "").toLowerCase();
      if (mime.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) {
        category = "image";
      } else if (mime.startsWith("video/") || [".mp4", ".webm", ".mov", ".mkv"].includes(ext)) {
        category = "video";
      } else if (mime === "application/pdf" || ext === ".pdf") {
        category = "pdf";
      } else if (mime.includes("zip") || mime.includes("compressed") || [".zip", ".tar", ".gz", ".7z"].includes(ext)) {
        category = "zip";
      }

      return {
        id: file.uuid,
        uuid: file.uuid,
        fileName: file.filename,
        fileSize: file.size,
        fileType: file.fileType || "application/octet-stream",
        category,
        fileLink: `${clientURL}/download/${file.uuid}`,
        cloudLink: file.path,
        uploadedAt: file.createdAt,
        expiresAt: new Date(expiresAtMs).toISOString(),
        downloadCount: file.downloadCount || 0,
        storageProvider: "Cloudinary",
        database: "MongoDB Atlas",
        qrGenerated: true,
        status: isExpired ? "expired" : "active",
        isExpired,
        remainingSeconds,
      };
    });

    const totalStorageBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
    const totalDownloads = files.reduce((acc, f) => acc + (f.downloadCount || 0), 0);
    const activeLinksCount = formattedFiles.filter((f) => !f.isExpired).length;

    return res.json({
      files: formattedFiles,
      stats: {
        totalFiles: files.length,
        activeFiles: activeLinksCount,
        totalStorageBytes,
        totalDownloads,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/files/:uuid
 * @desc    Delete file from MongoDB AND Cloudinary
 * @access  Private
 */
const deleteFile = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    await connectDB();
    const file = await File.findOne({ uuid });
    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    // Verify ownership
    if (!file.owner || file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this file." });
    }

    // 1. Delete from Cloudinary
    if (file.cloudinaryPublicId) {
      try {
        const mime = (file.fileType || "").toLowerCase();
        let resourceType = "image";
        if (mime.startsWith("video/")) {
          resourceType = "video";
        } else if (
          mime.includes("zip") ||
          mime.includes("pdf") ||
          mime.includes("octet-stream") ||
          file.filename.endsWith(".zip") ||
          file.filename.endsWith(".pdf")
        ) {
          resourceType = "raw";
        }

        const cloudRes = await cloudinary.uploader.destroy(file.cloudinaryPublicId, {
          resource_type: resourceType,
        });

        // Fallback: if not found under initial resource type, try raw/image
        if (cloudRes.result !== "ok") {
          await cloudinary.uploader.destroy(file.cloudinaryPublicId, { resource_type: "raw" });
          await cloudinary.uploader.destroy(file.cloudinaryPublicId, { resource_type: "image" });
        }
      } catch (cloudErr) {
        console.warn("⚠️ Warning: Cloudinary destruction returned:", cloudErr.message);
      }
    }

    // 2. Decrement User metrics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        uploads: -1,
        storageUsed: -file.size,
      },
    });

    // Ensure non-negative values
    await User.updateOne(
      { _id: req.user._id, uploads: { $lt: 0 } },
      { $set: { uploads: 0 } }
    );
    await User.updateOne(
      { _id: req.user._id, storageUsed: { $lt: 0 } },
      { $set: { storageUsed: 0 } }
    );

    // 3. Delete from MongoDB Atlas
    await File.deleteOne({ _id: file._id });

    return res.json({
      message: "File successfully deleted from MongoDB and Cloudinary.",
      uuid,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/files/:uuid/download
 * @desc    Direct download streaming with authenticated Cloudinary signed URL
 * @access  Public
 */
const downloadFile = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    if (!uuid || typeof uuid !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(uuid)) {
      return res.status(400).json({ message: "Invalid file identifier format." });
    }

    await connectDB();
    const file = await File.findOne({ uuid });
    if (!file) {
      return res.status(404).json({ message: "File not found or expired." });
    }

    // Increment download count
    file.downloadCount = (file.downloadCount || 0) + 1;
    await file.save();

    if (file.owner) {
      await User.findByIdAndUpdate(file.owner, {
        $inc: { downloads: 1 },
      }).catch((err) => console.error("Error updating user download count:", err));
    }

    // Determine extension and Cloudinary resource_type
    const ext = path.extname(file.filename || "").replace(".", "").toLowerCase();
    let resourceType = "image";
    if (file.path && file.path.includes("/video/upload/")) {
      resourceType = "video";
    } else if (file.path && file.path.includes("/raw/upload/")) {
      resourceType = "raw";
    }

    // Generate authenticated signed Cloudinary download URL
    let downloadUrl = file.path;
    if (file.cloudinaryPublicId) {
      try {
        downloadUrl = cloudinary.utils.private_download_url(
          file.cloudinaryPublicId,
          resourceType === "raw" ? "" : ext,
          {
            resource_type: resourceType,
            type: "upload",
            attachment: true,
            expires_at: Math.floor(Date.now() / 1000) + 86400,
          }
        );
      } catch (signErr) {
        console.warn("Could not generate signed download URL, falling back to file.path:", signErr.message);
      }
    }

    // Set proper attachment headers so the browser triggers native saving with the original filename
    const encodedFilename = encodeURIComponent(file.filename);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`
    );
    if (file.fileType) {
      res.setHeader("Content-Type", file.fileType);
    }

    // Stream the file directly from Cloudinary to client
    const client = downloadUrl.startsWith("https") ? https : http;
    const streamReq = client.get(downloadUrl, (cloudRes) => {
      if (cloudRes.statusCode >= 200 && cloudRes.statusCode < 300) {
        if (cloudRes.headers["content-length"]) {
          res.setHeader("Content-Length", cloudRes.headers["content-length"]);
        } else if (file.size) {
          res.setHeader("Content-Length", file.size);
        }
        cloudRes.pipe(res);
      } else {
        console.warn(`Cloudinary returned status ${cloudRes.statusCode}, redirecting to download URL...`);
        return res.redirect(downloadUrl);
      }
    });

    streamReq.on("error", (err) => {
      console.error("Download streaming error:", err.message);
      if (!res.headersSent) {
        return res.redirect(downloadUrl);
      }
    });
  } catch (err) {
    console.error("❌ Error in downloadFile controller:", err);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Something went wrong downloading the file." });
    }
  }
};

module.exports = {
  uploadFile,
  getFileMetadata,
  getMyFiles,
  deleteFile,
  downloadFile,
};
