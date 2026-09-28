'use client';

import { useState, useEffect } from 'react';
import { Layers, Plus, CheckCircle2, ShieldCheck, Zap, Trash2, Edit } from 'lucide-react';

export default function MetaPixelPage() {
  const [pixels, setPixels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [pixelId, setPixelId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [testEventCode, setTestEventCode] = useState('');

  const fetchPixels = async () => {
    try {
      const res = await fetch('/api/pixel');
      const data = await res.json();
      if (data.pixels) setPixels(data.pixels);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPixels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/pixel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pixelId, accessToken, testEventCode }),
    });
    setShowModal(false);
    fetchPixels();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" /> Meta Pixel Multi-Instance Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Konfigurasi & sinkronisasi multi Pixel ID dengan deduplikasi otomatis event_id.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20"
        >
          <Plus className="w-4 h-4" /> Tambah Pixel Baru
        </button>
      </div>

      {/* Pixels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pixels.map((pixel) => (
          <div
            key={pixel.id}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-soft relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 mb-2">
                  <CheckCircle2 className="w-3 h-3" /> Active & Synced
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{pixel.name}</h3>
                <p className="text-xs font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                  ID: {pixel.pixelId}
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            {/* Event Matrix Badges */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Supported Events:</p>
              <div className="flex flex-wrap gap-1.5">
                {['PageView', 'ViewContent', 'Lead', 'Contact', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase'].map(
                  (evt) => (
                    <span
                      key={evt}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-semibold rounded-md"
                    >
                      ✓ {evt}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">API Version: {pixel.apiVersion || 'v19.0'}</span>
              <span>Deduplication: <b>event_id</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Pixel Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tambah Meta Pixel</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Nama Pixel</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Main Store Pixel"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Pixel ID</label>
                <input
                  type="text"
                  required
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  placeholder="123456789012345"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Access Token</label>
                <textarea
                  required
                  rows={3}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAAxxxxxxxx..."
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-600"
                >
                  Simpan Pixel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
