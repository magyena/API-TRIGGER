'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  Layers,
  Tag,
  Calendar,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ShoppingBag,
  Coffee,
  Zap,
  Car,
  Tv,
  HeartPulse,
  GraduationCap,
  Briefcase,
  HelpCircle,
  X,
  PlusCircle,
  Save,
} from 'lucide-react';
import { FinancialTransaction, TransactionCategory, TransactionType, FinancialItem } from '@/lib/finance-store';

const CATEGORIES: TransactionCategory[] = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Tagihan & Utilitas',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Pendapatan',
  'Lainnya',
];

const PAYMENT_METHODS = ['Cash', 'QRIS', 'Transfer', 'Debit', 'Kartu Kredit'];

const CATEGORY_ICONS: Record<TransactionCategory, any> = {
  'Makanan & Minuman': Coffee,
  Transportasi: Car,
  Belanja: ShoppingBag,
  'Tagihan & Utilitas': Zap,
  Hiburan: Tv,
  Kesehatan: HeartPulse,
  Pendidikan: GraduationCap,
  Pendapatan: Briefcase,
  Lainnya: HelpCircle,
};

const CATEGORY_BUDGETS: Record<string, number> = {
  'Makanan & Minuman': 2000000,
  Transportasi: 1000000,
  Belanja: 1500000,
  'Tagihan & Utilitas': 1000000,
  Hiburan: 800000,
  Kesehatan: 500000,
};

const SAMPLE_PROMPTS = [
  'Beli kopi 25k sama roti 15rb di Janji Jiwa QRIS kemarin',
  'Gaji bulan September 12.5jt via transfer',
  'Bayar token listrik PLN 350rb transfer',
  'Bensin Shell V-Power 150k pakai kartu kredit',
  'Nonton XXI 2 tiket 100rb plus popcorn 20k cash',
  'Belanja kemeja Airism Uniqlo 599rb debit',
];

export default function FinanceAssistantPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    totalCount: 0,
    categoryExpenses: {} as Record<string, number>,
  });

  // Extraction State
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [promptText, setPromptText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);

  // Manual Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMerchant, setFormMerchant] = useState('');
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('Makanan & Minuman');
  const [formAmount, setFormAmount] = useState<number | string>('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('QRIS');
  const [formSummary, setFormSummary] = useState('');
  const [formItems, setFormItems] = useState<FinancialItem[]>([{ name: '', qty: 1, price: 0 }]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTransactions();
  }, [selectedCategory, selectedType, searchQuery]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedType !== 'All') params.append('type', selectedType);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/finance/transactions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // AI Extract Text Prompt
  const handleExtractText = async (textToExtract?: string) => {
    const text = textToExtract || promptText;
    if (!text.trim()) return;

    try {
      setExtracting(true);
      setExtractedData(null);

      const res = await fetch('/api/finance/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await res.json();
      setExtractedData(data);
    } catch (err) {
      console.error('Error extracting financial data:', err);
    } finally {
      setExtracting(false);
    }
  };

  // AI Extract Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setExtracting(true);
        setExtractedData(null);

        const base64 = reader.result as string;
        const res = await fetch('/api/finance/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const data = await res.json();
        setExtractedData(data);
      } catch (err) {
        console.error('Error extracting image:', err);
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Extracted Data to Storage
  const handleSaveExtracted = async () => {
    if (!extractedData) return;

    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage('Transaksi berhasil disimpan ke database!');
        setExtractedData(null);
        setPromptText('');
        fetchTransactions();

        setTimeout(() => setSaveSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };

  // Save Manual or Edit Transaction
  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = typeof formAmount === 'string' ? parseInt(formAmount, 10) || 0 : formAmount;
    if (amountNum <= 0) return;

    const cleanItems = formItems.filter((it) => it.name.trim() !== '');

    const payload = {
      date: formDate,
      merchant: formMerchant || null,
      type: formType,
      category: formCategory,
      total_amount: amountNum,
      payment_method: formPaymentMethod || null,
      confidence_score: 1.0,
      items: cleanItems.length > 0 ? cleanItems : [{ name: `Transaksi ${formCategory}`, qty: 1, price: amountNum }],
      raw_summary: formSummary || `${formType === 'income' ? 'Penerimaan' : 'Pengeluaran'} ${formCategory} Rp${amountNum.toLocaleString('id-ID')}`,
    };

    try {
      if (editingTx) {
        await fetch('/api/finance/transactions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTx.id, ...payload }),
        });
      } else {
        await fetch('/api/finance/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowManualModal(false);
      setEditingTx(null);
      resetManualForm();
      fetchTransactions();
    } catch (err) {
      console.error('Error saving manual transaction:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    try {
      await fetch(`/api/finance/transactions?id=${id}`, { method: 'DELETE' });
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleEditClick = (tx: FinancialTransaction) => {
    setEditingTx(tx);
    setFormDate(tx.date);
    setFormMerchant(tx.merchant || '');
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormAmount(tx.total_amount);
    setFormPaymentMethod(tx.payment_method || 'QRIS');
    setFormSummary(tx.raw_summary);
    setFormItems(tx.items && tx.items.length > 0 ? tx.items : [{ name: '', qty: 1, price: 0 }]);
    setShowManualModal(true);
  };

  const resetManualForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMerchant('');
    setFormType('expense');
    setFormCategory('Makanan & Minuman');
    setFormAmount('');
    setFormPaymentMethod('QRIS');
    setFormSummary('');
    setFormItems([{ name: '', qty: 1, price: 0 }]);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Tanggal', 'Merchant', 'Tipe', 'Kategori', 'Metode Pembayaran', 'Total Nominal (Rp)', 'Ringkasan'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${t.merchant || '-'}"`,
      t.type,
      `"${t.category}"`,
      `"${t.payment_method || '-'}"`,
      t.total_amount,
      `"${t.raw_summary.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_keuangan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Engine Extraksi Keuangan AI v2.0</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Asisten Cerdas Pencatatan Keuangan
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Ekstrak & normalisasi data transaksi dari pesan WhatsApp, kalimat santai, atau foto struk nota menjadi JSON terstruktur secara otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingTx(null);
                resetManualForm();
                setShowManualModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Manual</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{saveSuccessMessage}</span>
          </div>
          <button onClick={() => setSaveSuccessMessage('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: AI Prompt & Receipt Scanner Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Box (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Financial Input Hub</h2>
              </div>

              {/* Tabs Toggle */}
              <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'text'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Teks Bebas</span>
                </button>
                <button
                  onClick={() => setActiveTab('image')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'image'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Foto Struk</span>
                </button>
              </div>
            </div>

            {activeTab === 'text' ? (
              <div className="space-y-4">
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
                  Tulis pesan atau rincian transaksi dalam bahasa bebas:
                </label>
                <textarea
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder='Contoh: "Beli kopi 25k sama roti 15rb di Janji Jiwa QRIS kemarin" atau "Gaji bulan ini 12.5jt transfer"'
                  className="w-full rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Sample Prompt Pills */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-2 block">
                    Coba Contoh Input Cepat:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PROMPTS.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPromptText(sample);
                          handleExtractText(sample);
                        }}
                        className="text-[11px] px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-medium transition-all text-left truncate max-w-xs"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
                  Unggah atau ambil foto struk / bukti transfer:
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-purple-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50 dark:bg-zinc-800/40 transition-all flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Klik untuk upload foto struk</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Format PNG, JPG, JPEG (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-2 block">
                    Atau gunakan contoh struk simulasi OCR:
                  </span>
                  <button
                    onClick={() => {
                      setExtracting(true);
                      setTimeout(() => {
                        setExtractedData({
                          date: new Date().toISOString().split('T')[0],
                          merchant: 'Starbucks Coffee FX Sudirman',
                          type: 'expense',
                          category: 'Makanan & Minuman',
                          total_amount: 85000,
                          payment_method: 'QRIS',
                          confidence_score: 0.97,
                          items: [
                            { name: 'Caffe Latte Venti', qty: 1, price: 62000 },
                            { name: 'Butter Croissant', qty: 1, price: 23000 },
                          ],
                          raw_summary: 'Hasil Struk: Pembelian Caffe Latte Venti dan Butter Croissant di Starbucks Coffee FX Sudirman via QRIS.',
                        });
                        setExtracting(false);
                      }, 800);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-600 dark:text-purple-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Simulasi Scan Struk Starbucks FX Sudirman</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-zinc-800">
            {activeTab === 'text' && (
              <button
                onClick={() => handleExtractText()}
                disabled={extracting || !promptText.trim()}
                className="w-full py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20"
              >
                {extracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengekstrak AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Ekstrak & Normalisasi Transaksi</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right JSON Preview Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hasil Extraksi JSON</h3>
                  <span className="text-[10px] text-slate-400">Skema Baku Validasi AI</span>
                </div>
              </div>

              {extractedData && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {Math.round(extractedData.confidence_score * 100)}% Confidence
                </span>
              )}
            </div>

            {extracting ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                  Menganalisis nominal, tipe, kategori & tanggal...
                </p>
              </div>
            ) : extractedData ? (
              <div className="space-y-4">
                {/* Summary Banner */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
                  <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    {extractedData.raw_summary}
                  </p>
                </div>

                {/* Grid Attributes */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-medium block">Nominal Normalized</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatRupiah(extractedData.total_amount)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-medium block">Type Transaksi</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold mt-0.5 ${
                        extractedData.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {extractedData.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {extractedData.type === 'income' ? 'Pemasukan (Income)' : 'Pengeluaran (Expense)'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-medium block">Kategori Baku</span>
                    <span className="font-bold text-slate-900 dark:text-white">{extractedData.category}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-medium block">Tanggal ISO</span>
                    <span className="font-bold text-slate-900 dark:text-white">{extractedData.date}</span>
                  </div>
                </div>

                {/* Items List */}
                {extractedData.items && extractedData.items.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 block">
                      Detail Items ({extractedData.items.length}):
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {extractedData.items.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-100 dark:bg-zinc-800/80"
                        >
                          <span className="font-medium text-slate-800 dark:text-zinc-200">
                            {item.qty}x {item.name}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatRupiah(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 stroke-1 mx-auto text-slate-300 dark:text-zinc-700" />
                <p className="text-xs">Belum ada hasil ekstraksi.</p>
                <p className="text-[11px] text-slate-400">Masukkan pesan atau upload foto struk untuk melihat hasil JSON.</p>
              </div>
            )}
          </div>

          {extractedData && (
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={handleSaveExtracted}
                className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Transaksi Ini</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Financial Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Income */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Total Pemasukan</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(summary.totalIncome)}
          </h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            + Total Inflow Keuangan
          </p>
        </div>

        {/* Card 2: Expense */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Total Pengeluaran</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(summary.totalExpense)}
          </h3>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
            - Total Outflow Keuangan
          </p>
        </div>

        {/* Card 3: Net Balance */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Net Saldo Bersih</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(summary.netBalance)}
          </h3>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Arus Kas Bersih
          </p>
        </div>

        {/* Card 4: Total Count */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Jumlah Transaksi</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {summary.totalCount} <span className="text-xs font-normal text-slate-400">Catatan</span>
          </h3>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Terekstrak & Tersimpan
          </p>
        </div>
      </div>

      {/* SECTION 3: Budget Monitor & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Expenses & Budgets (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Monitoring Budget Kategori</h3>
              <p className="text-xs text-slate-400">Batas anggaran pengeluaran bulanan</p>
            </div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full">
              Bulan September
            </span>
          </div>

          <div className="space-y-5">
            {Object.entries(CATEGORY_BUDGETS).map(([cat, budget]) => {
              const spent = summary.categoryExpenses[cat] || 0;
              const percent = Math.min(100, Math.round((spent / budget) * 100));
              const isOver = spent > budget;
              const IconComp = CATEGORY_ICONS[cat as TransactionCategory] || HelpCircle;

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-400">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{cat}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(spent)}</span>
                      <span className="text-slate-400"> / {formatRupiah(budget)} ({percent}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : percent > 75
                          ? 'bg-amber-500'
                          : 'bg-purple-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Financial Insights & Advice (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Analisis AI & Rekomendasi</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-xs space-y-2">
                <span className="font-bold text-purple-600 dark:text-purple-400 block">💡 Ringkasan Cashflow</span>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Rasio pengeluaran Anda terhadap pemasukan bulan ini berada di tingkat sangat aman{' '}
                  <span className="font-bold text-emerald-500">
                    ({Math.round((summary.totalExpense / (summary.totalIncome || 1)) * 100)}%)
                  </span>
                  . Saldo bersih terkumpul <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(summary.netBalance)}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-xs space-y-2">
                <span className="font-bold text-amber-600 dark:text-amber-400 block">🛍️ Kategori Pengeluaran Terbesar</span>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Pengeluaran tertinggi Anda bulan ini berada pada kategori{' '}
                  <span className="font-bold text-slate-900 dark:text-white">Belanja & Tagihan</span>. Pertahankan pengawasan pada transaksi non-esensial.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Semua data terverifikasi sesuai standar ISO-8601 & skema JSON baku.</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Transactions Table with Filters & Actions */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Table Header & Search Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Riwayat Transaksi Keuangan</h2>
            <p className="text-xs text-slate-400">Daftar transaksi yang terekstrak & terverifikasi</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari merchant, item, summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-56"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">Semua Kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-2 px-3 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">Semua Tipe</option>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 font-semibold">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Merchant & Ringkasan</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-right">Total Nominal</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                    Memuat transaksi...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada data transaksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const IconComp = CATEGORY_ICONS[tx.category] || HelpCircle;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {tx.date}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {tx.merchant || 'Merchant Umum'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{tx.raw_summary}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.type === 'income'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tx.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <IconComp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium text-slate-800 dark:text-zinc-200">{tx.category}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-[11px]">
                          {tx.payment_method || 'Cash'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-black text-sm ${
                            tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatRupiah(tx.total_amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(tx)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 transition-all"
                            title="Edit Transaksi"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-500 transition-all"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add / Edit Manual Transaction */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTx ? 'Edit Transaksi Keuangan' : 'Tambah Transaksi Baru'}
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Tanggal (ISO-8601)</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Tipe Transaksi</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TransactionType)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                  >
                    <option value="expense">Pengeluaran (Expense)</option>
                    <option value="income">Pemasukan (Income)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Nama Merchant / Toko</label>
                  <input
                    type="text"
                    placeholder="Contoh: Janji Jiwa / PLN"
                    value={formMerchant}
                    onChange={(e) => setFormMerchant(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Kategori Baku</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TransactionCategory)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Total Nominal (Rp)</label>
                  <input
                    type="number"
                    placeholder="40000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Metode Pembayaran</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Ringkasan Kalimat</label>
                <input
                  type="text"
                  placeholder="Membeli Kopi Susu & Roti di Janji Jiwa"
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
