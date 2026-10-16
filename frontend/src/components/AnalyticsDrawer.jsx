import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Download,
  Clock,
  Database,
  Cloud,
  QrCode,
  ShieldCheck,
  HardDrive,
  Activity,
  FileText,
  FileArchive,
  Image as ImageIcon,
  Video as VideoIcon,
  File,
  Sparkles,
  Trash2,
  Share2,
  KeyRound,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  formatFileSize,
  formatUploadDate,
  getExpiryCountdown,
  incrementDownloadCount,
} from '../utils/storage';

export default function AnalyticsDrawer({
  file,
  isOpen,
  onClose,
  onDelete,
  onNotify,
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [qrDownloaded, setQrDownloaded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!file) return null;

  const downloadUrl = file.fileLink || `${window.location.origin}/download/${file.uuid}`;
  const countdown = getExpiryCountdown(file.expiresAt);
  const isActive = !countdown.isExpired;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopiedLink(true);
    if (onNotify) onNotify('Share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyUuid = () => {
    navigator.clipboard.writeText(file.uuid);
    setCopiedUuid(true);
    if (onNotify) onNotify('UUID copied to clipboard!');
    setTimeout(() => setCopiedUuid(false), 2500);
  };

  const handleOpenPage = () => {
    incrementDownloadCount(file.uuid);
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById(`drawer-qr-${file.uuid}`);
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    const cleanName = (file.fileName || 'sharebox').replace(/\.[^/.]+$/, '');
    a.download = `sharebox-qr-${cleanName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setQrDownloaded(true);
    if (onNotify) onNotify('QR Code saved as PNG image!');
    setTimeout(() => setQrDownloaded(false), 2500);
  };

  const getFileCategoryIcon = () => {
    switch (file.category) {
      case 'image':
        return <ImageIcon size={22} className="text-indigo-400" />;
      case 'video':
        return <VideoIcon size={22} className="text-cyan-400" />;
      case 'pdf':
        return <FileText size={22} className="text-rose-400" />;
      case 'zip':
        return <FileArchive size={22} className="text-amber-400" />;
      default:
        return <File size={22} className="text-slate-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-xl bg-[#0B1020] border-l border-white/[0.1] shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 z-20 bg-[#0B1020]/90 backdrop-blur-xl border-b border-white/[0.08] p-5 sm:p-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner">
                    {getFileCategoryIcon()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        File Analytics
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
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
                    <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md mt-0.5" title={file.fileName}>
                      {file.fileName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  aria-label="Close drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 sm:p-6 space-y-6 flex-1">
                {/* 4 Core Metric KPI Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Status & TTL */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-amber-400" />
                        Expiration
                      </span>
                      <span className="font-mono text-[10px] text-amber-400/80">24h TTL</span>
                    </div>
                    <div className="text-sm font-bold text-white tracking-tight mt-1">
                      {countdown.label}
                    </div>
                    <div className="w-full bg-white/[0.05] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${countdown.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Downloads & Opens */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Activity size={13} className="text-cyan-400" />
                        Downloads
                      </span>
                      <span className="font-mono text-[10px] text-cyan-400/80">Tracked</span>
                    </div>
                    <div className="text-sm font-bold text-white tracking-tight mt-1">
                      {file.downloadCount || 0}{' '}
                      <span className="text-xs font-normal text-slate-400">requests</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      <span>Verified CDN delivery</span>
                    </div>
                  </div>

                  {/* File Size */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="flex items-center gap-1.5">
                        <HardDrive size={13} className="text-indigo-400" />
                        File Size
                      </span>
                      <span className="font-mono text-[10px] text-indigo-400/80">Original</span>
                    </div>
                    <div className="text-sm font-bold text-white tracking-tight mt-1">
                      {formatFileSize(file.fileSize)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 truncate">
                      {file.fileType || 'binary/octet-stream'}
                    </div>
                  </div>

                  {/* Storage Provider */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Cloud size={13} className="text-cyan-400" />
                        Storage Provider
                      </span>
                      <span className="font-mono text-[10px] text-cyan-400/80">Active</span>
                    </div>
                    <div className="text-sm font-bold text-cyan-300 tracking-tight mt-1 flex items-center gap-1.5">
                      <span>Cloudinary</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <ShieldCheck size={11} className="text-emerald-400" />
                      <span>Encrypted at rest</span>
                    </div>
                  </div>
                </div>

                {/* Direct Share Link Bar */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 size={13} className="text-indigo-400" />
                      Direct Share Link
                    </span>
                    <span className="text-[11px] text-indigo-400 font-mono">Receiver Endpoint</span>
                  </div>

                  <div className="flex items-center gap-2 bg-[#080D1A] rounded-xl p-2.5 border border-white/[0.08]">
                    <input
                      type="text"
                      readOnly
                      value={downloadUrl}
                      onClick={(e) => e.target.select()}
                      className="bg-transparent text-xs text-indigo-300 font-mono w-full outline-none truncate select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shrink-0 transition-colors"
                      title="Copy link"
                    >
                      {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleOpenPage}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
                      title="Open in new tab"
                    >
                      <ExternalLink size={14} className="text-cyan-400" />
                    </button>
                  </div>
                </div>

                {/* Detailed Architecture Specifications List */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Layers size={13} className="text-indigo-400" />
                    Technical Metadata & Verification
                  </h3>

                  <div className="space-y-2.5 text-xs divide-y divide-white/[0.04]">
                    {/* UUID */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <KeyRound size={13} className="text-slate-400" />
                        UUID
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-indigo-300">
                        <span>{file.uuid}</span>
                        <button
                          onClick={handleCopyUuid}
                          className="p-1 hover:text-white rounded hover:bg-white/[0.06] transition-colors"
                          title="Copy UUID"
                        >
                          {copiedUuid ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Upload Time */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        Upload Time
                      </span>
                      <span className="text-white font-medium">
                        {formatUploadDate(file.uploadedAt)}
                      </span>
                    </div>

                    {/* Database */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Database size={13} className="text-emerald-400" />
                        Database
                      </span>
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        <span>MongoDB Atlas</span>
                        <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          TTL Index: 86400s
                        </span>
                      </span>
                    </div>

                    {/* Storage */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Cloud size={13} className="text-cyan-400" />
                        Storage Provider
                      </span>
                      <span className="text-cyan-300 font-semibold flex items-center gap-1">
                        <span>Cloudinary</span>
                        <span className="text-[10px] text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          Multi-Region CDN
                        </span>
                      </span>
                    </div>

                    {/* QR Generated */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <QrCode size={13} className="text-purple-400" />
                        QR Generated
                      </span>
                      <span className="text-purple-300 font-semibold flex items-center gap-1">
                        <Check size={13} className="text-emerald-400" />
                        <span>Yes (Client Side)</span>
                      </span>
                    </div>

                    {/* Security Protocol */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-400" />
                        Encryption
                      </span>
                      <span className="text-slate-300">HTTPS TLS 1.3 · Ephemeral Purge</span>
                    </div>
                  </div>
                </div>

                {/* Interactive QR Code Section inside Drawer */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-center gap-5">
                  <div className="p-3 rounded-xl bg-white shadow-xl shadow-cyan-500/5 border border-white/20 shrink-0">
                    <QRCodeCanvas
                      id={`drawer-qr-${file.uuid}`}
                      value={downloadUrl}
                      size={120}
                      bgColor="#FFFFFF"
                      fgColor="#0B1020"
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-white">
                      <QrCode size={14} className="text-cyan-400" />
                      <span>Instant Mobile Transfer</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Scan with any camera or download the QR code image as PNG to share in print or chat.
                    </p>
                    <button
                      onClick={handleDownloadQR}
                      className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border shadow-sm ${
                        qrDownloaded
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white border-white/[0.1]'
                      }`}
                    >
                      {qrDownloaded ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span>QR Image Saved!</span>
                        </>
                      ) : (
                        <>
                          <Download size={13} className="text-cyan-400" />
                          <span>Download QR (PNG)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Footer Actions */}
              <div className="sticky bottom-0 bg-[#0B1020]/95 backdrop-blur-xl border-t border-white/[0.08] p-4 sm:p-5 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    if (onDelete) onDelete(file.uuid);
                    onClose();
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all flex items-center gap-1.5"
                  title="Remove this upload record from dashboard"
                >
                  <Trash2 size={14} />
                  <span>Delete Record</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white border border-white/[0.1] transition-all flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={handleOpenPage}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink size={14} />
                    <span>Open Download Page</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
