import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Download, Smartphone, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QRCodeCard({ url, fileName }) {
  const canvasRef = useRef(null);
  const [downloaded, setDownloaded] = React.useState(false);

  const handleDownloadQR = () => {
    // Find canvas rendered by QRCodeCanvas
    const canvas = document.getElementById('sharebox-qr-canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    const cleanName = (fileName || 'sharebox').replace(/\.[^/.]+$/, '');
    downloadLink.download = `sharebox-qr-${cleanName}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col items-center justify-between text-center h-full"
    >
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Smartphone size={14} className="text-cyan-400" />
          Scan to Download
        </span>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
          Mobile Ready
        </span>
      </div>

      {/* QR Code Container */}
      <div className="p-3.5 rounded-2xl bg-white shadow-xl shadow-cyan-500/5 my-2 flex items-center justify-center border border-white/20">
        <QRCodeCanvas
          id="sharebox-qr-canvas"
          value={url}
          size={160}
          bgColor="#FFFFFF"
          fgColor="#0B1020"
          level="H"
          includeMargin={false}
        />
      </div>

      <p className="text-xs text-slate-400 mt-2 mb-3 leading-relaxed max-w-[200px]">
        Scan this QR code using your phone camera to download instantly.
      </p>

      {/* Download QR PNG Button */}
      <button
        onClick={handleDownloadQR}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
          downloaded
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-200 hover:text-white'
        }`}
        aria-label="Download QR code image as PNG"
      >
        {downloaded ? (
          <>
            <Check size={14} className="text-emerald-400" />
            <span>QR Saved as PNG</span>
          </>
        ) : (
          <>
            <Download size={14} className="text-cyan-400" />
            <span>Download QR Code</span>
          </>
        )}
      </button>
    </motion.div>
  );
}
