'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, AlertTriangle, CheckCircle2, Clock, RotateCcw, ArrowUpRight } from 'lucide-react';
import { calculateDeadlineInfo } from '@/lib/content-utils';

export default function TeamWorkloadPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/content').then((r) => r.json()),
    ])
      .then(([userData, contentData]) => {
        if (userData.users) setTeam(userData.users);
        if (contentData.contents) setContents(contentData.contents);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Compute stats for each team member
  const memberStats = team.map((member) => {
    const assignedContents = contents.filter(
      (c) =>
        c.advertiserId === member.id ||
        c.copywriterId === member.id ||
        c.videoEditorId === member.id
    );

    const activeTasks = assignedContents.filter((c) => c.status !== 'PUBLISHED');
    const completed = assignedContents.filter((c) => c.status === 'PUBLISHED').length;

    const overdue = activeTasks.filter((c) => {
      const info = calculateDeadlineInfo(c.deadline, c.status);
      return info.isOverdue;
    }).length;

    const dueThisWeek = activeTasks.filter((c) => {
      const d = new Date(c.deadline);
      return d >= now && d <= next7Days;
    }).length;

    const revisionTasks = activeTasks.filter((c) => c.status === 'REVISION').length;

    const isHighWorkload = activeTasks.length > 5;

    return {
      ...member,
      assignedContents,
      activeTasksCount: activeTasks.length,
      completed,
      overdue,
      dueThisWeek,
      revisionTasks,
      isHighWorkload,
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Beban Kerja Tim (Team Workload)
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Pantau sebaran penugasan tim copywriter, video editor, dan advertiser untuk mencegah beban berlebih (workload imbalance).
          </p>
        </div>
      </div>

      {/* Member Workload Cards Grid */}
      {loading ? (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 text-xs text-slate-400">
          Memuat data beban kerja tim...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberStats.map((member) => (
            <div
              key={member.id}
              className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 space-y-4 shadow-sm transition hover:shadow-md ${
                member.isHighWorkload
                  ? 'border-amber-300 dark:border-amber-800 ring-1 ring-amber-200'
                  : 'border-slate-200 dark:border-zinc-800'
              }`}
            >
              {/* Member Profile Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{member.name}</h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {member.role}
                    </span>
                  </div>
                </div>

                {member.isHighWorkload && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Workload Tinggi</span>
                  </span>
                )}
              </div>

              {/* Workload Metric Badges */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block">Aktif</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{member.activeTasksCount}</span>
                </div>

                <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-500 block">Overdue</span>
                  <span className="text-base font-black text-rose-600">{member.overdue}</span>
                </div>

                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-600 block">Minggu Ini</span>
                  <span className="text-base font-black text-amber-700">{member.dueThisWeek}</span>
                </div>

                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-600 block">Selesai</span>
                  <span className="text-base font-black text-emerald-700">{member.completed}</span>
                </div>
              </div>

              {/* Assigned Tasks Summary List */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Tugas Aktif Terkini ({member.activeTasksCount})
                </span>

                {member.activeTasksCount === 0 ? (
                  <p className="text-xs text-slate-400 italic">Tidak ada tugas aktif saat ini.</p>
                ) : (
                  member.assignedContents
                    .filter((c: any) => c.status !== 'PUBLISHED')
                    .slice(0, 3)
                    .map((item: any) => (
                      <Link
                        key={item.id}
                        href={`/dashboard/content/${item.id}`}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 transition text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{item.campaignName}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </Link>
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
