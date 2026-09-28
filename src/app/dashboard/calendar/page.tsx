'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { calculateDeadlineInfo, getStageMeta } from '@/lib/content-utils';

export default function CalendarPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Default Feb 2026 for sample data or current date

  const fetchContents = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.contents) {
        setContents(data.contents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Total days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            Kalender Deadline Konten
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Visualisasi jadwal dan tenggat waktu rilis konten harian, mingguan, dan bulanan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-3 text-slate-900 dark:text-white min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={todayMonth}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold hover:bg-slate-50"
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* Indicators Legend */}
      <div className="flex items-center gap-4 text-xs p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
        <span className="font-bold text-slate-500">Keterangan:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Overdue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Hari Ini</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Mendatang</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Selesai / Published</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800/80 text-center font-extrabold text-[11px] text-slate-600 dark:text-zinc-400 uppercase py-2">
          <span>Minggu</span>
          <span>Senin</span>
          <span>Selasa</span>
          <span>Rabu</span>
          <span>Kamis</span>
          <span>Jumat</span>
          <span>Sabtu</span>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-zinc-800">
          {/* Empty Lead Days */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-32 bg-slate-50/50 dark:bg-zinc-950/40 p-2" />
          ))}

          {/* Actual Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const currentCellDate = new Date(year, month, dayNum);

            // Match content deadlines for this day
            const dayContents = contents.filter((c) => {
              const d = new Date(c.deadline);
              return (
                d.getDate() === dayNum &&
                d.getMonth() === month &&
                d.getFullYear() === year
              );
            });

            return (
              <div key={dayNum} className="h-36 p-2 flex flex-col justify-between hover:bg-slate-50/70 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {dayNum}
                  </span>
                  {dayContents.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayContents.length} item
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto flex-1 mt-1">
                  {dayContents.map((item) => {
                    const deadlineInfo = calculateDeadlineInfo(item.deadline, item.status);
                    let colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
                    if (item.status === 'PUBLISHED') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    else if (deadlineInfo.isOverdue) colorClass = 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
                    else if (deadlineInfo.isToday) colorClass = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';

                    return (
                      <Link
                        key={item.id}
                        href={`/dashboard/content/${item.id}`}
                        className={`block p-1.5 rounded-lg border text-[10px] truncate transition ${colorClass}`}
                        title={`${item.id}: ${item.campaignName}`}
                      >
                        <span className="font-mono font-bold mr-1">{item.id}</span>
                        <span>{item.campaignName}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
