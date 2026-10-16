import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  HardDrive,
  Activity,
  UploadCloud,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatFileSize } from '../utils/storage';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!user) return null;

  // Maximum quota: 1GB free tier (1024 * 1024 * 1024 bytes)
  const maxStorageBytes = 1024 * 1024 * 1024;
  const storagePercentage = Math.min(
    100,
    Math.max(1, Math.round(((user.storageUsed || 0) / maxStorageBytes) * 100))
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword) {
      if (!currentPassword) {
        setErrorMessage('Current password is required to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New passwords do not match.');
        return;
      }
    }

    setLoading(true);
    const result = await updateProfile({
      name,
      currentPassword: newPassword ? currentPassword : undefined,
      newPassword: newPassword ? newPassword : undefined,
    });
    setLoading(false);

    if (result?.success) {
      setSuccessMessage('Profile information updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(result?.error || 'Failed to update profile.');
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="w-full max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Account & Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal profile, cloud quotas, and security preferences.
          </p>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all flex items-center gap-1.5"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* User Card */}
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 p-0.5 shadow-xl shadow-indigo-500/20">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-full h-full rounded-2xl object-cover bg-[#0B1020]"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{user.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Cloud Account</span>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
            <Calendar size={12} />
            <span>Member since {memberSince}</span>
          </span>
        </div>

        {/* Cloud Quota Card */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Storage Allocation
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {formatFileSize(user.storageUsed || 0)}{' '}
                <span className="text-xs font-normal text-slate-400">/ 1.00 GB</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <HardDrive size={18} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{storagePercentage}% Used</span>
              <span>Cloudinary CDN Storage</span>
            </div>
            <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-slate-400 text-xs block mb-1">Lifetime Uploads</span>
              <span className="text-lg font-bold text-white flex items-center gap-1.5">
                <UploadCloud size={16} className="text-indigo-400" />
                {user.uploads || 0}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-slate-400 text-xs block mb-1">Total Downloads</span>
              <span className="text-lg font-bold text-white flex items-center gap-1.5">
                <Activity size={16} className="text-cyan-400" />
                {user.downloads || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile & Password Form */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08]">
        <h3 className="text-lg font-bold text-white tracking-tight mb-2">
          Update Profile & Security
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Change your displayed name or set a new password.
        </p>

        {/* Notifications */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080D1A] text-sm text-white rounded-xl pl-10 pr-4 py-2.5 border border-white/[0.08] focus:border-indigo-500/60 outline-none"
                />
              </div>
            </div>

            {/* Readonly Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Email Address (Permanent)
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-white/[0.02] text-sm text-slate-400 rounded-xl pl-10 pr-4 py-2.5 border border-white/[0.05] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Password Change Sub-section */}
          <div className="pt-4 border-t border-white/[0.06] space-y-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Change Password (Optional)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 block">Current Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#080D1A] text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-white/[0.08] focus:border-indigo-500/60 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 block">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="New password (min 6)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#080D1A] text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-white/[0.08] focus:border-indigo-500/60 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 block">Confirm New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#080D1A] text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-white/[0.08] focus:border-indigo-500/60 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
