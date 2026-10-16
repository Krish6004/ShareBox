const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
    },
    uuid: {
      type: String,
      required: [true, "UUID is required"],
      unique: true,
      index: true,
      trim: true,
    },
    path: {
      type: String,
      required: [true, "File path URL is required"],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    fileType: {
      type: String,
      default: "application/octet-stream",
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // TTL index: document automatically expires after 24 hours (86,400 seconds)
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false,
  }
);

// Ensure index creation without unhandled rejection warnings
const File = mongoose.model("File", fileSchema);

module.exports = File;
