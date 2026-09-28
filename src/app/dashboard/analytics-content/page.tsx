'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieChartIcon,
  Users,
  Layers,
} from 'lucide-react';
import { WORKFLOW_STAGES } from '@/lib/content-utils';

export default function AnalyticsContentPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => {
        if (data.contents) setContents(data.contents);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const total = contents.length;
  const publishedCount = contents.filter((c) => c.status === 'PUBLISHED').length;
  const completionRate = total > 0 ? Math.round((publishedCount / total) * 100) : 0;

  const overdueCount = contents.filter((c) => {
    const diff = new Date(c.deadline).getTime() - new Date().getTime();
    return diff < 0 && c.status !== 'PUBLISHED';
  }).length;
  const overduePercentage = total > 0 ? Math.round((overdueCount / total) * 100) : 0;

  const totalRevisions = contents.reduce((acc, c) => acc + (c._count?.revisions || 0), 0);
  const avgRevisions = total > 0 ? (totalRevisions / total).toFixed(1) : '0';

  // Group by Platform
  const platformCounts: Record<string, number> = {};
  contents.forEach((c) => {
    platformCounts[c.platformName] = (platformCounts[c.platformName] || 0) + 1;
  });

  // Group by Entity
  const entityCounts: Record<string, number> = {};
  contents.forEach((c) => {
    entityCounts[c.entityName] = (entityCounts[c.entityName] || 0) + 1;
  });

  // Group by Priority
  const priorityCounts: Record<string, number> = {};
  contents.forEach((c) => {
    priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Analitik Produksi Konten (Content Analytics)
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Ringkasan performa alur produksi, statistik revisi, tingkat penyelesaian, dan distribusi platform.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Completion Rate</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{completionRate}%</span>
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-500">{publishedCount} dari {total} konten rilis</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Overdue Percentage</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-rose-600">{overduePercentage}%</span>
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-[11px] text-slate-500">{overdueCount} konten terlambat</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Rata-rata Revisi / Konten</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{avgRevisions}x</span>
            <RotateCcw className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-[11px] text-slate-500">Total {totalRevisions} kali revisi</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Rata-rata Waktu Produksi</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">3.2 Hari</span>
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-[11px] text-slate-500">Dari Request ke Published</p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution by Platform */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Konten Berdasarkan Platform
          </h3>
          <div className="space-y-3">
            {Object.entries(platformCounts).map(([plat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={plat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{plat}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution by Entity */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Konten Berdasarkan Entitas
          </h3>
          <div className="space-y-3">
            {Object.entries(entityCounts).map(([ent, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={ent} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{ent}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution by Priority */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Konten Berdasarkan Prioritas
          </h3>
          <div className="space-y-3">
            {Object.entries(priorityCounts).map(([prio, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const barColor = prio === 'Urgent' ? 'bg-rose-500' : prio === 'Medium' ? 'bg-amber-500' : 'bg-slate-400';
              return (
                <div key={prio} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{prio}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
