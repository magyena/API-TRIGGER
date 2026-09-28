'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Clock, Scale, Shuffle, RotateCw, CheckCircle2, Phone, Edit, Trash2 } from 'lucide-react';

export default function WhatsAppPage() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [strategy, setStrategy] = useState('ROUND_ROBIN');
  const [showModal, setShowModal] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [weight, setWeight] = useState(1);
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('21:00');

  const fetchWA = async () => {
    const res = await fetch('/api/whatsapp');
    const data = await res.json();
    if (data.numbers) setNumbers(data.numbers);
    if (data.strategy) setStrategy(data.strategy);
  };

  useEffect(() => {
    fetchWA();
  }, []);

  const handleStrategyChange = async (newStrat: string) => {
    setStrategy(newStrat);
    await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy: newStrat }),
    });
  };

  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phoneNumber, weight, startHour, endHour }),
    });
    setShowModal(false);
    fetchWA();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" /> WhatsApp Multi-Number Router Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manajemen rotasi nomor admin WA, bobot traffic (Weighted), Round Robin, dan jam operasional.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20"
        >
          <Plus className="w-4 h-4" /> Tambah Nomor CS
        </button>
      </div>

      {/* Rotation Strategy Selector */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pilih Algoritma Rotasi Traksi Traffic</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'ROUND_ROBIN',
              title: 'Round Robin',
              desc: 'Rotasi berurutan secara adil ke setiap CS aktif',
              icon: RotateCw,
            },
            {
              id: 'WEIGHTED',
              title: 'Weighted Distribution',
              desc: 'Bagi traffic berdasarkan bobot persentase CS',
              icon: Scale,
            },
            {
              id: 'RANDOM',
              title: 'Random Number',
              desc: 'Pilih nomor CS secara acak untuk setiap lead',
              icon: Shuffle,
            },
          ].map((strat) => {
            const Icon = strat.icon;
            const isSelected = strategy === strat.id;
            return (
              <div
                key={strat.id}
                onClick={() => handleStrategyChange(strat.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/50 shadow-sm'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} /> {strat.title}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{strat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Numbers List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Nomor Admin WhatsApp CS</h3>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {numbers.map((num) => (
            <div key={num.id} className="py-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{num.name}</h4>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                      Weight: {num.weight}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{num.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>{num.startHour} - {num.endHour}</span>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-slate-900 dark:text-white">{num.totalClicks} Leads</span>
                  <p className="text-[10px] text-slate-400">Total Leads Diterima</p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Number */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tambah Nomor Admin CS</h3>
            <form onSubmit={handleAddNumber} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Nama CS</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="CS Customer Care 3"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Nomor WhatsApp (Awali 62)</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="6281234567890"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Bobot (Weight)</label>
                  <input
                    type="number"
                    min="1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Jam Buka</label>
                  <input
                    type="text"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    placeholder="08:00"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Jam Tutup</label>
                  <input
                    type="text"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    placeholder="21:00"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-600"
                >
                  Simpan Nomor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
