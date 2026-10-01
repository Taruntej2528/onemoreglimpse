import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Camera, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, setError } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    const success = await login(email, password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090D] flex flex-col justify-center items-center px-4 relative overflow-hidden text-slate-200">
      {/* Ambient Luxury Background Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#C9A96E]/15 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C9A96E]/5 blur-3xl rounded-full pointer-events-none" />

      {/* Back to Site link */}
      <div className="absolute top-8 left-8 z-10">
        <Link
          to="/"
          className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10"
        >
          <span>← Back to Live Portfolio</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in my-8">
        {/* Brand Emblem */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A96E] to-[#A37E3E] mx-auto flex items-center justify-center text-black shadow-gold-glow mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h1 className="font-serif tracking-[0.25em] text-2xl font-semibold uppercase text-white">
            PRAZNA PHOTOGRAPHY
          </h1>
          <p className="text-xs tracking-[0.2em] text-[#C9A96E] font-medium uppercase mt-1">
            Studio Management & RBAC Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl bg-[#11141D]/90 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-semibold text-white">Sign In</h2>
            <p className="text-xs text-slate-400">
              Enter your authorized credentials to access your permitted studio modules.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="operator@praznaphotography.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C9A96E] via-[#D5B77E] to-[#A37E3E] text-black font-semibold text-xs tracking-wider uppercase hover:opacity-95 shadow-gold-glow transition-all flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
          <span>Encrypted Studio Session • Prazna Photography</span>
        </div>
      </div>
    </div>
  );
};
