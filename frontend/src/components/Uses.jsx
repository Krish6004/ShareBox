import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Server,
  Database,
  Cloud,
  Globe2,
  Layers,
  Sparkles,
  Zap,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const techGroups = [
  {
    category: 'Frontend Architecture',
    description: 'Modern, reactive client-side rendering with micro-interactions',
    technologies: [
      {
        name: 'React 19',
        role: 'Component Engine',
        badge: 'v19.2',
        color: 'border-blue-500/25 text-blue-400 bg-blue-500/10',
        detail: 'Modern React runtime with functional hooks, error boundaries, and declarative UI states.',
      },
      {
        name: 'Vite 7',
        role: 'Build & Bundler',
        badge: 'Next-Gen',
        color: 'border-amber-500/25 text-amber-400 bg-amber-500/10',
        detail: 'Instant Hot Module Replacement (HMR) and optimized Rollup client production bundles.',
      },
      {
        name: 'Framer Motion 12',
        role: 'Motion Engine',
        badge: 'Spring Physics',
        color: 'border-purple-500/25 text-purple-400 bg-purple-500/10',
        detail: 'Production-ready layout animations, drag physics, and smooth page exit transitions.',
      },
      {
        name: 'Tailwind CSS v4',
        role: 'Styling & Tokens',
        badge: 'Utility CSS',
        color: 'border-cyan-500/25 text-cyan-400 bg-cyan-500/10',
        detail: 'Design token system with responsive breakpoints, glassmorphism, and ambient effects.',
      },
    ],
  },
  {
    category: 'Backend & Routing',
    description: 'High-performance Node runtime and streaming microservice',
    technologies: [
      {
        name: 'Node.js',
        role: 'JavaScript Runtime',
        badge: 'v24 Engine',
        color: 'border-emerald-500/25 text-emerald-400 bg-emerald-500/10',
        detail: 'Non-blocking I/O event loop powering concurrent file uploads and stream pipelines.',
      },
      {
        name: 'Express 5',
        role: 'Web Framework',
        badge: 'Microservice',
        color: 'border-slate-500/25 text-slate-300 bg-white/[0.05]',
        detail: 'RESTful API routing with Multer stream handling and CORS integration.',
      },
    ],
  },
  {
    category: 'Database & Persistence',
    description: 'Cloud document database with automated expiration indexing',
    technologies: [
      {
        name: 'MongoDB Atlas',
        role: 'Cloud Database',
        badge: 'NoSQL Cluster',
        color: 'border-green-500/25 text-green-400 bg-green-500/10',
        detail: 'Global replica set managing file metadata, size stats, and short hex download keys.',
      },
      {
        name: 'Mongoose 8',
        role: 'ODM & TTL Indexes',
        badge: '86400s TTL',
        color: 'border-teal-500/25 text-teal-400 bg-teal-500/10',
        detail: 'Strict schema validation and automated 24-hour background document purging.',
      },
    ],
  },
  {
    category: 'Storage & Global CDN',
    description: 'Edge asset delivery and media transformation pipeline',
    technologies: [
      {
        name: 'Cloudinary',
        role: 'Media Storage & CDN',
        badge: 'Edge CDN',
        color: 'border-indigo-500/25 text-indigo-400 bg-indigo-500/10',
        detail: 'Multi-region asset distribution supporting images, 4K video, PDFs, and ZIP archives.',
      },
      {
        name: 'Multer Cloudinary',
        role: 'Streaming Driver',
        badge: 'Direct Upload',
        color: 'border-blue-500/25 text-blue-400 bg-blue-500/10',
        detail: 'Buffers client files directly into Cloudinary without temporary server disk overhead.',
      },
    ],
  },
  {
    category: 'Cloud Deployment & Hosting',
    description: 'Serverless backend functions and edge-accelerated client hosting',
    technologies: [
      {
        name: 'Vercel',
        role: 'Backend Serverless',
        badge: 'Edge Functions',
        color: 'border-white/20 text-white bg-white/10',
        detail: 'Zero-configuration serverless execution for Express API routes and proxy routing.',
      },
      {
        name: 'Netlify',
        role: 'Frontend Edge',
        badge: 'Global CDN',
        color: 'border-cyan-500/25 text-cyan-400 bg-cyan-500/10',
        detail: 'Single-page application hosting with continuous deployment and instant edge cache.',
      },
    ],
  },
];

export default function Uses() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 py-8 space-y-16"
    >
      {/* Header */}
      <section className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Cpu size={13} />
          <span>Technology & Infrastructure</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          The <span className="text-gradient-brand">ShareBox</span> Stack
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          ShareBox is engineered with enterprise-grade cloud primitives designed for ultra-low latency, 
          privacy preservation, and zero-maintenance scalability.
        </p>
      </section>

      {/* Tech Stack Groups */}
      <div className="space-y-12">
        {techGroups.map((group, groupIdx) => (
          <section key={groupIdx} className="space-y-4">
            <div className="border-b border-white/[0.08] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {group.category}
              </h2>
              <span className="text-xs text-slate-400">{group.description}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.technologies.map((tech, techIdx) => (
                <div
                  key={techIdx}
                  className="glass-panel glass-panel-hover rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-white">{tech.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${tech.color}`}>
                        {tech.badge}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-indigo-400 mb-2">{tech.role}</p>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {tech.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="glass-panel rounded-3xl p-8 text-center border border-white/[0.08]">
        <h3 className="text-xl font-bold text-white mb-2">Ready to test ShareBox?</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
          Experience instant ephemeral file transfers powered by this modern stack.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <span>Start Uploading Now</span>
          <ArrowRight size={15} />
        </Link>
      </section>
    </motion.div>
  );
}
