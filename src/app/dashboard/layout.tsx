'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Kanban,
  Calendar,
  PlusCircle,
  UserCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Layers,
  Video,
  PenTool,
  Megaphone,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch current authenticated user
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        // Fallback demo user if not logged in
        setUser({
          id: 'admin-id',
          name: 'Super Admin',
          email: 'admin@hijafera.com',
          role: 'ADMIN',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        });
      }
    } catch {
      setUser({
        id: 'admin-id',
        name: 'Super Admin',
        email: 'admin@hijafera.com',
        role: 'ADMIN',
      });
    } finally {
      setLoadingUser(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchNotifications();

    if (document.documentElement.classList.contains('dark')) {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleQuickRoleSwitch = async (role: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quickRole: role }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setShowRoleDropdown(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const markNotifRead = async (notifId?: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifId ? { notificationId: notifId } : { markAll: true }),
    });
    fetchNotifications();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/content?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navSections = [
    {
      title: 'UTAMA',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'KONTEN',
      items: [
        { name: 'All Content', href: '/dashboard/content', icon: FileText },
        { name: 'Kanban Board', href: '/dashboard/kanban', icon: Kanban },
        { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
      ],
    },
    {
      title: 'PERMINTAAN',
      items: [
        { name: 'New Request', href: '/dashboard/requests/new', icon: PlusCircle },
        { name: 'My Requests', href: '/dashboard/requests/my', icon: UserCheck },
      ],
    },
    {
      title: 'TIM & ANALITIK',
      items: [
        { name: 'Team Workload', href: '/dashboard/team', icon: Users },
        { name: 'Analytics', href: '/dashboard/analytics-content', icon: BarChart3 },
      ],
    },
  ];

  if (user?.role === 'ADMIN') {
    navSections.push({
      title: 'PENGATURAN',
      items: [
        { name: 'Settings & Import', href: '/dashboard/settings-content', icon: Settings },
      ],
    });
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
    ADVERTISER: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
    COPYWRITER: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
    VIDEO_EDITOR: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
  };

  const roleIcons: Record<string, any> = {
    ADMIN: ShieldAlert,
    ADVERTISER: Megaphone,
    COPYWRITER: PenTool,
    VIDEO_EDITOR: Video,
  };

  const RoleIcon = roleIcons[user?.role || 'ADMIN'] || ShieldAlert;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between sticky top-0 h-screen shrink-0 shadow-sm z-20">
        <div className="overflow-y-auto flex-1 p-4">
          {/* Brand Header */}
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-slate-100 dark:border-zinc-800 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-indigo-400 dark:text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                Content Operations
              </h2>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                Tracking & Workflow System
              </span>
            </div>
          </Link>

          {/* User Profile Card in Sidebar */}
          {user && (
            <div className="mb-4 p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-700/50">
              <div className="flex items-center gap-2.5">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-300" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${roleColors[user.role] || 'bg-slate-100 text-slate-700'}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role Quick Switch Button */}
              <div className="relative mt-2.5">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 transition"
                >
                  <span className="flex items-center gap-1.5">
                    <RoleIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Ganti Role (Demo)</span>
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl p-1 z-30 space-y-0.5">
                    {[
                      { role: 'ADMIN', label: 'Admin (Super)' },
                      { role: 'ADVERTISER', label: 'Advertiser (Rezza)' },
                      { role: 'COPYWRITER', label: 'Copywriter (Yuli)' },
                      { role: 'VIDEO_EDITOR', label: 'Video Editor (Putri/Faisal)' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        onClick={() => handleQuickRoleSwitch(item.role)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          user.role === item.role
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          <nav className="space-y-4">
            {navSections.map((section) => (
              <div key={section.title}>
                <div className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 dark:text-zinc-500'}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Header */}
        <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10">
          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari campaign, ID (CNT-2026...), entitas, platform, brief..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-zinc-800 border-none rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Add Request Button */}
            <Link
              href="/dashboard/requests/new"
              className="flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat Request</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 relative transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-3 z-40">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800 mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notifikasi</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markNotifRead()}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline"
                      >
                        Tandai Semua Dibaca
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">Belum ada notifikasi baru.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotifRead(n.id);
                            if (n.link) router.push(n.link);
                          }}
                          className={`p-2.5 rounded-lg text-xs cursor-pointer transition ${
                            n.isRead
                              ? 'bg-slate-50 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400'
                              : 'bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-white font-medium border-l-2 border-indigo-500'
                          }`}
                        >
                          <p className="font-bold">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
