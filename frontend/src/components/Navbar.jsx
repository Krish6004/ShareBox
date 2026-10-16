import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Layers,
  Info,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  ChevronDown,
  HardDrive,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { formatFileSize } from '../utils/storage';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change or outside click
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Transfer', icon: UploadCloud },
    { to: '/uploads', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/uses', label: 'Technology', icon: Layers },
    { to: '/about', label: 'Architecture', icon: Info },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none">
        <motion.nav
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto w-full max-w-6xl rounded-2xl border transition-all duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl backdrop-blur-xl ${
            scrolled
              ? 'bg-[#0B1020]/90 border-white/[0.12] shadow-black/40'
              : 'bg-[#0B1020]/75 border-white/[0.08] shadow-black/20'
          }`}
        >
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Logo size={28} showText={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex items-center gap-1 list-none m-0 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `relative px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="navbar-active-pill"
                            className="absolute inset-0 rounded-lg bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Icon size={14} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                        <span className="relative z-10">{link.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* Right Action / Profile Menu */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 transition-all hover:border-indigo-500/40"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="relative w-6 h-6 rounded-lg overflow-hidden bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px]">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-full h-full rounded-lg object-cover bg-[#0B1020]"
                    />
                    <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-[#0B1020]" />
                  </div>
                  <span className="max-w-[100px] truncate font-medium text-white">{user.name}</span>
                  <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 w-64 rounded-2xl bg-[#0F172A] border border-white/[0.12] p-2 shadow-2xl shadow-black/80 z-50 text-xs"
                    >
                      {/* User Info Header */}
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-1.5">
                        <div className="font-semibold text-white truncate">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                        <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <HardDrive size={11} className="text-cyan-400" />
                            Storage
                          </span>
                          <span className="font-mono text-cyan-300">
                            {formatFileSize(user.storageUsed || 0)} / 1 GB
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to="/uploads"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-indigo-400" />
                          <span>My Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <User size={14} className="text-cyan-400" />
                          <span>Profile & Quota</span>
                        </Link>
                      </div>

                      <div className="pt-1 mt-1 border-t border-white/[0.06]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1.5"
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30 transition-all hover:scale-[1.02]"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </motion.nav>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-24 z-50 md:hidden rounded-2xl bg-[#0B1020]/95 backdrop-blur-2xl border border-white/[0.12] p-5 shadow-2xl shadow-black/60"
          >
            <div className="flex flex-col gap-2">
              {user && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                    </div>
                  </div>
                  <Link to="/profile" className="text-xs text-indigo-400 hover:underline">
                    Edit
                  </Link>
                </div>
              )}

              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                          : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} className="text-indigo-400" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}

              <div className="pt-3 mt-2 border-t border-white/[0.08]">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-rose-500/10 text-rose-300 border border-rose-500/20"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      className="py-2.5 rounded-xl text-xs font-semibold text-center bg-white/[0.06] text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="py-2.5 rounded-xl text-xs font-semibold text-center bg-indigo-600 text-white shadow-lg"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
