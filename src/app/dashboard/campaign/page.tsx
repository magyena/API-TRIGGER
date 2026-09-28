'use client';

import { useState } from 'react';
import { Megaphone, Download, FileSpreadsheet, FileText, Calendar, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const mockCampaigns = [
  {
    id: 'cmp_1',
    campaign: 'CTWA_Emma_Fashion_ID_Broad',
    adset: 'Adset_Women_25-45_Java',
    ad: 'Ad_Video_Emma_Pink',
    product: 'Emma Dress',
    clicks: 5420,
    waOpens: 4410,
    purchases: 1040,
    revenue: 269360000,
    spend: 52600000,
    roas: 5.12,
    cpa: 50576,
  },
  {
    id: 'cmp_2',
    campaign: 'CTWA_Retargeting_Engaged_30d',
    adset: 'Adset_Retargeting_WA_Leads',
    ad: 'Ad_Carousel_Zahra_Abaya',
    product: 'Zahra Silk Abaya',
    clicks: 3810,
    waOpens: 3290,
    purchases: 890,
    revenue: 230510000,
    spend: 35730000,
    roas: 6.45,
    cpa: 40146,
  },
  {
    id: 'cmp_3',
    campaign: 'CTWA_Lookalike_1pct_Purchasers',
    adset: 'Adset_Muslimah_Fashion_Interest',
    ad: 'Ad_Video_Aisha_Pashmina',
    product: 'Aisha Pashmina Instant',
    clicks: 3200,
    waOpens: 2640,
    purchases: 580,
    revenue: 150220000,
    spend: 36630000,
    roas: 4.10,
    cpa: 63155,
  },
  {
    id: 'cmp_4',
    campaign: 'CTWA_Hijab_Premium_Interest',
    adset: 'Adset_Muslimah_Fashion_Interest',
    ad: 'Ad_Image_Emma_Blue',
    product: 'Emma Dress',
    clicks: 2450,
    waOpens: 1980,
    purchases: 410,
    revenue: 106190000,
    spend: 27580000,
    roas: 3.85,
    cpa: 67268,
  },
];

export default function CampaignReportPage() {
  const [selectedProduct, setSelectedProduct] = useState('ALL');

  const filtered = selectedProduct === 'ALL'
    ? mockCampaigns
    : mockCampaigns.filter((c) => c.product === selectedProduct);

  const exportCSV = () => {
    const headers = 'Campaign,Adset,Ad,Product,Clicks,WA Opens,Purchases,Revenue,ROAS,CPA\n';
    const rows = filtered
      .map(
        (c) =>
          `"${c.campaign}","${c.adset}","${c.ad}","${c.product}",${c.clicks},${c.waOpens},${c.purchases},${c.revenue},${c.roas},${c.cpa}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hijafera_campaign_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" /> Campaign Attribution & ROAS Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Laporan performa iklan Meta CTWA berdasarkan Campaign, Adset, Ad, dan Product level.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Filter className="w-4 h-4" /> Filter Produk:
          </div>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white outline-none"
          >
            <option value="ALL">Semua Produk</option>
            <option value="Emma Dress">Emma Dress</option>
            <option value="Zahra Silk Abaya">Zahra Silk Abaya</option>
            <option value="Aisha Pashmina Instant">Aisha Pashmina Instant</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-4 h-4 text-purple-600" /> Date Range: <b>30 Hari Terakhir</b>
        </div>
      </div>

      {/* Campaign Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4">Campaign & Adset</th>
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4 text-right">Clicks</th>
                <th className="py-4 px-4 text-right">WA Opens</th>
                <th className="py-4 px-4 text-right">Purchases</th>
                <th className="py-4 px-4 text-right">Spend</th>
                <th className="py-4 px-4 text-right">Revenue</th>
                <th className="py-4 px-4 text-right">ROAS</th>
                <th className="py-4 px-4 text-right">CPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">{c.campaign}</div>
                    <div className="text-[10px] text-slate-400">{c.adset} • {c.ad}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-purple-700 dark:text-purple-400">
                    {c.product}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold">{c.clicks.toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-700 dark:text-zinc-300">
                    {c.waOpens.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                    {c.purchases}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">{formatCurrency(c.spend)}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(c.revenue)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {c.roas}x
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-600 dark:text-zinc-400">
                    {formatCurrency(c.cpa)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
