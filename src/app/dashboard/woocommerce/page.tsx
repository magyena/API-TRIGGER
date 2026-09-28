'use client';

import { useState } from 'react';
import { ShoppingBag, CheckCircle2, Copy, RefreshCw, Key, ShieldCheck } from 'lucide-react';

export default function WooCommercePage() {
  const [storeUrl, setStoreUrl] = useState('https://store.hijafera.com');
  const [consumerKey, setConsumerKey] = useState('ck_98765432101234567890abcdef');
  const [consumerSecret, setConsumerSecret] = useState('cs_abcdef98765432101234567890');
  const [webhookSecret, setWebhookSecret] = useState('whsec_hijafera_live_secret_2026');
  const [copied, setCopied] = useState(false);

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://trigger.domain.com'}/api/woocommerce/webhook`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-purple-600" /> WooCommerce Integration & Order Sync
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Hubungkan WooCommerce via REST API & Webhook untuk pencatatan otomatis Purchase ke Meta CAPI.
        </p>
      </div>

      {/* Webhook Endpoint Generator Banner */}
      <div className="bg-purple-900/10 border border-purple-500/20 rounded-3xl p-6 shadow-soft space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <h3 className="text-sm font-extrabold text-purple-900 dark:text-purple-300">
            WooCommerce Webhook Payload URL
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-zinc-400">
          Pasang URL Webhook berikut di admin WooCommerce Anda (Setting → Advanced → Webhooks → Topic: Order Created & Order Updated).
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-purple-700 dark:text-purple-300 font-bold outline-none"
          />
          <button
            onClick={copyWebhook}
            className="px-4 py-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Tersalin!' : 'Salin URL'}</span>
          </button>
        </div>
      </div>

      {/* WooCommerce REST API Form */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-600" /> Kredensial REST API WooCommerce
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Store URL
            </label>
            <input
              type="url"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Consumer Key
              </label>
              <input
                type="text"
                value={consumerKey}
                onChange={(e) => setConsumerKey(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Consumer Secret
              </label>
              <input
                type="password"
                value={consumerSecret}
                onChange={(e) => setConsumerSecret(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Webhook Secret Signature
            </label>
            <input
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <button className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-900/20">
            Simpan WooCommerce REST API
          </button>
        </div>
      </div>
    </div>
  );
}
