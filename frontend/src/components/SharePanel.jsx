import React, { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Cloud,
  FileText,
  FileArchive,
  Image as ImageIcon,
  Video as VideoIcon,
  File,
  RotateCcw,
  Sparkles,
  Loader2,
  LayoutDashboard
} from 'lucide-react';

// Lazy load QR Code component to preserve minimal initial bundle size
const QRCodeCard = lazy(() => import('./QRCodeCard'));

function QRCodeSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col items-center justify-center text-center h-full min-h-[280px]">
      <Loader2 size={24} className="animate-spin text-cyan-400 mb-2" />
      <span className="text-xs text-slate-400">Rendering QR Code...</span>
    </div>
  );
}

export default function SharePanel({ fileLink, file, onReset }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!fileLink) return;
    navigator.clipboard.writeText(fileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getFileIcon = (name, type) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
      return <ImageIcon size={16} className="text-indigo-400" />;
    }
    if (type?.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext)) {
      return <VideoIcon size={16} className="text-cyan-400" />;
    }
    if (type === 'application/pdf' || ext === 'pdf') {
      return <FileText size={16} className="text-rose-400" />;
    }
    if (ext === 'zip' || type?.includes('zip') || type?.includes('compressed')) {
      return <FileArchive size={16} className="text-amber-400" />;
    }
    return <File size={16} className="text-slate-400" />;
  };

  const formattedSize = file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : '0.00 MB';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 15 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-500/5"
    >
      {/* Top emerald glow line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 mb-6 border-b border-white/[0.08] text-center sm:text-left">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={28} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              File Uploaded Successfully
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Your file has been securely uploaded and is ready to share.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout (Side-by-side on desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
        {/* Left Column: Link & File Details */}
        <div className="flex flex-col justify-between space-y-5">
          {/* Share Link Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Share Link</span>
              <span className="text-[11px] font-mono text-indigo-400 font-normal">Direct Access</span>
            </label>

            <div className="flex items-center gap-2 bg-[#0B1020]/90 rounded-xl p-2.5 pl-3 border border-white/[0.1] focus-within:border-indigo-500/60 transition-colors">
              <input
                type="text"
                readOnly
                value={fileLink}
                onClick={(e) => e.target.select()}
                className="bg-transparent text-xs sm:text-sm text-indigo-300 font-mono w-full outline-none truncate select-all"
                aria-label="Generated download URL"
              />
            </div>

            {/* Link Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyToClipboard}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border shadow-sm ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/30 shadow-indigo-600/20'
                }`}
                aria-label="Copy download link to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Link</span>
                  </>
                )}
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={fileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center justify-center gap-1.5"
                aria-label="Open download link in a new tab"
              >
                <ExternalLink size={14} className="text-cyan-400" />
                <span>Open Link</span>
              </motion.a>
            </div>
          </div>

          {/* File Details Grid */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Transfer Specifications
            </span>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                {file ? getFileIcon(file.name, file.type) : <File size={15} />}
                <span>File Name</span>
              </span>
              <span className="font-semibold text-white truncate max-w-[170px]" title={file?.name}>
                {file?.name || 'Uploaded File'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">File Size</span>
              <span className="font-mono text-indigo-300 font-medium">{formattedSize}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock size={13} className="text-amber-400" />
                <span>Expiration</span>
              </span>
              <span className="text-amber-300 font-medium">24 Hours (TTL)</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cloud size={13} className="text-cyan-400" />
                <span>Storage</span>
              </span>
              <span className="text-cyan-300 font-medium">Cloudinary CDN</span>
            </div>
          </div>
        </div>

        {/* Right Column: Scan to Download QR Code (Lazy loaded) */}
        <div>
          <Suspense fallback={<QRCodeSkeleton />}>
            <QRCodeCard url={fileLink} fileName={file?.name} />
          </Suspense>
        </div>
      </div>

      {/* Primary Reset & Dashboard Actions */}
      <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-slate-400 hidden sm:inline">
          Files are automatically purged after 24 hours.
        </span>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/uploads"
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={16} className="text-cyan-400" />
            <span>View in Dashboard</span>
          </Link>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            aria-label="Upload another file and reset upload panel"
          >
            <RotateCcw size={16} />
            <span>Upload Another File</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
