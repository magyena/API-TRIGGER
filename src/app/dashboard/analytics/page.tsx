'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ArrowDown, DollarSign, Percent, ShoppingBag, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json);
      });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const { funnelData, todayKPIs } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" /> Deep Attribution Funnel Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Analisis alur konversi bertahap, tingkat kebocoran lead (Drop Rate), dan profitabilitas iklan.
        </p>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Conversion Rate</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{todayKPIs.conversionRate}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">WA Open → Purchase</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">ROAS</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{todayKPIs.roas}x</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Return on Ad Spend</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Average Order Value</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(todayKPIs.avgOrderValue)}</p>
          <span className="text-[10px] text-slate-400">Rata-rata belanja per customer</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Cost Per Purchase</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(todayKPIs.costPerPurchase)}</p>
          <span className="text-[10px] text-slate-400">CPA per transaksi berhasil</span>
        </div>
      </div>

      {/* Visual Funnel Component */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-soft space-y-6">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          Visualisasi Funnel Perjalanan Customer
        </h3>

        <div className="space-y-4 max-w-3xl mx-auto">
          {funnelData.map((item: any, idx: number) => {
            const widthPct = Math.max(25, 100 - idx * 18);
            return (
              <div key={item.stage} className="flex flex-col items-center">
                {idx > 0 && (
                  <div className="flex items-center gap-2 py-1 text-xs text-rose-500 font-bold">
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Drop Rate: {item.dropRate}%</span>
                  </div>
                )}
                <div
                  style={{ width: `${widthPct}%` }}
                  className="bg-gradient-to-r from-purple-800 to-indigo-600 rounded-2xl p-4 text-white shadow-md flex items-center justify-between transition-all hover:scale-[1.01]"
                >
                  <span className="font-extrabold text-sm">{item.stage}</span>
                  <span className="font-black text-lg">{item.count.toLocaleString('id-ID')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
