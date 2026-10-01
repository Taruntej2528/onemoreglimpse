import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const ProtectedRoute = ({ children, moduleRequired = null }) => {
  const { isAuthenticated, initialLoading, hasPermission, adminUser } = useAdminAuth();
  const location = useLocation();

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-[#C9A96E]">Authenticating Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If a specific module permission is required, check it
  if (moduleRequired && !hasPermission(moduleRequired, 'view')) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold text-white">Module Access Restricted</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your Sub-Admin operator profile ({adminUser?.email}) has not been granted view permissions for the <strong className="text-amber-200">'{moduleRequired}'</strong> module.
          </p>
        </div>
        <Link
          to="/admin"
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200 border border-white/10 inline-flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#C9A96E]" />
          <span>Return to Permitted Modules</span>
        </Link>
      </div>
    );
  }

  return children;
};
