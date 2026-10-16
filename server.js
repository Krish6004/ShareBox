// server.js
require("dotenv").config();

// STEP 1: Startup Environment Validation
const requiredEnvVars = [
  "PORT",
  "CLIENT_URL",
  "MONGO_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingEnvVars = requiredEnvVars.filter(
  (key) => !process.env[key] || process.env[key].trim() === ""
);

if (missingEnvVars.length > 0) {
  console.error("\n❌ SERVER STARTUP FAILED: Missing required environment variable(s):");
  missingEnvVars.forEach((key) => {
    console.error(`   - ${key}`);
  });
  console.error("Please ensure these variables are defined in your .env file.\n");
  process.exit(1);
}

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
const { cloudinary } = require("./cloudinary");
const File = require("./models/File");
const User = require("./models/User");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Security Headers via Helmet (allow cross-origin resources for downloads & media)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// Secure CORS Configuration with Credentials support
const clientUrlClean = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim().replace(/\/+$/, '') : null;
const allowedOrigins = [
  clientUrlClean,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.trim().replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        (clientUrlClean && cleanOrigin === clientUrlClean) ||
        cleanOrigin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body Parsers & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount Routes
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api", fileRoutes); // Preserves exact legacy endpoints: POST /api, GET /api/files/:uuid
app.use("/files", fileRoutes);

// API Status & Health Routes
app.get("/hi", (req, res) => {
  res.send("Hello World!");
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "ShareBox API",
    message: "ShareBox Authenticated Cloud Platform API is operational",
    version: "2.5.0",
  });
});

// Centralized Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

async function startServer() {
  console.log("✓ Environment Loaded");

  // Verify Cloudinary configuration
  const cloudConfig = cloudinary.config();
  if (!cloudConfig.cloud_name || !cloudConfig.api_key) {
    console.error("❌ Cloudinary initialization failed: Credentials not configured properly.");
    process.exit(1);
  }
  console.log("✓ Cloudinary Connected");

  // Connect to MongoDB Atlas & ensure indexes
  try {
    await connectDB();
    await File.init();
    await User.init();
    console.log("✓ MongoDB Connected & Indexes Initialized");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }

  console.log("✓ Routes Loaded: /api/auth, /api/files, /api");
  console.log("✓ Backend Ready");

  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
