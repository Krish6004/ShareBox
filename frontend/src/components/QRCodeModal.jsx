import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import {
  X,
  Download,
  Check,
  Copy,
  ExternalLink,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { incrementDownloadCount } from '../utils/storage';

export default function QRCodeModal({ file, isOpen, onClose }) {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  if (!file) return null;

  const downloadUrl = file.fileLink || `${window.location.origin}/download/${file.uuid}`;

  const handleDownloadPNG = () => {
    const canvas = document.getElementById(`modal-qr-${file.uuid}`);
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    const cleanName = (file.fileName || 'sharebox').replace(/\.[^/.]+$/, '');
    a.download = `sharebox-qr-${cleanName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenLink = () => {
    incrementDownloadCount(file.uuid);
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md rounded-3xl bg-[#0F172A] border border-white/[0.12] p-6 sm:p-7 shadow-2xl shadow-black/80 z-10 overflow-hidden"
          >
            {/* Top Cyan Glow Accent */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Scan to Download
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instant mobile transfer via QR
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target File Info */}
            <div className="my-4 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-400">Target File</span>
              <span className="font-semibold text-white truncate max-w-[200px]" title={file.fileName}>
                {file.fileName}
              </span>
            </div>

            {/* QR Code Canvas */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-4 rounded-2xl bg-white shadow-xl shadow-cyan-500/10 border border-white/40 flex items-center justify-center">
                <QRCodeCanvas
                  id={`modal-qr-${file.uuid}`}
                  value={downloadUrl}
                  size={190}
                  bgColor="#FFFFFF"
                  fgColor="#0B1020"
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed max-w-xs">
                Scan this QR code using another device's camera to instantly open the secure download page.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2.5 pt-4 border-t border-white/[0.08]">
              <button
                onClick={handleDownloadPNG}
                className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border shadow-lg ${
                  downloaded
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
                    : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400/30 text-white shadow-indigo-600/25 hover:scale-[1.01]'
                }`}
              >
                {downloaded ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span>Saved to Downloads (PNG)</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Download QR Code (PNG)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 rounded-xl text-xs font-medium text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center justify-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleOpenLink}
                  className="py-2.5 px-3 rounded-xl text-xs font-medium text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={14} className="text-cyan-400" />
                  <span>Open Page</span>
                </button>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-4 pt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Direct Link · 24-Hour Ephemeral Storage</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
