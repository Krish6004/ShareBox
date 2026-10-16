# 📦 ShareBox — Share Files. Instantly.

**ShareBox** is a high-speed, privacy-first ephemeral cloud file sharing application designed with a 2026 modern SaaS aesthetic. Upload media, documents, and archives with automated 24-hour expiration, instantaneous global CDN delivery, and zero sign-up friction.

> 💡 Built with React 19, Vite, Tailwind CSS, Node.js, Express, MongoDB Atlas, and Cloudinary.

---

## ⚡ Key Highlights

- ⚡ **Instant Transfers**: Stream directly to global Cloudinary edge buckets with zero queuing.
- 🕒 **24-Hour Auto-Expiry**: MongoDB TTL indexes automatically purge expired documents after 86,400 seconds.
- 🔒 **Zero Sign-Up Required**: Share direct download links anonymously with zero credential friction.
- 📂 **Multi-Format Support**: Images (PNG, JPG, WebP), Videos (MP4, WebM), PDF documents, and ZIP archives up to 20MB.
- 📱 **Universal Cross-Platform**: Responsive glassmorphism interface across mobile, tablet, and desktop viewports.
- 📥 **Direct Attachment Streaming**: Downloads trigger native browser file saving via Cloudinary attachment transformations.

---

## 🛠️ Technology Stack

### Frontend Client
- **React 19** + **Vite 7**
- **Tailwind CSS v4** + Custom Glassmorphism System
- **Framer Motion 12**
- **Lucide React**
- **Axios** (Proxy-enabled)

### Backend Microservice
- **Node.js** + **Express 5**
- **Multer** + **multer-storage-cloudinary**
- **MongoDB Atlas** with Mongoose 8 (Connection pooling + 24h TTL)
- **Cloudinary SDK v2** (Auto resource classification)

---

## 🚀 Getting Started

### 1. Configure Environment
Create a `.env` file in the root directory:
```env
PORT=5050
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Start Backend Server
```bash
npm install
npm start
```

### 3. Start Frontend Client
```bash
cd frontend
npm install
npm run dev
```

The application will be live at `http://localhost:5173/`.
