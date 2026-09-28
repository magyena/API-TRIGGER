'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserCheck, Eye, PlusCircle, Clock, AlertTriangle } from 'lucide-react';
import { calculateDeadlineInfo, getStageMeta, getPriorityMeta } from '@/lib/content-utils';

export default function MyRequestsPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content?myRequests=true')
      .then((r) => r.json())
      .then((data) => {
        if (data.contents) setContents(data.contents);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Tugas & Permintaan Saya
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Daftar seluruh konten yang ditugaskan kepada Anda (Advertiser, Copywriter, atau Video Editor).
          </p>
        </div>

        <Link
          href="/dashboard/requests/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Request Baru</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Memuat tugas Anda...</div>
        ) : contents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <p className="font-bold">Belum ada tugas yang diberikan kepada Anda saat ini.</p>
            <p className="text-slate-400">Ganti role pada menu sidebar jika Anda ingin menguji role lain.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {contents.map((item) => {
              const stage = getStageMeta(item.status);
              const priorityMeta = getPriorityMeta(item.priority);
              const deadlineInfo = calculateDeadlineInfo(item.deadline, item.status);

              return (
                <div key={item.id} className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stage.color}`}>
                        {stage.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${priorityMeta.color}`}>
                        {priorityMeta.label}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {item.campaignName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Entitas: {item.entityName} | Platform: {item.platformName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${deadlineInfo.badgeColor}`}>
                        {deadlineInfo.text}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{deadlineInfo.formattedDate}</p>
                    </div>

                    <Link
                      href={`/dashboard/content/${item.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
