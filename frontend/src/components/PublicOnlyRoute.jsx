import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={36} className="text-indigo-400 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/uploads" replace />;
  }

  return children;
}
