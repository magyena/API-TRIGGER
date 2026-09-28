'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  User,
  Zap,
  TrendingUp,
  PlusCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { calculateDeadlineInfo, getStageMeta, getPriorityMeta } from '@/lib/content-utils';

export default function DashboardPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.contents) {
        setContents(data.contents);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute KPI Statistics
  const total = contents.length;
  const requested = contents.filter((c) => c.status === 'REQUESTED').length;
  const inProgress = contents.filter((c) => ['ASSIGNED', 'COPYWRITING', 'EDITING'].includes(c.status)).length;
  const inReview = contents.filter((c) => c.status === 'INTERNAL_REVIEW').length;
  const revision = contents.filter((c) => c.status === 'REVISION').length;
  const approved = contents.filter((c) => ['APPROVED', 'READY_TO_PUBLISH'].includes(c.status)).length;
  const published = contents.filter((c) => c.status === 'PUBLISHED').length;

  const overdue = contents.filter((c) => {
    const info = calculateDeadlineInfo(c.deadline, c.status);
    return info.isOverdue;
  }).length;

  // Filter "Needs Attention" Content sorted by Urgency
  const needsAttention = contents
    .map((c) => {
      const deadlineInfo = calculateDeadlineInfo(c.deadline, c.status);
      let urgencyScore = 0;
      if (deadlineInfo.isOverdue) urgencyScore += 100;
      if (c.priority === 'Urgent') urgencyScore += 50;
      if (c.status === 'REVISION') urgencyScore += 40;
      if (c.status === 'INTERNAL_REVIEW') urgencyScore += 30;
      if (deadlineInfo.isToday || deadlineInfo.isTomorrow) urgencyScore += 20;

      return { ...c, deadlineInfo, urgencyScore };
    })
    .filter((c) => c.urgencyScore > 0 && c.status !== 'PUBLISHED')
    .sort((a, b) => b.urgencyScore - a.urgencyScore);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Content Operations Dashboard
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              Realtime Tracking
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Pantau seluruh alur permintaan, produksi, revisi, dan publikasi konten pemasaran dalam satu tampilan.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/requests/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Request Baru</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'TOTAL', count: total, color: 'border-slate-300 bg-white text-slate-900' },
          { label: 'REQUESTED', count: requested, color: 'border-slate-300 bg-slate-50 text-slate-700' },
          { label: 'IN PROGRESS', count: inProgress, color: 'border-blue-200 bg-blue-50/50 text-blue-700' },
          { label: 'IN REVIEW', count: inReview, color: 'border-amber-200 bg-amber-50/50 text-amber-700' },
          { label: 'REVISION', count: revision, color: 'border-rose-200 bg-rose-50/50 text-rose-700' },
          { label: 'APPROVED', count: approved, color: 'border-teal-200 bg-teal-50/50 text-teal-700' },
          { label: 'PUBLISHED', count: published, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-700' },
          { label: 'OVERDUE', count: overdue, color: 'border-rose-300 bg-rose-100/70 text-rose-900 font-extrabold' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`p-3.5 rounded-xl border ${kpi.color} dark:bg-zinc-900 dark:border-zinc-800 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {kpi.label}
            </span>
            <span className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{kpi.count}</span>
          </div>
        ))}
      </div>

      {/* Section: Needs Attention */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Needs Attention ({needsAttention.length})
            </h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              (Overdue, deadline &lt; 24 jam, urgent, butuh review & revisi)
            </span>
          </div>

          <Link
            href="/dashboard/content?priority=Urgent"
            className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 flex items-center gap-1"
          >
            <span>Lihat Semua Urgent</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-400">
            Memuat data perhatian...
          </div>
        ) : needsAttention.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            Semua tugas berjalan lancar! Tidak ada konten yang memerlukan penanganan mendesak saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {needsAttention.slice(0, 6).map((item) => {
              const stage = getStageMeta(item.status);
              const priority = getPriorityMeta(item.priority);

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-zinc-700 transition shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{item.id}</span>
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                        {item.campaignName}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {item.entityName} • {item.platformName}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] border ${priority.color}`}>
                      {priority.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${stage.color}`}>
                      {stage.label}
                    </span>

                    <span className={`px-2 py-0.5 rounded border text-[10px] ${item.deadlineInfo.badgeColor}`}>
                      {item.deadlineInfo.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      {item.videoEditor ? (
                        <div className="flex items-center gap-1">
                          <img
                            src={item.videoEditor.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={item.videoEditor.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-[11px] text-slate-700 dark:text-zinc-300 font-medium">{item.videoEditor.name}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Belum ada editor</span>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/content/${item.id}`}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka Konten</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid Section: Overview Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Content Production Stream */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Daftar Permintaan Konten Terkini
            </h2>
            <Link href="/dashboard/content" className="text-xs font-semibold text-slate-600 hover:underline">
              Lihat Tabel Lengkap →
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {contents.slice(0, 5).map((item) => {
                const stage = getStageMeta(item.status);
                const deadlineInfo = calculateDeadlineInfo(item.deadline, item.status);

                return (
                  <div key={item.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400">{item.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stage.color}`}>
                          {stage.label}
                        </span>
                        <span className="text-[11px] text-slate-400">• {item.platformName}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {item.campaignName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {item.entityName} | Target: {item.videoCount} Assets
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${deadlineInfo.badgeColor}`}>
                          {deadlineInfo.text}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Deadline: {deadlineInfo.formattedDate}</p>
                      </div>

                      <Link
                        href={`/dashboard/content/${item.id}`}
                        className="p-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Workflow Breakdown */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Status Alur Produksi
          </h2>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3 shadow-sm">
            {[
              { stage: 'REQUESTED', label: 'Requested', desc: 'Permintaan masuk belum diproses' },
              { stage: 'ASSIGNED', label: 'Assigned', desc: 'Sudah ditugaskan ke tim' },
              { stage: 'COPYWRITING', label: 'Copywriting', desc: 'Proses naskah & brief' },
              { stage: 'EDITING', label: 'Editing', desc: 'Proses penyuntingan video' },
              { stage: 'INTERNAL_REVIEW', label: 'Internal Review', desc: 'Pemeriksaan tim internal' },
              { stage: 'REVISION', label: 'Revision', desc: 'Sedang diperbaiki' },
              { stage: 'APPROVED', label: 'Approved', desc: 'Siap rilis' },
              { stage: 'PUBLISHED', label: 'Published', desc: 'Konten tayang' },
            ].map((st) => {
              const count = contents.filter((c) => c.status === st.stage).length;
              const meta = getStageMeta(st.stage);

              return (
                <div key={st.stage} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-zinc-800 last:border-0 last:pb-0">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${meta.color}`}>
                      {meta.label}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{st.desc}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
