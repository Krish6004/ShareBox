import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Trash2,
  BarChart3,
  Clock,
  HardDrive,
  FileText,
  FileArchive,
  Image as ImageIcon,
  Video as VideoIcon,
  File,
  AlertCircle
} from 'lucide-react';
import {
  formatFileSize,
  formatUploadDate,
  getExpiryCountdown,
  incrementDownloadCount,
} from '../utils/storage';

export default function UploadCard({
  file,
  onOpenAnalytics,
  onOpenQR,
  onDelete,
  onNotify,
}) {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const downloadUrl = file.fileLink || `${window.location.origin}/download/${file.uuid}`;
  const countdown = getExpiryCountdown(file.expiresAt);
  const isActive = !countdown.isExpired;

  const handleCopyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    if (onNotify) onNotify('Share link copied to clipboard!');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenLink = (e) => {
    e.stopPropagation();
    incrementDownloadCount(file.uuid);
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleQRClick = (e) => {
    e.stopPropagation();
    onOpenQR(file);
  };

  const handleAnalyticsClick = (e) => {
    e.stopPropagation();
    onOpenAnalytics(file);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (isDeleting) {
      onDelete(file.uuid);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  const getFileCategoryVisuals = () => {
    switch (file.category) {
      case 'image':
        return {
          icon: <ImageIcon size={20} className="text-indigo-400" />,
          bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
          badge: 'Image',
        };
      case 'video':
        return {
          icon: <VideoIcon size={20} className="text-cyan-400" />,
          bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
          badge: 'Video',
        };
      case 'pdf':
        return {
          icon: <FileText size={20} className="text-rose-400" />,
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          badge: 'PDF',
        };
      case 'zip':
        return {
          icon: <FileArchive size={20} className="text-amber-400" />,
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          badge: 'ZIP',
        };
      default:
        return {
          icon: <File size={20} className="text-slate-400" />,
          bg: 'bg-white/[0.05] border-white/[0.1] text-slate-300',
          badge: 'File',
        };
    }
  };

  const visual = getFileCategoryVisuals();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={() => onOpenAnalytics(file)}
      className="glass-panel group relative rounded-2xl p-5 border border-white/[0.08] hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Top ambient highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/50 transition-all duration-500" />

      {/* Card Header: Category Icon & Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner ${visual.bg}`}>
            {visual.icon}
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block mb-0.5">
              {visual.badge}
            </span>
            <h3
              className="text-sm font-bold text-white tracking-tight truncate max-w-[190px] sm:max-w-[210px] group-hover:text-indigo-300 transition-colors"
              title={file.fileName}
            >
              {file.fileName}
            </h3>
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
            isActive
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          {isActive ? 'Active' : 'Expired'}
        </span>
      </div>

      {/* File Specs & Expiry Row */}
      <div className="space-y-3 mb-4">
        {/* Size & Upload Time */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <HardDrive size={13} className="text-slate-400" />
            <span className="font-mono text-slate-200 font-medium">
              {formatFileSize(file.fileSize)}
            </span>
          </span>

          <span className="text-slate-400 text-[11px]">
            {formatUploadDate(file.uploadedAt)}
          </span>
        </div>

        {/* Expiry Countdown & Progress Bar */}
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Clock size={12} className={isActive ? 'text-amber-400' : 'text-rose-400'} />
              <span>Expiry Window</span>
            </span>
            <span className={`font-mono text-[11px] font-medium ${isActive ? 'text-amber-300' : 'text-rose-400'}`}>
              {countdown.label}
            </span>
          </div>

          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${countdown.progress}%` }}
            />
          </div>
        </div>

        {/* Truncated Share Link preview */}
        <div className="flex items-center gap-1.5 bg-[#080D1A] rounded-xl px-2.5 py-1.5 border border-white/[0.06] text-xs">
          <span className="text-slate-400 text-[11px] font-mono shrink-0 select-none">
            link:
          </span>
          <span className="font-mono text-indigo-300 truncate text-[11px] select-all flex-1">
            {downloadUrl.replace(/^https?:\/\//, '')}
          </span>
          <button
            onClick={handleCopyLink}
            className="p-1 hover:text-white rounded hover:bg-white/[0.06] text-slate-400 transition-colors shrink-0"
            title="Copy direct share link"
            aria-label="Copy share link"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Quick Actions Toolbar */}
      <div
        className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          {/* Copy Link Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleCopyLink}
            className={`p-2 rounded-xl text-xs font-semibold transition-all border ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/[0.08]'
            }`}
            title="Copy share link"
            aria-label="Copy share link"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </motion.button>

          {/* Open Link Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleOpenLink}
            className="p-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            title="Open download page"
            aria-label="Open download page"
          >
            <ExternalLink size={14} className="text-cyan-400" />
          </motion.button>

          {/* QR Code Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleQRClick}
            className="p-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            title="View & Download QR Code"
            aria-label="View QR Code"
          >
            <QrCode size={14} className="text-purple-400" />
          </motion.button>

          {/* Analytics Drawer Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleAnalyticsClick}
            className="p-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            title="View File Analytics"
            aria-label="View File Analytics"
          >
            <BarChart3 size={14} className="text-indigo-400" />
          </motion.button>
        </div>

        {/* Delete Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleDeleteClick}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 border ${
            isDeleting
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border-transparent hover:border-rose-500/20'
          }`}
          title={isDeleting ? 'Click again to confirm delete' : 'Remove from dashboard'}
          aria-label="Delete file from dashboard"
        >
          <Trash2 size={13} />
          {isDeleting && <span className="text-[11px] font-semibold">Confirm?</span>}
        </motion.button>
      </div>
    </motion.div>
  );
}
