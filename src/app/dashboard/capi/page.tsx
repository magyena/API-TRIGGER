'use client';

import { useState, useEffect } from 'react';
import { Zap, Send, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ConversionsApiPage() {
  const [pixelId, setPixelId] = useState('987654321012345');
  const [accessToken, setAccessToken] = useState('EAAG1234567890abcdefghijklmnopqrstuvwxyz...');
  const [testEventCode, setTestEventCode] = useState('TEST98765');
  const [apiVersion, setApiVersion] = useState('v19.0');
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/meta/capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixelId, accessToken, testEventCode, apiVersion }),
      });
      alert('Konfigurasi Meta Conversions API berhasil disimpan!');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/meta/capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTestTrigger: true,
          pixelId,
          accessToken,
          testEventCode,
          apiVersion,
        }),
      });
      const data = await res.json();
      setTestStatus(data);
    } catch {
      setTestStatus({ success: false, error: 'Koneksi CAPI gagal' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" /> Meta Conversions API (CAPI) Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Kirim event langsung dari server ke Meta Graph API untuk mengatasi ad blocker & iOS 14+ tracking loss.
        </p>
      </div>

      {/* Config Form Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-soft space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Pixel ID Target
              </label>
              <input
                type="text"
                required
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                API Version
              </label>
              <select
                value={apiVersion}
                onChange={(e) => setApiVersion(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="v19.0">v19.0 (Rekomendasi Terbaru)</option>
                <option value="v18.0">v18.0</option>
                <option value="v17.0">v17.0</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              System User Access Token (Graph API)
            </label>
            <textarea
              required
              rows={4}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Test Event Code (Meta Test Events Dashboard)
            </label>
            <input
              type="text"
              value={testEventCode}
              onChange={(e) => setTestEventCode(e.target.value)}
              placeholder="Misal: TEST12345"
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Opsional. Kosongkan jika sudah production.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleSendTest}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Kirim Test Event Server CAPI</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20"
            >
              {saving ? 'Menyimpan...' : 'Simpan Konfigurasi CAPI'}
            </button>
          </div>
        </form>

        {/* Test Result Box */}
        {testStatus && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              testStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {testStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{testStatus.success ? 'Test Event CAPI Berhasil Terkirim!' : 'Test Event CAPI Gagal'}</span>
            </div>
            <p className="font-mono text-[11px]">Event ID: {testStatus.eventId}</p>
          </div>
        )}
      </div>
    </div>
  );
}
