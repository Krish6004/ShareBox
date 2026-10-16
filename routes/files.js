const express = require("express");
const multer = require("multer");
const path = require("path");
const { storage } = require("../cloudinary");
const fileController = require("../controllers/fileController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Multer Upload Configuration with 20MB limit and format validation
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    const isPdf = file.mimetype === "application/pdf" || ext === ".pdf";
    const isZip =
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed" ||
      file.mimetype === "application/octet-stream" ||
      ext === ".zip";

    if (isImage || isVideo || isPdf || isZip) {
      cb(null, true);
    } else {
      const error = new Error("Only Images, Videos, PDFs, and Zip files are allowed.");
      error.statusCode = 400;
      cb(error, false);
    }
  },
});

const router = express.Router();

/**
 * Handle Multer errors explicitly before passing to controller
 */
const handleUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File is too large. Maximum allowed size is 20MB." });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(err.statusCode || 400).json({ error: err.message || "Invalid file upload." });
    }
    next();
  });
};

// 1. Upload route (Supports both authenticated users and anonymous uploads)
router.post("/", optionalAuth, handleUpload, fileController.uploadFile);

// 2. Health check ping route (before parameterized routes)
router.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "Ping OK" });
});

// 3. Authenticated user's uploads dashboard endpoint
router.get("/my", protect, fileController.getMyFiles);

// 4. File direct streaming download routes (placed before generic :uuid metadata routes)
router.get("/:uuid/download", fileController.downloadFile);
router.get("/files/:uuid/download", fileController.downloadFile);
router.get("/download/:uuid", fileController.downloadFile);

// 5. File metadata & download info routes
router.get("/files/:uuid", fileController.getFileMetadata);
router.get("/:uuid", fileController.getFileMetadata);

// 6. Delete file route (Removes from both MongoDB Atlas and Cloudinary)
router.delete("/files/:uuid", protect, fileController.deleteFile);
router.delete("/:uuid", protect, fileController.deleteFile);

module.exports = router;
