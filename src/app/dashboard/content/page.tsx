'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpDown,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import {
  WORKFLOW_STAGES,
  PRIORITIES,
  RUNNING_STATUSES,
  calculateDeadlineInfo,
  getStageMeta,
  getPriorityMeta,
} from '@/lib/content-utils';

export default function ContentTablePage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [platform, setPlatform] = useState('ALL');
  const [entity, setEntity] = useState('ALL');
  const [advertiserId, setAdvertiserId] = useState('ALL');
  const [copywriterId, setCopywriterId] = useState('ALL');
  const [videoEditorId, setVideoEditorId] = useState('ALL');
  const [statusRunning, setStatusRunning] = useState('ALL');

  // Master Data Options
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Pagination & Column Toggle
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [columns, setColumns] = useState({
    id: true,
    campaign: true,
    status: true,
    priority: true,
    deadline: true,
    advertiser: true,
    copywriter: true,
    videoEditor: true,
    entity: true,
    platform: true,
    grade: true,
    statusRunning: true,
  });

  const fetchContents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (status !== 'ALL') query.set('status', status);
      if (priority !== 'ALL') query.set('priority', priority);
      if (platform !== 'ALL') query.set('platform', platform);
      if (entity !== 'ALL') query.set('entity', entity);
      if (advertiserId !== 'ALL') query.set('advertiserId', advertiserId);
      if (copywriterId !== 'ALL') query.set('copywriterId', copywriterId);
      if (videoEditorId !== 'ALL') query.set('videoEditorId', videoEditorId);
      if (statusRunning !== 'ALL') query.set('statusRunning', statusRunning);

      const res = await fetch(`/api/content?${query.toString()}`);
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
    // Load filter options
    Promise.all([
      fetch('/api/master/platforms').then((r) => r.json()),
      fetch('/api/master/entities').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
    ]).then(([p, e, u]) => {
      if (p.platforms) setPlatforms(p.platforms);
      if (e.entities) setEntities(e.entities);
      if (u.users) setUsers(u.users);
    });
  }, []);

  useEffect(() => {
    fetchContents();
  }, [search, status, priority, platform, entity, advertiserId, copywriterId, videoEditorId, statusRunning]);

  // Pagination Math
  const totalPages = Math.ceil(contents.length / pageSize) || 1;
  const paginatedContents = contents.slice((page - 1) * pageSize, page * pageSize);

  const toggleColumn = (key: keyof typeof columns) => {
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Daftar Konten (Table View)
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Kelola, filter, dan telusuri seluruh status produksi serta status running konten pemasaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColumnConfig(!showColumnConfig)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Kolom ({Object.values(columns).filter(Boolean).length})</span>
          </button>

          <Link
            href="/dashboard/requests/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Request</span>
          </Link>
        </div>
      </div>

      {/* Column Visibility Configuration Panel */}
      {showColumnConfig && (
        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm space-y-2">
          <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Tampilkan / Sembunyikan Kolom
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
            {Object.keys(columns).map((colKey) => (
              <label key={colKey} className="flex items-center gap-2 cursor-pointer capitalize">
                <input
                  type="checkbox"
                  checked={(columns as any)[colKey]}
                  onChange={() => toggleColumn(colKey as any)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>{colKey.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID, Campaign, Brief..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Workflow Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
          >
            <option value="ALL">Semua Workflow Status</option>
            {WORKFLOW_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="Urgent">Urgent</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Platform Filter */}
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
          >
            <option value="ALL">Semua Platform</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Running Status Filter */}
          <select
            value={statusRunning}
            onChange={(e) => setStatusRunning(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
          >
            <option value="ALL">Semua Status Running</option>
            {RUNNING_STATUSES.map((rs) => (
              <option key={rs.id} value={rs.id}>
                {rs.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-700">
              <tr>
                {columns.id && <th className="p-3">ID</th>}
                {columns.campaign && <th className="p-3">Campaign</th>}
                {columns.status && <th className="p-3">Workflow Status</th>}
                {columns.priority && <th className="p-3">Priority</th>}
                {columns.deadline && <th className="p-3">Deadline</th>}
                {columns.advertiser && <th className="p-3">Advertiser</th>}
                {columns.copywriter && <th className="p-3">Copywriter</th>}
                {columns.videoEditor && <th className="p-3">Video Editor</th>}
                {columns.entity && <th className="p-3">Entitas</th>}
                {columns.platform && <th className="p-3">Platform</th>}
                {columns.grade && <th className="p-3">Grade</th>}
                {columns.statusRunning && <th className="p-3">Status Running</th>}
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-slate-400">
                    Memuat data tabel konten...
                  </td>
                </tr>
              ) : paginatedContents.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-slate-400">
                    Tidak ada konten yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedContents.map((item) => {
                  const stage = getStageMeta(item.status);
                  const priorityMeta = getPriorityMeta(item.priority);
                  const deadlineInfo = calculateDeadlineInfo(item.deadline, item.status);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition group"
                    >
                      {columns.id && (
                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-zinc-300">
                          <Link href={`/dashboard/content/${item.id}`} className="hover:underline">
                            {item.id}
                          </Link>
                        </td>
                      )}

                      {columns.campaign && (
                        <td className="p-3 font-bold text-slate-900 dark:text-white max-w-xs">
                          <Link href={`/dashboard/content/${item.id}`} className="hover:underline line-clamp-1">
                            {item.campaignName}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Target: {item.videoCount} Assets
                          </span>
                        </td>
                      )}

                      {columns.status && (
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${stage.color}`}>
                            {stage.label}
                          </span>
                        </td>
                      )}

                      {columns.priority && (
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${priorityMeta.color}`}>
                            {priorityMeta.label}
                          </span>
                        </td>
                      )}

                      {columns.deadline && (
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${deadlineInfo.badgeColor}`}>
                            {deadlineInfo.text}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{deadlineInfo.formattedDate}</p>
                        </td>
                      )}

                      {columns.advertiser && (
                        <td className="p-3 text-slate-700 dark:text-zinc-300">
                          {item.advertiser?.name || '-'}
                        </td>
                      )}

                      {columns.copywriter && (
                        <td className="p-3 text-slate-700 dark:text-zinc-300">
                          {item.copywriter?.name || '-'}
                        </td>
                      )}

                      {columns.videoEditor && (
                        <td className="p-3 text-slate-700 dark:text-zinc-300">
                          {item.videoEditor?.name || '-'}
                        </td>
                      )}

                      {columns.entity && (
                        <td className="p-3 text-slate-700 dark:text-zinc-300">
                          {item.entityName}
                        </td>
                      )}

                      {columns.platform && (
                        <td className="p-3 text-slate-700 dark:text-zinc-300">
                          {item.platformName}
                        </td>
                      )}

                      {columns.grade && (
                        <td className="p-3 font-extrabold text-slate-800 dark:text-zinc-200">
                          {item.grade || '-'}
                        </td>
                      )}

                      {columns.statusRunning && (
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                              item.statusRunning === 'Running'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.statusRunning || 'Belum Running'}
                          </span>
                        </td>
                      )}

                      <td className="p-3 text-right">
                        <Link
                          href={`/dashboard/content/${item.id}`}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition inline-block"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-slate-500">
            Menampilkan {paginatedContents.length} dari {contents.length} item
          </span>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs"
            >
              <option value={10}>10 baris</option>
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
            </select>

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
