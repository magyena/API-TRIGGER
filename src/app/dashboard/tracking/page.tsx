'use client';

import { useState } from 'react';
import { Compass, Filter, Search, ShieldCheck, Smartphone, Globe, ArrowDownRight, ExternalLink } from 'lucide-react';

const mockVisitors = [
  {
    id: 'vis_8f91a2',
    sessionId: 'sess_9918231',
    ip: '180.252.164.12',
    country: 'Indonesia',
    province: 'Jawa Barat',
    city: 'Bandung',
    device: 'Mobile (iPhone 14)',
    browser: 'Safari',
    os: 'iOS 17.2',
    landingUrl: 'https://trigger.domain.com/?product=emma&fbclid=IwAR2...',
    referrer: 'https://m.facebook.com/',
    fbclid: 'IwAR2xK991aLks81726aZ...',
    ctwaClid: 'ctwa_981726a...',
    campaign: 'CTWA_Emma_Fashion_ID_Broad',
    adset: 'Adset_Women_25-45_Java',
    ad: 'Ad_Video_Emma_Pink',
    timestamp: '2026-07-23 18:42:10',
    status: 'Purchase',
  },
  {
    id: 'vis_7e82b1',
    sessionId: 'sess_9918230',
    ip: '114.122.38.99',
    country: 'Indonesia',
    province: 'Jawa Timur',
    city: 'Surabaya',
    device: 'Mobile (Samsung Galaxy S23)',
    browser: 'Chrome',
    os: 'Android 14',
    landingUrl: 'https://trigger.domain.com/?product=zahra&fbclid=IwAR3...',
    referrer: 'https://l.instagram.com/',
    fbclid: 'IwAR3yM112bLks9981a...',
    ctwaClid: 'ctwa_882716b...',
    campaign: 'CTWA_Retargeting_Engaged_30d',
    adset: 'Adset_Retargeting_WA_Leads',
    ad: 'Ad_Carousel_Zahra_Abaya',
    timestamp: '2026-07-23 18:39:45',
    status: 'Purchase',
  },
  {
    id: 'vis_6d73c0',
    sessionId: 'sess_9918229',
    ip: '36.85.190.41',
    country: 'Indonesia',
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    device: 'Mobile (Xiaomi 13)',
    browser: 'Chrome',
    os: 'Android 13',
    landingUrl: 'https://trigger.domain.com/?product=emma',
    referrer: 'https://fb.me/',
    fbclid: 'IwAR1zN554cLks1122a...',
    ctwaClid: 'ctwa_773615c...',
    campaign: 'CTWA_Emma_Fashion_ID_Broad',
    adset: 'Adset_Women_25-45_Java',
    ad: 'Ad_Image_Emma_Blue',
    timestamp: '2026-07-23 18:35:12',
    status: 'WA Open',
  },
  {
    id: 'vis_5c64d9',
    sessionId: 'sess_9918228',
    ip: '125.160.77.10',
    country: 'Indonesia',
    province: 'Sumatera Utara',
    city: 'Medan',
    device: 'Mobile (iPhone 13)',
    browser: 'Safari',
    os: 'iOS 16.5',
    landingUrl: 'https://trigger.domain.com/?product=aisha',
    referrer: 'https://m.facebook.com/',
    fbclid: 'IwAR4aP778dLks3344b...',
    ctwaClid: 'ctwa_664514d...',
    campaign: 'CTWA_Lookalike_1pct_Purchasers',
    adset: 'Adset_Muslimah_Fashion_Interest',
    ad: 'Ad_Video_Aisha_Pashmina',
    timestamp: '2026-07-23 18:28:04',
    status: 'Checkout',
  },
  {
    id: 'vis_4b55e8',
    sessionId: 'sess_9918227',
    ip: '110.138.22.84',
    country: 'Indonesia',
    province: 'DI Yogyakarta',
    city: 'Sleman',
    device: 'Desktop (Windows)',
    browser: 'Edge',
    os: 'Windows 11',
    landingUrl: 'https://trigger.domain.com/?product=emma',
    referrer: 'https://facebook.com/',
    fbclid: 'IwAR5bQ889eLks5566c...',
    ctwaClid: 'ctwa_555413e...',
    campaign: 'CTWA_Hijab_Premium_Interest',
    adset: 'Adset_Muslimah_Fashion_Interest',
    ad: 'Ad_Image_Emma_Pink',
    timestamp: '2026-07-23 18:20:19',
    status: 'Landing',
  },
];

export default function TrackingDatabasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filtered = mockVisitors.filter((v) => {
    const matchSearch =
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.fbclid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || v.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Purchase':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Checkout':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'WA Open':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-600" /> Tracking Database & Journey Stream
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Data real-time seluruh visitor, IP, geolokasi, parameter FBCLID / CTWA, dan status journey.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Visitor ID, Kota, Campaign, FBCLID..."
            className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['ALL', 'Landing', 'WA Open', 'Checkout', 'Purchase'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === status
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4">Visitor & Session</th>
                <th className="py-4 px-4">Location & Device</th>
                <th className="py-4 px-4">Campaign & Adset</th>
                <th className="py-4 px-4">FBCLID / CTWA</th>
                <th className="py-4 px-4">Timestamp</th>
                <th className="py-4 px-4">Journey Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">{v.id}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{v.sessionId}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-purple-600" /> {v.city}, {v.province}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Smartphone className="w-3 h-3 text-slate-400" /> {v.device} ({v.ip})
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-white truncate">{v.campaign}</div>
                    <div className="text-[10px] text-slate-400 truncate">{v.adset} • {v.ad}</div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs font-mono">
                    <div className="text-[11px] text-purple-700 dark:text-purple-400 truncate font-semibold">
                      {v.fbclid || '-'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{v.ctwaClid}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {v.timestamp}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                        v.status
                      )}`}
                    >
                      {v.status}
                    </span>
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
