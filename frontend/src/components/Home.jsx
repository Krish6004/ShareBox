import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  File,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Video as VideoIcon,
  FileArchive,
  FileText,
  Clock,
  ShieldCheck,
  Zap,
  Globe2,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Lock,
  HardDrive,
  ArrowUp,
  FolderOpen
} from 'lucide-react';
import SharePanel from './SharePanel';
import { saveUpload } from '../utils/storage';

export default function Home() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileLink, setFileLink] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const maxSize = 20 * 1024 * 1024; // 20MB
    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    const isZip =
      selectedFile.type.includes('zip') ||
      selectedFile.type.includes('compressed') ||
      selectedFile.type === 'application/octet-stream' ||
      selectedFile.name.toLowerCase().endsWith('.zip');

    if (selectedFile.size > maxSize) {
      setError('File exceeds maximum size limit of 20MB.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!isImage && !isVideo && !isZip && !isPdf) {
      setError('Unsupported file format. Please upload Images, Videos, PDFs, or ZIP archives.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (isImage || isVideo) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }

    setFile(selectedFile);
    setFileLink(null);
    setError(null);
    setUploadProgress(0);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  // Drag & drop handlers with counter to prevent child hover flicker
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleCardClick = (e) => {
    // Only open file dialog if click wasn't on an explicit button or link
    if (e.target.closest('button') || e.target.closest('a')) return;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.min(
              95,
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
            setUploadProgress(percent);
          }
        },
      });

      if (response.data && (response.data.fileLink || response.data.uuid)) {
        // Guarantee share link always points to the current active frontend domain (Vercel)
        const activeLink = response.data.uuid
          ? `${window.location.origin}/download/${response.data.uuid}`
          : response.data.fileLink.replace(/^http:\/\/localhost:\d+/, window.location.origin);

        setUploadProgress(100);
        setFileLink(activeLink);
        // Persist upload record to local dashboard storage
        saveUpload({
          fileLink: activeLink,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
      } else {
        throw new Error('Unexpected response format received from server.');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      const serverMsg =
        err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`Upload failed: ${serverMsg || 'Please try again.'}`);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setFileLink(null);
    setPreviewUrl(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* =========================================
          SECTION 1: HERO
      ========================================= */}
      <section className="w-full max-w-4xl mx-auto text-center pt-8 pb-12 sm:pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6 shadow-sm shadow-indigo-500/10"
        >
          <Sparkles size={13} className="text-cyan-400" />
          <span>Next-Generation Ephemeral File Transfer</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]"
        >
          Share Files.{' '}
          <span className="text-gradient-brand">Instantly.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed"
        >
          Fast, secure and temporary cloud file sharing for images, videos, PDFs and archives. 
          Upload in seconds — links automatically expire after 24 hours.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 text-sm"
        >
          <button
            onClick={() => {
              const el = document.getElementById('upload-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-indigo-400/30"
          >
            <UploadCloud size={18} />
            <span>Upload Files Now</span>
          </button>
          
          <a
            href="#features"
            className="px-6 py-3 rounded-xl font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-all"
          >
            Explore Features
          </a>
        </motion.div>
      </section>

      {/* =========================================
          SECTION 2: TRUST INDICATORS
      ========================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-4 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Zap size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200">Instant Speed</p>
              <p className="text-[11px] text-slate-500">Zero queue wait times</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200">24-Hour Expiry</p>
              <p className="text-[11px] text-slate-500">Auto-purged from cloud</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200">Zero Accounts</p>
              <p className="text-[11px] text-slate-500">Anonymous & private</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Globe2 size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200">Global CDN</p>
              <p className="text-[11px] text-slate-500">Cloudinary edge delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 3: UPLOAD CARD / SHARE PANEL
      ========================================= */}
      <section id="upload-section" className="w-full max-w-2xl mx-auto px-4 mb-24">
        {/* Invisible File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*,.zip,.pdf,application/pdf,application/zip"
          className="hidden"
          aria-label="Upload file selector"
        />

        <AnimatePresence mode="wait">
          {fileLink ? (
            /* FEATURE 2: Premium Share Panel */
            <SharePanel
              key="share-panel"
              fileLink={fileLink}
              file={file}
              onReset={resetUpload}
            />
          ) : (
            /* FEATURE 1: Professional Drag & Drop Upload Zone */
            <motion.div
              key="uploader-card"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: isDragging ? 1.02 : 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleCardClick}
              className={`glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden cursor-pointer transition-all duration-300 border-2 border-dashed ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_40px_rgba(6,182,212,0.3)]'
                  : file
                  ? 'border-indigo-500/50 bg-indigo-950/20 shadow-xl shadow-indigo-950/40'
                  : 'border-white/[0.12] hover:border-indigo-500/40 hover:bg-white/[0.02]'
              }`}
            >
              {/* Top ambient highlight line */}
              <div
                className={`absolute top-0 left-1/4 right-1/4 h-[1.5px] transition-all duration-500 ${
                  isDragging
                    ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-100'
                    : 'bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50'
                }`}
              />

              {/* State A: Dragging Over Helper */}
              {isDragging ? (
                <div className="flex flex-col items-center justify-center min-h-[260px] sm:min-h-[290px] text-center pointer-events-none">
                  <motion.div
                    animate={{ y: [-6, 2, -6] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-4 shadow-lg shadow-cyan-500/20"
                  >
                    <ArrowUp size={32} />
                  </motion.div>
                  <p className="text-xl font-bold text-cyan-300 tracking-tight">
                    Release file to upload
                  </p>
                  <p className="text-xs text-cyan-400/80 mt-1 font-mono">
                    Direct stream to ShareBox cloud
                  </p>
                </div>
              ) : previewUrl ? (
                /* State B: Media Preview (Image / Video) */
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-56 sm:h-64 bg-black/40 rounded-2xl border border-white/[0.08] flex items-center justify-center overflow-hidden relative mb-4">
                    {file.type.startsWith('video/') ? (
                      <video
                        src={previewUrl}
                        className="w-full h-full object-contain p-2"
                        controls={false}
                        autoPlay
                        muted
                        loop
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Selected preview"
                        className="w-full h-full object-contain p-3"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                      <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-md">
                        Click anywhere to change file
                      </span>
                    </div>
                  </div>

                  {/* File Metadata Details */}
                  <div className="w-full flex items-center justify-between px-2 pb-2">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      {file.type.startsWith('video/') ? (
                        <VideoIcon size={16} className="text-cyan-400 shrink-0" />
                      ) : (
                        <ImageIcon size={16} className="text-indigo-400 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-white truncate" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-indigo-300">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              ) : file ? (
                /* State C: Non-media Preview (PDF / ZIP) */
                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                  <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 mb-3 shadow-lg shadow-indigo-500/10">
                    {file.name.toLowerCase().endsWith('.pdf') ? (
                      <FileText size={44} className="text-rose-400" />
                    ) : (
                      <FileArchive size={44} className="text-cyan-400" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white max-w-[280px] truncate px-2">
                    {file.name}
                  </p>
                  <p className="text-xs font-mono text-indigo-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <span className="mt-3 text-xs text-slate-400 hover:text-white transition-colors">
                    Click anywhere to select a different file
                  </span>
                </div>
              ) : (
                /* State D: Default Idle Dropzone Illustration */
                <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center pointer-events-none">
                  {/* Floating Upload Illustration with Animated Beacon */}
                  <div className="relative mb-5 group">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 border border-white/[0.1] flex items-center justify-center text-slate-300 group-hover:scale-105 group-hover:border-indigo-400/50 transition-all duration-300 shadow-xl shadow-indigo-500/5">
                      <FolderOpen size={30} className="text-indigo-400" />
                    </div>

                    {/* Floating Upload Arrow */}
                    <motion.div
                      animate={{ y: [-4, 2, -4] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/40"
                    >
                      <ArrowUp size={14} />
                    </motion.div>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-slate-100 mb-1 tracking-tight">
                    Drag and drop file here, or{' '}
                    <span className="text-indigo-400 underline underline-offset-4 decoration-indigo-400/40">
                      browse
                    </span>
                  </p>

                  <p className="text-xs text-slate-400 max-w-xs mb-4">
                    Images, Videos, PDFs, and ZIP archives up to 20MB
                  </p>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-white/[0.04] px-3.5 py-1 rounded-full border border-white/[0.06]">
                    <span>Images</span> • <span>Videos</span> • <span>PDFs</span> • <span>ZIPs</span>
                  </div>
                </div>
              )}

              {/* Progress Bar (During Upload) */}
              {uploading && (
                <div className="mt-4 space-y-1.5 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1.5 text-indigo-300">
                      <Loader2 size={13} className="animate-spin text-indigo-400" />
                      Streaming to Cloudinary CDN...
                    </span>
                    <span className="font-mono text-indigo-300">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-xs text-left"
                  >
                    <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    uploading || !file
                      ? 'bg-white/[0.04] text-slate-500 cursor-not-allowed border border-white/[0.06]'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] border border-indigo-400/30'
                  }`}
                  aria-label="Upload file and generate share link"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Uploading File...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      <span>Upload & Generate Link</span>
                    </>
                  )}
                </button>

                {file && !uploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetUpload();
                    }}
                    className="py-3.5 px-4 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors flex items-center justify-center gap-1.5"
                    title="Remove selected file"
                    aria-label="Remove selected file"
                  >
                    <RefreshCw size={15} />
                    <span className="sm:hidden">Reset</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* =========================================
          SECTION 4: FEATURES
      ========================================= */}
      <section id="features" className="w-full max-w-6xl mx-auto px-4 mb-28">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
            Engineered For Speed
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Built for Seamless Temporary Sharing
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-3">
            Everything you need for effortless transfers with zero clutter, zero logs, and maximum security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Zap className="text-indigo-400" size={24} />}
            title="Instant Streaming"
            description="Direct upload pipeline with zero queuing. Cloudinary CDN delivers ultra-low latency worldwide."
          />
          <FeatureCard
            icon={<Clock className="text-cyan-400" size={24} />}
            title="Auto-24h Purge"
            description="MongoDB TTL indexing automatically purges file references after 24 hours to guarantee zero digital residue."
          />
          <FeatureCard
            icon={<Lock className="text-emerald-400" size={24} />}
            title="Private & Anonymous"
            description="No email, password, or account needed. Share direct download URLs without exposing user identities."
          />
          <FeatureCard
            icon={<FileArchive className="text-amber-400" size={24} />}
            title="Flexible Format Support"
            description="Full compatibility with high-resolution Images, 4K Videos, PDF documents, and compressed ZIP archives."
          />
          <FeatureCard
            icon={<HardDrive className="text-rose-400" size={24} />}
            title="Direct Attachment Delivery"
            description="Forced content-disposition attachments trigger instant native browser downloads without confusing interstitials."
          />
          <FeatureCard
            icon={<Globe2 className="text-purple-400" size={24} />}
            title="Cross-Device Responsive"
            description="Designed for smooth interaction across macOS, Windows, iOS, and Android mobile viewports."
          />
        </div>
      </section>

      {/* =========================================
          SECTION 5: STATISTICS
      ========================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 mb-28">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-white/[0.08]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-gradient-brand font-mono">20 MB</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">
                Max Upload Limit
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-gradient-brand font-mono">24 Hrs</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">
                TTL File Expiry
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-gradient-brand font-mono">100%</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">
                Cloud-Native Storage
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-gradient-brand font-mono">Zero</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">
                Sign-up Barrier
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 6: WHY SHAREBOX
      ========================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 mb-28">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-2">
            The Modern Alternative
          </p>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Why Share Files with ShareBox?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Zap size={20} />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">No Friction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No account creation, no password resets, no promotional emails. Drop a file, grab the link, and you are done.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Automatic Cleanup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlike cloud drives where forgotten shared folders accumulate forever, every ShareBox upload self-destructs after 24 hours.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Direct Downloads</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recipients get a clean preview portal with direct one-click attachment streaming. No pop-up advertisements or traps.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 7: FAQ ACCORDION
      ========================================= */}
      <section id="faq" className="w-full max-w-3xl mx-auto px-4 mb-24">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
            Answers & Clarity
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          <FaqItem
            question="How long are uploaded files stored?"
            answer="All files uploaded to ShareBox automatically expire exactly 24 hours after creation. Our database uses automatic TTL (Time-To-Live) indexing to remove records after 86,400 seconds."
          />
          <FaqItem
            question="What is the maximum allowable file size?"
            answer="Currently, ShareBox supports files up to 20 Megabytes (MB). This limit ensures high-speed transfers and instant streaming across global edge networks."
          />
          <FaqItem
            question="Which file types can I share?"
            answer="ShareBox accepts Images (PNG, JPG, WebP, GIF), Videos (MP4, WebM), PDF documents, and compressed ZIP archives (.zip, .x-zip-compressed)."
          />
          <FaqItem
            question="Do recipients need to install an app or sign in?"
            answer="No. Anyone with your unique ShareBox link can view a preview and download the file directly in any modern browser without installing software or registering."
          />
          <FaqItem
            question="Is my transfer private and secure?"
            answer="Yes. Files are uploaded via HTTPS TLS encryption directly into secured cloud storage. Transfers use non-sequential, randomly generated short hex identifiers that are cryptographically secure."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/[0.08]">
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-panel rounded-xl border border-white/[0.08] overflow-hidden transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-semibold text-slate-200">{question}</span>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/[0.04]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
