# 🚀 Deployment Guide: ShareBox

This guide walks you through deploying **ShareBox** to production with:
- **Frontend** deployed on **Vercel**
- **Backend API** deployed on **Render**
- **Storage & Database**: Cloudinary & MongoDB Atlas

---

## 1. Deploy the Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your GitHub repository: `https://github.com/Krish6004/ShareBox`.
3. Configure the Web Service settings:
   - **Name**: `sharebox-backend` (or your choice)
   - **Region**: Choose the region closest to you
   - **Branch**: `main`
   - **Root Directory**: `.` (leave empty or dot)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Add **Environment Variables** in Render (under Environment):
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5050` | Port for Express server |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary Cloud Name |
   | `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API Key |
   | `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary API Secret |
   | `JWT_SECRET` | `your_super_secret_jwt_key` | Secret string for user JWTs |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL (without trailing slash) |
5. Click **Deploy Web Service**.
6. Once deployed, copy your Render service URL (e.g. `https://sharebox-backend.onrender.com`).

---

## 2. Deploy the Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
2. Import the `ShareBox` repository from GitHub.
3. Configure project settings:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click `Edit` and select `frontend` (or leave default root as `vercel.json` handles both)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://sharebox-backend.onrender.com` *(Your Render URL without trailing slash)* |
5. Click **Deploy**.
6. Once deployment finishes, Vercel gives you your live URL (e.g., `https://sharebox-client.vercel.app`).

---

## 3. Link Frontend and Backend

1. In Render, update the `CLIENT_URL` environment variable with your actual Vercel URL (e.g., `https://sharebox-client.vercel.app`).
2. Trigger a redeploy on Render so the new `CLIENT_URL` is active.

---

## 4. Verification Checklist

- [ ] Visit your Vercel URL: The home page and dropzone should load smoothly.
- [ ] Upload an image, video, or PDF file: Verify the progress bar finishes and the QR code / share link appears.
- [ ] Open the share link (`/download/:uuid`) in an incognito window: The file card and preview should appear.
- [ ] Click **Download Now**: The file should download directly to your computer.
- [ ] Test User Authentication: Sign up, log in, and view your uploaded files in the dashboard.
