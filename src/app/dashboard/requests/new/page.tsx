'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Users,
  FileText,
  Link2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function NewContentRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Master Data Options
  const [entities, setEntities] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Campaign Info
    campaignName: '',
    campaignStatus: 'New',
    entityName: '',
    platformName: '',
    campaignUrl: '',
    shortUrl: '',
    contentCategory: '',
    priority: 'Medium',
    deadline: '',

    // Step 2: Assignments
    advertiserId: '',
    copywriterId: '',
    videoEditorId: '',

    // Step 3: Brief
    title: '',
    videoCount: 1,
    briefAdvertiser: '',
    objective: '',
    targetAudience: '',
    keyMessage: '',
    cta: '',
    toDo: '',
    additionalInfo: '',

    // Step 4: References & Assets
    assetLink: '',
    referenceUrl: '',
    previousVt: '',
    campaignRefUrl: '',
    additionalRefLinks: [{ label: '', url: '' }],
  });

  useEffect(() => {
    // Load Master Data
    const loadMasterData = async () => {
      try {
        const [eRes, pRes, cRes, uRes] = await Promise.all([
          fetch('/api/master/entities'),
          fetch('/api/master/platforms'),
          fetch('/api/master/campaigns'),
          fetch('/api/users'),
        ]);

        const [eData, pData, cData, uData] = await Promise.all([
          eRes.json(),
          pRes.json(),
          cRes.json(),
          uRes.json(),
        ]);

        if (eData.entities) setEntities(eData.entities);
        if (pData.platforms) setPlatforms(pData.platforms);
        if (cData.campaigns) setCampaigns(cData.campaigns);
        if (uData.users) setTeamMembers(uData.users);
      } catch (e) {
        console.error('Failed to load master data:', e);
      }
    };

    loadMasterData();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRefLink = () => {
    setFormData((prev) => ({
      ...prev,
      additionalRefLinks: [...prev.additionalRefLinks, { label: '', url: '' }],
    }));
  };

  const handleRemoveRefLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalRefLinks: prev.additionalRefLinks.filter((_, i) => i !== index),
    }));
  };

  const handleRefLinkChange = (index: number, key: 'label' | 'url', value: string) => {
    setFormData((prev) => {
      const updated = [...prev.additionalRefLinks];
      updated[index][key] = value;
      return { ...prev, additionalRefLinks: updated };
    });
  };

  const validateStep1 = () => {
    if (!formData.campaignName.trim()) {
      setErrorMsg('Nama Campaign wajib diisi');
      return false;
    }
    if (!formData.entityName.trim()) {
      setErrorMsg('Entitas wajib dipilih/diisi');
      return false;
    }
    if (!formData.platformName.trim()) {
      setErrorMsg('Platform wajib dipilih/diisi');
      return false;
    }
    if (!formData.deadline) {
      setErrorMsg('Deadline wajib ditentukan');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal membuat permintaan konten');
      }

      router.push(`/dashboard/content/${data.content.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Form Permintaan Konten Baru
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Lengkapi detail langkah demi langkah untuk memfasilitasi penugasan dan alur kerja tim produksi.
        </p>

        {/* Step Indicator */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {[
            { stepNum: 1, label: 'Informasi Campaign', icon: Megaphone },
            { stepNum: 2, label: 'Penugasan Tim', icon: Users },
            { stepNum: 3, label: 'Brief Konten', icon: FileText },
            { stepNum: 4, label: 'Aset & Referensi', icon: Link2 },
            { stepNum: 5, label: 'Konfirmasi', icon: CheckCircle2 },
          ].map((item) => {
            const Icon = item.icon;
            const isDone = step > item.stepNum;
            const isCurrent = step === item.stepNum;

            return (
              <div
                key={item.stepNum}
                onClick={() => {
                  if (item.stepNum < step) setStep(item.stepNum);
                }}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  isCurrent
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-bold line-clamp-1">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
          {errorMsg}
        </div>
      )}

      {/* STEP 1 — CAMPAIGN INFORMATION */}
      {step === 1 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100">
            Langkah 1 — Informasi Campaign & Target
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Nama Campaign <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Sedekah Pangan Gaza"
                value={formData.campaignName}
                onChange={(e) => {
                  handleChange('campaignName', e.target.value);
                  if (!formData.title) handleChange('title', e.target.value);
                }}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Status Campaign
              </label>
              <select
                value={formData.campaignStatus}
                onChange={(e) => handleChange('campaignStatus', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="New">New</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Entitas Pemasaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.entityName}
                onChange={(e) => handleChange('entityName', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Pilih Entitas --</option>
                <option value="Hijafera">Hijafera</option>
                <option value="Kala">Kala</option>
                {entities.filter((e) => !['Hijafera', 'Kala'].includes(e.name)).map((e) => (
                  <option key={e.id} value={e.name}>{e.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Platform Pemasaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Pilih Platform --</option>
                <option value="Shopee">Shopee</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="Website">Website</option>
                {platforms.filter((p) => !['Shopee', 'TikTok', 'Instagram', 'Website'].includes(p.name)).map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Prioritas <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Urgent">Urgent</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Tenggat Waktu / Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Kategori Konten
              </label>
              <input
                type="text"
                placeholder="Contoh: Fashion, Promo, Skincare, Launching"
                value={formData.contentCategory}
                onChange={(e) => handleChange('contentCategory', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              <span>Lanjut ke Penugasan Tim</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — PEOPLE / ASSIGNMENT */}
      {step === 2 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100">
            Langkah 2 — Penugasan Anggota Tim
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">Advertiser / PIC</span>
              <select
                value={formData.advertiserId}
                onChange={(e) => handleChange('advertiserId', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">-- Pilih Advertiser --</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">Copywriter</span>
              <select
                value={formData.copywriterId}
                onChange={(e) => handleChange('copywriterId', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">-- Pilih Copywriter --</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">Video Editor</span>
              <select
                value={formData.videoEditorId}
                onChange={(e) => handleChange('videoEditorId', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">-- Pilih Video Editor --</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              <span>Lanjut ke Brief Konten</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — CONTENT BRIEF */}
      {step === 3 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100">
            Langkah 3 — Brief Pemasaran & Instruksi Kreatif
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Judul Konten / Output
                </label>
                <input
                  type="text"
                  placeholder="Judul spesifik konten"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Jumlah Video / Aset Dibutuhkan
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.videoCount}
                  onChange={(e) => handleChange('videoCount', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Brief Advertiser (Detail Instruksi Lengkap)
              </label>
              <textarea
                rows={5}
                placeholder="Tuliskan instruksi hook, alur cerita, teks di layar, backsound, dan gaya penyuntingan yang diinginkan..."
                value={formData.briefAdvertiser}
                onChange={(e) => handleChange('briefAdvertiser', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Tujuan Konten (Objective)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kepedulian pangan Gaza"
                  value={formData.objective}
                  onChange={(e) => handleChange('objective', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Donatur Muslim usia 25-50"
                  value={formData.targetAudience}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Pesan Utama (Key Message)
                </label>
                <input
                  type="text"
                  placeholder="Pesan utama yang ingin disampaikan"
                  value={formData.keyMessage}
                  onChange={(e) => handleChange('keyMessage', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Call to Action (CTA)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sedekah Sekarang"
                  value={formData.cta}
                  onChange={(e) => handleChange('cta', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Daftar Tugas / Checklist (To Do)
              </label>
              <input
                type="text"
                placeholder="Catatan pengerjaan singkat..."
                value={formData.toDo}
                onChange={(e) => handleChange('toDo', e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              <span>Lanjut ke Aset & Referensi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — REFERENCES & ASSETS */}
      {step === 4 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100">
            Langkah 4 — Link Aset, VT Sebelumnya & Referensi
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Folder Link Aset (Google Drive / Dropbox)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={formData.assetLink}
                  onChange={(e) => handleChange('assetLink', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Link Referensi Utama / Benchmark
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/ads/library/..."
                  value={formData.referenceUrl}
                  onChange={(e) => handleChange('referenceUrl', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  VT / Konten Sebelumnya
                </label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@account/video/..."
                  value={formData.previousVt}
                  onChange={(e) => handleChange('previousVt', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  URL Referensi Campaign Internal
                </label>
                <input
                  type="url"
                  placeholder="https://yayasansyekhalijaber.com/campaign/..."
                  value={formData.campaignRefUrl}
                  onChange={(e) => handleChange('campaignRefUrl', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Additional Reference Links */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Link Referensi Tambahan (Bisa Lebih Dari Satu)
                </label>
                <button
                  type="button"
                  onClick={handleAddRefLink}
                  className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Link</span>
                </button>
              </div>

              {formData.additionalRefLinks.map((linkItem, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Judul / Label Link"
                    value={linkItem.label}
                    onChange={(e) => handleRefLinkChange(idx, 'label', e.target.value)}
                    className="w-1/3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={linkItem.url}
                    onChange={(e) => handleRefLinkChange(idx, 'url', e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs"
                  />
                  {formData.additionalRefLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRefLink(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              <span>Ringkasan & Konfirmasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5 — SUBMIT & OVERVIEW */}
      {step === 5 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100">
            Langkah 5 — Ringkasan Permintaan Konten
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl space-y-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px]">Informasi Utama</h3>
              <p><span className="text-slate-500">Campaign:</span> <strong>{formData.campaignName}</strong> ({formData.campaignStatus})</p>
              <p><span className="text-slate-500">Entitas:</span> <strong>{formData.entityName}</strong></p>
              <p><span className="text-slate-500">Platform:</span> <strong>{formData.platformName}</strong></p>
              <p><span className="text-slate-500">Prioritas:</span> <strong className="text-rose-600">{formData.priority}</strong></p>
              <p><span className="text-slate-500">Deadline:</span> <strong>{formData.deadline}</strong></p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl space-y-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px]">Tim Ditugaskan</h3>
              <p><span className="text-slate-500">Advertiser:</span> {teamMembers.find((m) => m.id === formData.advertiserId)?.name || 'Belum dipilih'}</p>
              <p><span className="text-slate-500">Copywriter:</span> {teamMembers.find((m) => m.id === formData.copywriterId)?.name || 'Belum dipilih'}</p>
              <p><span className="text-slate-500">Video Editor:</span> {teamMembers.find((m) => m.id === formData.videoEditorId)?.name || 'Belum dipilih'}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl space-y-2 text-xs">
            <h3 className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px]">Brief Advertiser</h3>
            <p className="whitespace-pre-line text-slate-700 dark:text-zinc-300 font-mono text-[11px]">
              {formData.briefAdvertiser || 'Tidak ada catatan brief tambahan.'}
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali Edit</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 shadow-md transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{submitting ? 'Menyimpan...' : 'Submit Content Request'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
