import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Search,
  X,
  ArrowUpDown,
  Sparkles,
  HardDrive,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  FolderOpen,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  FileArchive,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import UploadCard from './UploadCard';
import AnalyticsDrawer from './AnalyticsDrawer';
import QRCodeModal from './QRCodeModal';
import { formatFileSize } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function UploadsDashboard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    activeFiles: 0,
    totalStorageBytes: 0,
    totalDownloads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, largest, smallest
  const [selectedFileForAnalytics, setSelectedFileForAnalytics] = useState(null);
  const [selectedFileForQR, setSelectedFileForQR] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch authenticated files from backend
  const fetchMyFiles = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await api.get('/api/files/my');
      if (res.data) {
        setUploads(res.data.files || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.warn('Error loading files from API:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyFiles();

    // Auto-refresh every 30 seconds for live TTL updates
    const interval = setInterval(() => {
      fetchMyFiles(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMyFiles]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Delete file from both MongoDB Atlas and Cloudinary
  const handleDelete = async (uuid) => {
    try {
      await api.delete(`/api/files/${uuid}`);
      triggerToast('File permanently deleted from MongoDB and Cloudinary');
      
      // Optimistically remove from state
      setUploads((prev) => prev.filter((item) => item.uuid !== uuid));
      
      // Refresh user storage & stats in background
      fetchMyFiles(true);
      if (refreshUser) refreshUser();

      if (selectedFileForAnalytics?.uuid === uuid) {
        setSelectedFileForAnalytics(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      triggerToast(err.response?.data?.error || 'Failed to delete file.');
    }
  };

  // Compute category counts for filter badges
  const categoryCounts = useMemo(() => {
    const counts = { all: uploads.length, image: 0, video: 0, pdf: 0, zip: 0 };
    uploads.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category] += 1;
      }
    });
    return counts;
  }, [uploads]);

  // Filter and sort items
  const filteredAndSortedUploads = useMemo(() => {
    let result = [...uploads];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.fileName.toLowerCase().includes(q) ||
          u.uuid.toLowerCase().includes(q) ||
          u.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter((u) => u.category === activeCategory);
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      if (sortBy === 'largest') {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      if (sortBy === 'smallest') {
        return (a.fileSize || 0) - (b.fileSize || 0);
      }
      return 0;
    });

    return result;
  }, [uploads, searchQuery, activeCategory, sortBy]);

  const filterTabs = [
    { id: 'all', label: 'All Files', count: categoryCounts.all },
    { id: 'image', label: 'Images', count: categoryCounts.image, icon: ImageIcon },
    { id: 'video', label: 'Videos', count: categoryCounts.video, icon: VideoIcon },
    { id: 'pdf', label: 'PDFs', count: categoryCounts.pdf, icon: FileText },
    { id: 'zip', label: 'ZIPs', count: categoryCounts.zip, icon: FileArchive },
  ];

  // Storage calculation (1GB tier)
  const maxStorageBytes = 1024 * 1024 * 1024;
  const storagePercentage = Math.min(
    100,
    Math.max(1, Math.round(((user?.storageUsed || stats.totalStorageBytes || 0) / maxStorageBytes) * 100))
  );

  return (
    <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-500">
      {/* =========================================
          SECTION 1: DASHBOARD HEADER
      ========================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Sparkles size={12} className="text-cyan-400" />
            <span>Cloud Storage & Activity Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            My Uploads
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl font-normal leading-relaxed">
            Manage your uploaded files, monitor activity and share them instantly.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMyFiles(false)}
            disabled={refreshing || loading}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-all"
            title="Refresh dashboard"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-indigo-400' : ''} />
          </button>

          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/25 border border-indigo-400/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          >
            <UploadCloud size={16} />
            <span>Upload File</span>
          </Link>
        </div>
      </div>

      {/* =========================================
          SECTION 2: STORAGE QUOTA & KPI METRICS
      ========================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Files */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Uploads</span>
            <FolderOpen size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats.totalFiles}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            Linked to your account
          </span>
        </div>

        {/* Active Links */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active Links</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {stats.activeFiles}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            Live within 24h TTL
          </span>
        </div>

        {/* Transferred Storage & Quota */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Storage Used</span>
            <HardDrive size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 tracking-tight">
            {formatFileSize(user?.storageUsed || stats.totalStorageBytes || 0)}
          </div>
          <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
        </div>

        {/* Total Downloads */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Downloads</span>
            <Activity size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 tracking-tight">
            {stats.totalDownloads}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            CDN delivery requests
          </span>
        </div>
      </div>

      {/* =========================================
          SECTION 3: CONTROLS (SEARCH, SORT, FILTER)
      ========================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search uploads by filename or UUID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B1020]/90 text-xs sm:text-sm text-white placeholder-slate-400 rounded-xl pl-10 pr-9 py-2.5 border border-white/[0.08] focus:border-indigo-500/60 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1020]/90 border border-white/[0.08] text-xs">
            <ArrowUpDown size={13} className="text-indigo-400 shrink-0" />
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white font-medium outline-none cursor-pointer pr-1"
            >
              <option value="newest" className="bg-[#0B1020] text-white">Newest First</option>
              <option value="oldest" className="bg-[#0B1020] text-white">Oldest First</option>
              <option value="largest" className="bg-[#0B1020] text-white">Largest Size</option>
              <option value="smallest" className="bg-[#0B1020] text-white">Smallest Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-filter-pill"
                  className="absolute inset-0 rounded-xl bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              <span
                className={`relative z-10 px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isActive
                    ? 'bg-indigo-500/40 text-indigo-200'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================
          SECTION 4: UPLOADS GRID / EMPTY STATE
      ========================================= */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 size={36} className="text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Syncing cloud files...</p>
        </div>
      ) : filteredAndSortedUploads.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedUploads.map((file) => (
              <UploadCard
                key={file.uuid}
                file={file}
                onOpenAnalytics={(target) => setSelectedFileForAnalytics(target)}
                onOpenQR={(target) => setSelectedFileForQR(target)}
                onDelete={handleDelete}
                onNotify={triggerToast}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-panel rounded-3xl p-10 sm:p-16 border border-white/[0.08] text-center flex flex-col items-center justify-center space-y-6 my-6"
        >
          {/* Animated Empty Illustration Container */}
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-2xl shadow-indigo-500/10">
              <UploadCloud size={46} className="animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-[#0B1020] border border-white/[0.12] flex items-center justify-center text-cyan-400 shadow-md">
              <Sparkles size={16} />
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {searchQuery || activeCategory !== 'all' ? 'No matching uploads' : 'No uploads yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {searchQuery || activeCategory !== 'all'
                ? 'Try clearing your search query or switching to another filter tab.'
                : 'Files you upload will appear here with live countdowns, share links, and analytics.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {searchQuery || activeCategory !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/"
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 border border-indigo-400/30 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Upload First File</span>
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* =========================================
          ANALYTICS DRAWER
      ========================================= */}
      <AnalyticsDrawer
        file={selectedFileForAnalytics}
        isOpen={!!selectedFileForAnalytics}
        onClose={() => setSelectedFileForAnalytics(null)}
        onDelete={handleDelete}
        onNotify={triggerToast}
      />

      {/* =========================================
          QR CODE MODAL
      ========================================= */}
      <QRCodeModal
        file={selectedFileForQR}
        isOpen={!!selectedFileForQR}
        onClose={() => setSelectedFileForQR(null)}
      />

      {/* =========================================
          TOAST FEEDBACK
      ========================================= */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0F172A] border border-indigo-500/40 text-xs font-semibold text-white shadow-2xl shadow-black/80 flex items-center gap-2"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
