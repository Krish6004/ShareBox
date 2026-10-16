import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Clock,
  Database,
  Cloud,
  Server,
  Code2,
  Lock,
  Layers,
  ArrowRight,
  Cpu,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 py-8 space-y-16"
    >
      {/* Header */}
      <section className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Layers size={13} />
          <span>System Architecture & Vision</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          About <span className="text-gradient-brand">ShareBox</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          ShareBox is engineered as a high-speed, privacy-first cloud file transfer utility. 
          Built for modern teams, creators, and individuals who demand ephemeral sharing with zero friction.
        </p>
      </section>

      {/* Mission & Philosophy */}
      <section className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/[0.08]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Zap size={22} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Our Mission: True Ephemeral Simplicity
          </h2>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
          Traditional file transfers suffer from two major problems: complicated permission management 
          (such as Google Drive access requests) and permanent data accumulation. 
          Over time, shared folders turn into cluttered digital graveyards of forgotten files.
        </p>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          ShareBox was designed to be deliberately temporary. Every document, image, video, and archive 
          uploaded to our network is provisioned with a strict 24-hour expiration window. Once the countdown expires, 
          the asset is wiped — preserving privacy and keeping storage lean and sustainable.
        </p>
      </section>

      {/* Technical Architecture Grid */}
      <section className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Full-Stack System Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Built using modern, decoupled, cloud-native technologies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cloudinary CDN */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cloud size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Cloudinary Storage CDN</h3>
                <p className="text-xs text-slate-400 font-mono">Distributed Edge Storage</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Files are streamed directly into global Cloudinary edge buckets with automated multi-format classification (images, video streams, and raw attachments). Downloads leverage Cloudinary attachment transformations for native download prompts.
            </p>
          </div>

          {/* MongoDB Atlas */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">MongoDB Atlas Database</h3>
                <p className="text-xs text-slate-400 font-mono">24-Hour TTL Indexing</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Metadata, file sizes, and cryptographically secure 8-character hex identifiers are persisted in a cloud MongoDB Atlas replica set. MongoDB's native Time-To-Live (TTL) index automatically garbage-collects records after 86,400 seconds.
            </p>
          </div>

          {/* React 19 Frontend */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Code2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">React 19 & Framer Motion</h3>
                <p className="text-xs text-slate-400 font-mono">Client-Side Architecture</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Built on React 19 and Vite with Framer Motion spring physics. Features client-side file inspection, live blob previews for multimedia, real-time upload progress tracking, and zero layout shift.
            </p>
          </div>

          {/* Express Backend */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Server size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Express 5 Microservice</h3>
                <p className="text-xs text-slate-400 font-mono">High-Throughput Routing</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Powered by Node.js and Express 5 with Multer streaming middleware. Includes pre-upload MIME validation, rate limits, connection pooling, and automated serverless compatibility for Vercel functions.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Scalability Highlights */}
      <section className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/[0.08] space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <Shield size={24} className="text-indigo-400" />
          <span>Security & Privacy Specifications</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-white block mb-0.5">TLS Encryption in Transit</strong>
              All transfers are encrypted end-to-end via HTTPS TLS 1.3 protocol.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-white block mb-0.5">Non-Sequential Identifiers</strong>
              Random 8-character cryptographic hex UUIDs prevent URL enumeration.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-white block mb-0.5">Automated 24h Purge</strong>
              MongoDB TTL indexes purge document entries automatically.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-white block mb-0.5">Zero Tracking & No Sign-In</strong>
              No browser fingerprinting, user accounts, or marketing cookies.
            </div>
          </div>
        </div>

        <div className="pt-4 text-center sm:text-left">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Ready to transfer files? Upload to ShareBox</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
