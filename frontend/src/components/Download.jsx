import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Download as DownloadIcon,
  File,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  FileText,
  FileArchive,
  ArrowLeft,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function Download() {
  const { uuid } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        setError(null);
        // Call backend API (preserved endpoint)
        const response = await axios.get(`/files/${uuid}`);
        setFileData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'File not found or link has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      fetchFile();
    }
  }, [uuid]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Locating File...</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to ShareBox edge network</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-md mx-auto">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-4 text-rose-400">
          <AlertCircle className="w-10 h-10 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Link Expired or Invalid</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {error} ShareBox files automatically self-destruct after 24 hours to preserve storage and user privacy.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Return to ShareBox</span>
        </Link>
      </div>
    );
  }

  if (!fileData) return null;

  const { fileName, fileSize, cloudLink, downloadLink, directDownloadUrl } = fileData;
  const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
  const isVideo = fileName.match(/\.(mp4|webm|mov)$/i);
  const isPdf = fileName.match(/\.pdf$/i);
  const isZip = fileName.match(/\.(zip|tar|gz|rar|7z)$/i);

  const resolveDownloadUrl = () => {
    if (!downloadLink) return '#';
    if (downloadLink.startsWith('http://') || downloadLink.startsWith('https://')) {
      return downloadLink;
    }
    const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
    return `${apiBase}${downloadLink}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/[0.08] shadow-2xl"
      >
        {/* Subtle accent border glow */}
        <div className="absolute top-0 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08]">
          <Link to="/" className="inline-block">
            <Logo size={24} showText={true} />
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={13} />
            Verified Clean
          </span>
        </div>

        {/* File Preview Area */}
        <div className="w-full h-64 sm:h-72 bg-[#0B1020]/90 rounded-2xl border border-white/[0.08] flex items-center justify-center overflow-hidden relative mb-6">
          {isImage ? (
            <img
              src={cloudLink}
              alt={fileName}
              className="w-full h-full object-contain p-3"
            />
          ) : isVideo ? (
            <video
              src={cloudLink}
              controls
              className="w-full h-full object-contain"
            />
          ) : isPdf ? (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <FileText size={48} />
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">PDF Document</span>
            </div>
          ) : isZip ? (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <FileArchive size={48} />
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Compressed Archive</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <File size={48} />
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Binary File</span>
            </div>
          )}
        </div>

        {/* File Metadata */}
        <div className="space-y-3 mb-8">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate px-4" title={fileName}>
              {fileName}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-slate-400 font-mono">
              <span className="text-indigo-400 font-semibold">{fileSize}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock size={12} className="text-amber-400" />
                <span>Expires in 24 hours</span>
              </span>
            </div>
          </div>
        </div>

        {/* Primary Download Button */}
        <motion.a
          href={resolveDownloadUrl()}
          download={fileName}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all border border-indigo-400/30 cursor-pointer"
        >
          <DownloadIcon className="w-5 h-5" />
          <span>Download Now</span>
        </motion.a>

        {/* Share / Copy Options */}
        <div className="mt-4 flex items-center justify-between gap-3 text-xs pt-4 border-t border-white/[0.06]">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400 font-medium">Link Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Share Link</span>
              </>
            )}
          </button>

          <Link
            to="/"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1"
          >
            <span>Upload New File</span>
            <span>→</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
