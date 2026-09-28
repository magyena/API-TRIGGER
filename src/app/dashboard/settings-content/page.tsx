'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  FileSpreadsheet,
  Upload,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Megaphone,
  Globe,
  Award,
} from 'lucide-react';

export default function SettingsContentPage() {
  const [activeTab, setActiveTab] = useState<'import' | 'users' | 'master'>('import');

  // Excel Import States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState('');

  // User Management States
  const [users, setUsers] = useState<any[]>([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'COPYWRITER',
  });

  // Master Data States
  const [entities, setEntities] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [masterType, setMasterType] = useState<'entity' | 'platform' | 'campaign'>('entity');

  const loadData = async () => {
    try {
      const [uRes, eRes, pRes, cRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/master/entities'),
        fetch('/api/master/platforms'),
        fetch('/api/master/campaigns'),
      ]);

      const [uData, eData, pData, cData] = await Promise.all([
        uRes.json(),
        eRes.json(),
        pRes.json(),
        cRes.json(),
      ]);

      if (uData.users) setUsers(uData.users);
      if (eData.entities) setEntities(eData.entities);
      if (pData.platforms) setPlatforms(pData.platforms);
      if (cData.campaigns) setCampaigns(cData.campaigns);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setPreviewData(null);
    setImportResult(null);
    setImportError('');

    // Fetch Preview
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', 'preview');

    try {
      const res = await fetch('/api/import-excel', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setImportError(data.error || 'Gagal membaca preview Excel');
      } else {
        setPreviewData(data);
      }
    } catch (e: any) {
      setImportError(e.message || 'Gagal membaca file');
    }
  };

  const handleExecuteImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    setImportError('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('mode', 'execute');

    try {
      const res = await fetch('/api/import-excel', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal mengimpor Excel');
      }

      setImportResult(data);
      setPreviewData(null);
      setSelectedFile(null);
      loadData();
    } catch (e: any) {
      setImportError(e.message || 'Gagal mengimpor');
    } finally {
      setImporting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewUserModal(false);
        setNewUser({ name: '', email: '', password: 'password123', role: 'COPYWRITER' });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    let endpoint = '/api/master/entities';
    if (masterType === 'platform') endpoint = '/api/master/platforms';
    if (masterType === 'campaign') endpoint = '/api/master/campaigns';

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName.trim() }),
      });
      setNewItemName('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Pengaturan Sistem & Impor Excel (Admin Only)
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Kelola pengguna, data master entitas/platform/campaign, dan impor data massal dari Excel.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-4">
        {[
          { id: 'import', label: 'Impor Excel/CSV (Section 25)', icon: FileSpreadsheet },
          { id: 'users', label: 'Manajemen Tim & Pengguna', icon: Users },
          { id: 'master', label: 'Data Master (Entitas, Platform, Campaign)', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition ${
                isActive
                  ? 'border-slate-900 text-slate-900 dark:text-white dark:border-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXCEL IMPORT */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b">
              Upload & Impor Spreadsheet Konten
            </h2>

            <p className="text-xs text-slate-500">
              Mendukung file format <code>.xlsx</code> dan <code>.csv</code>. Sistem akan membaca kolom:
              <i> Campaign, Status Leads, Copywriter, Video Editor, Advertiser, Entitas, Platform, Priority, Deadline, Link Aset, Brief Advertiser, Grade, VT Sebelumnya, To Do, Referensi, Informasi Tambahan, Status Running.</i>
            </p>

            <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl p-8 text-center hover:bg-slate-50/50 transition">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Pilih atau drag file Excel/CSV ke sini
              </p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="mt-3 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>

            {importError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {importError}
              </div>
            )}

            {importResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{importResult.message}</span>
              </div>
            )}

            {/* Preview Section */}
            {previewData && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase">
                    Preview Data (Total {previewData.totalParsed} Baris Ditemukan)
                  </span>

                  <button
                    onClick={handleExecuteImport}
                    disabled={importing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 shadow-md transition disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{importing ? 'Mengimpor...' : 'Eksekusi Impor Massal'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-700 font-extrabold text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">ID Temp</th>
                        <th className="p-2.5">Campaign</th>
                        <th className="p-2.5">Entitas</th>
                        <th className="p-2.5">Platform</th>
                        <th className="p-2.5">Priority</th>
                        <th className="p-2.5">Deadline</th>
                        <th className="p-2.5">Copywriter</th>
                        <th className="p-2.5">Video Editor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {previewData.preview.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono">{row.id}</td>
                          <td className="p-2.5 font-bold">{row.campaignName}</td>
                          <td className="p-2.5">{row.entityName}</td>
                          <td className="p-2.5">{row.platformName}</td>
                          <td className="p-2.5 font-semibold text-rose-600">{row.priority}</td>
                          <td className="p-2.5">{new Date(row.deadline).toLocaleDateString('id-ID')}</td>
                          <td className="p-2.5">{row.copywriterName || '-'}</td>
                          <td className="p-2.5">{row.videoEditorName || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Daftar Anggota Tim ({users.length})
            </h2>

            <button
              onClick={() => setShowNewUserModal(!showNewUserModal)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          </div>

          {showNewUserModal && (
            <form onSubmit={handleCreateUser} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border rounded-xl px-3 py-2 text-xs"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border rounded-xl px-3 py-2 text-xs"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border rounded-xl px-3 py-2 text-xs"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="ADVERTISER">ADVERTISER</option>
                  <option value="COPYWRITER">COPYWRITER</option>
                  <option value="VIDEO_EDITOR">VIDEO_EDITOR</option>
                </select>
                <button type="submit" className="bg-slate-900 text-white font-bold rounded-xl text-xs py-2">
                  Simpan Pengguna
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                    <p className="text-slate-400">{u.email}</p>
                  </div>
                </div>

                <span className="font-extrabold text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MASTER DATA */}
      {activeTab === 'master' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b">
            Kelola Master Data Sistem
          </h2>

          <form onSubmit={handleCreateMaster} className="flex gap-3 max-w-xl">
            <select
              value={masterType}
              onChange={(e) => setMasterType(e.target.value as any)}
              className="bg-slate-50 dark:bg-zinc-800 border rounded-xl px-3 py-2 text-xs"
            >
              <option value="entity">Entitas Baru</option>
              <option value="platform">Platform Baru</option>
              <option value="campaign">Campaign Baru</option>
            </select>

            <input
              type="text"
              placeholder="Nama data master baru..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-zinc-800 border rounded-xl px-3 py-2 text-xs"
            />

            <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">
              Tambah
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t text-xs">
            <div className="p-4 border rounded-xl space-y-2">
              <h3 className="font-extrabold uppercase text-[10px] text-slate-400">Master Entitas ({entities.length})</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {entities.map((e) => (
                  <div key={e.id} className="p-2 bg-slate-50 rounded font-medium">{e.name}</div>
                ))}
              </div>
            </div>

            <div className="p-4 border rounded-xl space-y-2">
              <h3 className="font-extrabold uppercase text-[10px] text-slate-400">Master Platform ({platforms.length})</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {platforms.map((p) => (
                  <div key={p.id} className="p-2 bg-slate-50 rounded font-medium">{p.name}</div>
                ))}
              </div>
            </div>

            <div className="p-4 border rounded-xl space-y-2">
              <h3 className="font-extrabold uppercase text-[10px] text-slate-400">Master Campaign ({campaigns.length})</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {campaigns.map((c) => (
                  <div key={c.id} className="p-2 bg-slate-50 rounded font-medium">{c.name}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
