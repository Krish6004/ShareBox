import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Shield, Zap, Cloud, Github, Lock, CheckCircle2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#0B1020]/80 backdrop-blur-xl relative z-10 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <Logo size={28} />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              ShareBox is a modern, privacy-first ephemeral file sharing platform. 
              Upload documents, media, and archives with automated 24-hour expiration and zero account friction.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Network Operational
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono text-slate-400 bg-white/[0.04] border border-white/[0.08]">
                v2.0 • 2026 Edition
              </span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">
                  File Upload
                </Link>
              </li>
              <li>
                <Link to="/uploads" className="hover:text-indigo-400 transition-colors">
                  My Uploads Dashboard
                </Link>
              </li>
              <li>
                <a href="/#features" className="hover:text-indigo-400 transition-colors">
                  Key Features
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-indigo-400 transition-colors">
                  Frequently Asked
                </a>
              </li>
              <li>
                <Link to="/uses" className="hover:text-indigo-400 transition-colors">
                  Technology Stack
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Specs */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Infrastructure
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-indigo-400 transition-colors">
                  System Architecture
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Cloud size={14} className="text-cyan-400" />
                <span>Cloudinary Global CDN</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock size={14} className="text-indigo-400" />
                <span>MongoDB Atlas TTL Index</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                <span>24-Hour Ephemeral Cache</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ShareBox. Share Files. Instantly. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield size={13} className="text-emerald-400" />
              <span>Zero-Log Ephemeral Storage</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Built for speed & privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
