'use client';

import { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Globe, DollarSign, Clock, Key, ScrollText, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function SettingsPage() {
  const [timezone, setTimezone] = useState('Asia/Jakarta');
  const [currency, setCurrency] = useState('IDR');
  const [domain, setDomain] = useState('https://trigger.domain.com');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setTimezone(data.settings.timezone || 'Asia/Jakarta');
          setCurrency(data.settings.currency || 'IDR');
          setDomain(data.settings.domain || 'https://trigger.domain.com');
        }
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone, currency, domain }),
    });
    alert('Pengaturan berhasil diperbarui!');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" /> System Settings & Security Compliance
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Pengaturan global timezone, mata uang, domain, enkripsi API key, rate limit, dan audit log.
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-soft space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-600" /> General Hub Parameters
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Timezone Sistem
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB GMT+7)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA GMT+8)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT GMT+9)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Default Currency
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Trigger Domain URL Base
            </label>
            <input
              type="url"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-900/20"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>

      {/* Security Status Box */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-soft space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Status Keamanan & Proteksi
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'CSRF Protection', status: 'Enabled' },
            { label: 'Rate Limiter', status: '60 req/min' },
            { label: 'JWT Authentication', status: 'Active (7 days)' },
            { label: 'API Key Encryption', status: 'AES-256' },
            { label: 'Input Sanitization', status: 'Zod Strict' },
            { label: 'Audit Logging', status: 'Enabled' },
          ].map((sec) => (
            <div
              key={sec.label}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center justify-between"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{sec.label}</span>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {sec.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-soft space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-purple-600" /> Audit Log Activity Stream
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                <p className="text-[10px] text-slate-400">{log.details}</p>
              </div>
              <div className="text-right text-slate-400 text-[11px]">
                <div>{log.ip}</div>
                <div>{formatDate(log.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
