'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldAlert, Megaphone, PenTool, Video, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@hijafera.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal masuk');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan login');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleLogin = async (quickRole: string) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quickRole }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal masuk');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Content Operations System
          </h1>
          <p className="text-xs text-slate-500">
            Masuk untuk mengelola alur produksi, brief, dan rilis konten.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 text-white font-extrabold rounded-xl shadow-md hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Memproses...' : 'Masuk ke Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Role Switcher */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
            Login Cepat 1-Click (Pilih Role Testing)
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickRoleLogin('ADMIN')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-900 font-bold hover:bg-purple-100 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => handleQuickRoleLogin('ADVERTISER')}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4 text-blue-600" />
              <span>Advertiser</span>
            </button>

            <button
              onClick={() => handleQuickRoleLogin('COPYWRITER')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 font-bold hover:bg-emerald-100 flex items-center gap-2"
            >
              <PenTool className="w-4 h-4 text-emerald-600" />
              <span>Copywriter</span>
            </button>

            <button
              onClick={() => handleQuickRoleLogin('VIDEO_EDITOR')}
              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 flex items-center gap-2"
            >
              <Video className="w-4 h-4 text-amber-600" />
              <span>Video Editor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
