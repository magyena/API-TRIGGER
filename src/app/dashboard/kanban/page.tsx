'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Kanban as KanbanIcon,
  Search,
  Filter,
  Eye,
  PlusCircle,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { WORKFLOW_STAGES, calculateDeadlineInfo, getPriorityMeta } from '@/lib/content-utils';

export default function KanbanBoardPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const fetchContents = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.contents) {
        setContents(data.contents);
      }
    } catch (e) {
      console.error('Failed to fetch kanban contents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleUpdateStatus = async (contentId: string, newStatus: string) => {
    // Optimistic UI Update
    setContents((prev) =>
      prev.map((c) => (c.id === contentId ? { ...c, status: newStatus } : c))
    );

    try {
      await fetch(`/api/content/${contentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          note: `Moved on Kanban Board to ${newStatus}`,
        }),
      });
      fetchContents();
    } catch (e) {
      console.error('Status update error:', e);
    }
  };

  const filteredContents = contents.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.id.toLowerCase().includes(term) ||
      c.campaignName.toLowerCase().includes(term) ||
      c.platformName.toLowerCase().includes(term) ||
      c.entityName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <KanbanIcon className="w-5 h-5 text-indigo-600" />
            Kanban Board Produksi Konten
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Geser atau pindahkan kartu konten antar tahapan workflow produksi secara visual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kartu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <Link
            href="/dashboard/requests/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Baru</span>
          </Link>
        </div>
      </div>

      {/* Kanban Board Container (Horizontal Scroll for 9 Columns) */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-[2200px]">
          {WORKFLOW_STAGES.map((stage) => {
            const columnItems = filteredContents.filter((c) => c.status === stage.id);

            return (
              <div
                key={stage.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedId) {
                    handleUpdateStatus(draggedId, stage.id);
                    setDraggedId(null);
                  }
                }}
                className="w-72 bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 flex flex-col shrink-0 min-h-[600px] shadow-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-3 px-1">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="font-mono font-bold text-xs bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
                    {columnItems.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {columnItems.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                      Kosong
                    </div>
                  ) : (
                    columnItems.map((item) => {
                      const priorityMeta = getPriorityMeta(item.priority);
                      const deadlineInfo = calculateDeadlineInfo(item.deadline, item.status);
                      const currentStageIdx = WORKFLOW_STAGES.findIndex((s) => s.id === item.status);

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedId(item.id)}
                          className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3.5 space-y-2.5 shadow-sm hover:border-slate-300 dark:hover:border-zinc-600 transition cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400">{item.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${priorityMeta.color}`}>
                              {priorityMeta.label}
                            </span>
                          </div>

                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-2">
                            {item.campaignName}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="bg-slate-100 dark:bg-zinc-700 px-2 py-0.5 rounded font-medium">
                              {item.platformName}
                            </span>
                            <span className={`px-2 py-0.5 rounded ${deadlineInfo.badgeColor}`}>
                              {deadlineInfo.text}
                            </span>
                          </div>

                          {/* Team Assignment Icons */}
                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-700 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1">
                              {item.videoEditor ? (
                                <img
                                  src={item.videoEditor.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                                  alt={item.videoEditor.name}
                                  className="w-5 h-5 rounded-full object-cover"
                                  title={`Editor: ${item.videoEditor.name}`}
                                />
                              ) : null}
                              {item.copywriter ? (
                                <img
                                  src={item.copywriter.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                                  alt={item.copywriter.name}
                                  className="w-5 h-5 rounded-full object-cover -ml-1.5 border border-white"
                                  title={`Copywriter: ${item.copywriter.name}`}
                                />
                              ) : null}
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Left & Right Move Shortcuts */}
                              {currentStageIdx > 0 && (
                                <button
                                  title="Geser ke tahap sebelumnya"
                                  onClick={() => handleUpdateStatus(item.id, WORKFLOW_STAGES[currentStageIdx - 1].id)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {currentStageIdx < WORKFLOW_STAGES.length - 1 && (
                                <button
                                  title="Geser ke tahap berikutnya"
                                  onClick={() => handleUpdateStatus(item.id, WORKFLOW_STAGES[currentStageIdx + 1].id)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <Link
                                href={`/dashboard/content/${item.id}`}
                                className="p-1 hover:bg-slate-100 rounded text-indigo-600 font-bold"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
