'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  MessageSquare,
  FileVideo,
  FileText,
  User,
  Sparkles,
  Plus,
  Send,
  Edit,
  Trash2,
  ChevronRight,
  Upload,
  Link2,
  Share2,
} from 'lucide-react';
import {
  WORKFLOW_STAGES,
  PRIORITIES,
  calculateDeadlineInfo,
  getStageMeta,
  getPriorityMeta,
  formatDateTime,
} from '@/lib/content-utils';

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Current session user
  const [sessionUser, setSessionUser] = useState<any>(null);

  // Forms State
  const [activeTab, setActiveTab] = useState<'brief' | 'output' | 'revisions' | 'comments' | 'history'>('brief');

  // Status Modal / Action state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // New Version Output form
  const [versionTitle, setVersionTitle] = useState('');
  const [versionScript, setVersionScript] = useState('');
  const [versionVideoUrl, setVersionVideoUrl] = useState('');
  const [versionPublishedUrl, setVersionPublishedUrl] = useState('');
  const [submittingVersion, setSubmittingVersion] = useState(false);

  // New Revision form
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

  // New Comment form
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/content/${id}`);
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setSessionUser(data.user);
      });
    fetchContent();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/content/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          note: statusNote || `Workflow status updated to ${newStatus}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusNote('');
        fetchContent();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRunningStatusChange = async (statusRunning: string) => {
    try {
      await fetch(`/api/content/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusRunning }),
      });
      fetchContent();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionVideoUrl && !versionScript) return;
    setSubmittingVersion(true);
    try {
      const res = await fetch(`/api/content/${id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: versionTitle || undefined,
          script: versionScript,
          videoUrl: versionVideoUrl,
          publishedUrl: versionPublishedUrl,
        }),
      });
      if (res.ok) {
        setVersionTitle('');
        setVersionScript('');
        setVersionVideoUrl('');
        setVersionPublishedUrl('');
        fetchContent();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingVersion(false);
    }
  };

  const handleAddRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionFeedback.trim()) return;
    setSubmittingRevision(true);
    try {
      const res = await fetch(`/api/content/${id}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: revisionFeedback,
          assignedToId: content.videoEditorId || content.copywriterId,
        }),
      });
      if (res.ok) {
        setRevisionFeedback('');
        fetchContent();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleCompleteRevision = async (revisionId: string) => {
    try {
      await fetch(`/api/content/${id}/revisions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId, isCompleted: true }),
      });
      fetchContent();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/content/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        setCommentText('');
        fetchContent();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Memuat detail permintaan konten {id}...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-12 text-center text-xs text-rose-500">
        Konten {id} tidak ditemukan.
      </div>
    );
  }

  const currentStageMeta = getStageMeta(content.status);
  const priorityMeta = getPriorityMeta(content.priority);
  const deadlineInfo = calculateDeadlineInfo(content.deadline, content.status);
  const currentStageIdx = WORKFLOW_STAGES.findIndex((s) => s.id === content.status);

  // Parse additional reference links
  let parsedRefLinks: any[] = [];
  try {
    if (content.additionalRefLinks) {
      parsedRefLinks = JSON.parse(content.additionalRefLinks);
    }
  } catch {
    parsedRefLinks = [];
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back Button */}
      <Link
        href="/dashboard/content"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Konten</span>
      </Link>

      {/* HEADER SECTION (Section 5) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-slate-500 dark:text-zinc-400">{content.id}</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${currentStageMeta.color}`}>
                {currentStageMeta.label}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs border ${priorityMeta.color}`}>
                {priorityMeta.label}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {content.campaignName}
            </h1>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Entitas: <strong>{content.entityName}</strong> • Platform: <strong>{content.platformName}</strong> • Target: <strong>{content.videoCount} Assets</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${deadlineInfo.badgeColor}`}>
                {deadlineInfo.text}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Deadline: {deadlineInfo.formattedDate}</p>
            </div>

            {/* Running Status Selector */}
            <div className="border-l border-slate-200 dark:border-zinc-800 pl-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Status Running</span>
              <select
                value={content.statusRunning || 'Belum Running'}
                onChange={(e) => handleRunningStatusChange(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="Belum Running">Belum Running</option>
                <option value="Running">Running</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assigned Team Members Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700">
            <img
              src={content.advertiser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="Advertiser"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Advertiser</span>
              <span className="font-bold text-slate-900 dark:text-white">{content.advertiser?.name || 'Belum Ditugaskan'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700">
            <img
              src={content.copywriter?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
              alt="Copywriter"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Copywriter</span>
              <span className="font-bold text-slate-900 dark:text-white">{content.copywriter?.name || 'Belum Ditugaskan'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700">
            <img
              src={content.videoEditor?.avatarUrl || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'}
              alt="Video Editor"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Video Editor</span>
              <span className="font-bold text-slate-900 dark:text-white">{content.videoEditor?.name || 'Belum Ditugaskan'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS TIMELINE & ACTION BAR (Section 3 & Section 5) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Alur Workflow Produksi (9 Stage Timeline)
          </h2>

          {/* Quick Stage Transition Actions */}
          <div className="flex items-center gap-2">
            {currentStageIdx < WORKFLOW_STAGES.length - 1 && (
              <button
                onClick={() => handleStatusChange(WORKFLOW_STAGES[currentStageIdx + 1].id)}
                disabled={updatingStatus}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Lanjut ke: {WORKFLOW_STAGES[currentStageIdx + 1].label} →
              </button>
            )}

            {content.status !== 'REVISION' && (
              <button
                onClick={() => setActiveTab('revisions')}
                className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-50"
              >
                Request Revisi
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-[900px] justify-between relative">
            {WORKFLOW_STAGES.map((st, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div key={st.id} className="flex-1 flex flex-col items-center relative z-10">
                  <button
                    onClick={() => handleStatusChange(st.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                      isCurrent
                        ? 'bg-slate-900 text-white ring-4 ring-slate-200 shadow-md scale-110'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </button>
                  <span
                    className={`text-[10px] font-bold mt-2 text-center max-w-[90px] leading-tight ${
                      isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ASSET & REFERENCE CARDS (Section 4 & Section 5) */}
      <div className="space-y-2">
        <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Aset & Referensi (Clickable Cards)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Campaign URL', url: content.campaignUrl, icon: ExternalLink, color: 'text-indigo-600' },
            { label: 'Folder Aset Drive', url: content.assetLink, icon: Upload, color: 'text-emerald-600' },
            { label: 'VT Sebelumnya', url: content.previousVt, icon: FileVideo, color: 'text-amber-600' },
            { label: 'Benchmark / Ref', url: content.referenceUrl, icon: Link2, color: 'text-blue-600' },
            { label: 'Campaign Ref Internal', url: content.campaignRefUrl, icon: Share2, color: 'text-purple-600' },
            { label: 'Short URL', url: content.shortUrl, icon: ExternalLink, color: 'text-slate-600' },
          ].map((card, idx) => {
            const Icon = card.icon;
            const hasUrl = Boolean(card.url);

            return (
              <a
                key={idx}
                href={hasUrl ? card.url : '#'}
                target={hasUrl ? '_blank' : '_self'}
                rel="noreferrer"
                className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition ${
                  hasUrl
                    ? 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-indigo-400 hover:shadow-sm cursor-pointer'
                    : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 text-slate-300 pointer-events-none'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase">{card.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${hasUrl ? card.color : 'text-slate-300'}`} />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {hasUrl ? 'Buka Tautan →' : 'Tidak Ada Link'}
                </span>
              </a>
            );
          })}
        </div>

        {/* Additional Parsed Reference Links */}
        {parsedRefLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {parsedRefLinks.map((refItem: any, idx: number) => (
              <a
                key={idx}
                href={refItem.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{refItem.label || refItem.url}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-4">
        {[
          { id: 'brief', label: 'Brief & Instruksi', count: null },
          { id: 'output', label: 'Output / Hasil Konten', count: content.versions?.length || 0 },
          { id: 'revisions', label: 'Sistem Revisi', count: content.revisions?.length || 0 },
          { id: 'comments', label: 'Diskusi & Komentar', count: content.comments?.length || 0 },
          { id: 'history', label: 'Riwayat Status', count: content.statusHistory?.length || 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold transition ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900 dark:text-white dark:border-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-[10px]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: BRIEF */}
      {activeTab === 'brief' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Brief Advertiser (Long Form)
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-xl text-xs leading-relaxed text-slate-800 dark:text-zinc-200 whitespace-pre-line font-mono">
              {content.briefAdvertiser || 'Tidak ada brief advertiser khusus.'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="font-extrabold text-slate-400 uppercase text-[10px]">Content Objective</span>
              <p className="font-bold text-slate-900 dark:text-white">{content.objective || '-'}</p>
            </div>

            <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="font-extrabold text-slate-400 uppercase text-[10px]">Target Audience</span>
              <p className="font-bold text-slate-900 dark:text-white">{content.targetAudience || '-'}</p>
            </div>

            <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="font-extrabold text-slate-400 uppercase text-[10px]">Key Message</span>
              <p className="font-bold text-slate-900 dark:text-white">{content.keyMessage || '-'}</p>
            </div>

            <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="font-extrabold text-slate-400 uppercase text-[10px]">Call to Action (CTA)</span>
              <p className="font-bold text-slate-900 dark:text-white">{content.cta || '-'}</p>
            </div>
          </div>

          <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1 text-xs">
            <span className="font-extrabold text-slate-400 uppercase text-[10px]">To Do / Catatan Pengerjaan</span>
            <p className="font-semibold text-slate-900 dark:text-white">{content.toDo || '-'}</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OUTPUT & VERSIONS (Section 6) */}
      {activeTab === 'output' && (
        <div className="space-y-4">
          {/* Upload New Version Form */}
          <form onSubmit={handleAddVersion} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Upload / Lampirkan Hasil Konten Baru (Output Version)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                placeholder="Judul Versi (Contoh: Version 1 - First Cut)"
                value={versionTitle}
                onChange={(e) => setVersionTitle(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-800 border rounded-xl px-3 py-2"
              />
              <input
                type="url"
                placeholder="Link Video Hasil / Vimeo / Drive"
                value={versionVideoUrl}
                onChange={(e) => setVersionVideoUrl(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-800 border rounded-xl px-3 py-2"
              />
            </div>

            <textarea
              rows={3}
              placeholder="Script / Naskah Copywriting..."
              value={versionScript}
              onChange={(e) => setVersionScript(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border rounded-xl p-3 text-xs"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingVersion}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
              >
                Submit Versi Baru
              </button>
            </div>
          </form>

          {/* Versions List */}
          <div className="space-y-3">
            {content.versions?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-zinc-900 border rounded-xl">
                Belum ada output versi yang dilampirkan.
              </div>
            ) : (
              content.versions.map((ver: any) => (
                <div key={ver.id} className="p-4 bg-white dark:bg-zinc-900 border rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      Versi #{ver.versionNumber}: {ver.title || `Version ${ver.versionNumber}`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Diunggah oleh: <strong>{ver.uploadedBy?.name}</strong> • {formatDateTime(ver.createdAt)}
                    </span>
                  </div>

                  {ver.script && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300 font-mono whitespace-pre-line text-[11px]">
                      {ver.script}
                    </div>
                  )}

                  {ver.videoUrl && (
                    <a
                      href={ver.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Link Video Hasil ({ver.videoUrl})</span>
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: REVISION SYSTEM (Section 7) */}
      {activeTab === 'revisions' && (
        <div className="space-y-4">
          {/* Request Revision Form */}
          <form onSubmit={handleAddRevision} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Buat Permintaan Revisi Baru
            </h3>
            <textarea
              rows={3}
              placeholder="Tuliskan catatan revisi secara spesifik (Contoh: Hook pada 3 detik pertama perlu dibuat lebih kuat...)"
              value={revisionFeedback}
              onChange={(e) => setRevisionFeedback(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border rounded-xl p-3 text-xs"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingRevision}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700"
              >
                Kirim Catatan Revisi
              </button>
            </div>
          </form>

          {/* Revisions History List */}
          <div className="space-y-3">
            {content.revisions?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-zinc-900 border rounded-xl">
                Belum ada catatan revisi pada konten ini.
              </div>
            ) : (
              content.revisions.map((rev: any) => (
                <div
                  key={rev.id}
                  className={`p-4 border rounded-xl space-y-2 text-xs transition ${
                    rev.isCompleted
                      ? 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      Revisi #{rev.revisionNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Diminta oleh: <strong>{rev.requestedBy?.name}</strong> ({formatDateTime(rev.createdAt)})
                    </span>
                  </div>

                  <p className="text-slate-800 dark:text-zinc-200 font-medium whitespace-pre-line p-3 bg-white dark:bg-zinc-800 rounded-lg border border-slate-100">
                    "{rev.feedback}"
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">
                      Ditugaskan ke: <strong>{rev.assignedTo?.name || 'Editor'}</strong>
                    </span>

                    {rev.isCompleted ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteRevision(rev.id)}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px]"
                      >
                        Tandai Revisi Selesai
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: COMMENTS (Section 8) */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <form onSubmit={handleAddComment} className="bg-white dark:bg-zinc-900 border rounded-2xl p-4 flex gap-2">
            <input
              type="text"
              placeholder="Tuliskan komentar atau pertanyaan tim..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-zinc-800 border rounded-xl px-3 py-2 text-xs"
            />
            <button type="submit" disabled={submittingComment} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">
              Kirim
            </button>
          </form>

          <div className="space-y-3">
            {content.comments?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-zinc-900 border rounded-xl">
                Belum ada komentar.
              </div>
            ) : (
              content.comments.map((comm: any) => (
                <div key={comm.id} className="p-3 bg-white dark:bg-zinc-900 border rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{comm.user?.name} ({comm.user?.role})</span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(comm.createdAt)}</span>
                  </div>
                  <p className="text-slate-700 dark:text-zinc-300">{comm.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: HISTORY TIMELINE (Section 3) */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-extrabold text-slate-900 dark:text-white uppercase text-xs">
            Riwayat Perubahan Status (Audit Log)
          </h3>
          <div className="space-y-3">
            {content.statusHistory?.map((h: any) => (
              <div key={h.id} className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {h.previousStatus ? `${h.previousStatus} → ` : ''}
                    <strong className="text-indigo-600">{h.newStatus}</strong>
                  </span>
                  <span className="text-[10px] text-slate-400">{formatDateTime(h.createdAt)}</span>
                </div>
                <p className="text-slate-500">{h.note}</p>
                <p className="text-[10px] text-slate-400">Oleh: {h.changedBy?.name || 'Sistem'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
