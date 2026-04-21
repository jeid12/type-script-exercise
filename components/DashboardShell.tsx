'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as storage from '@/lib/storage';
import { User } from '@/lib/types';

type Props = {
  children: React.ReactNode;
};

const navItems = [
  { href: '/overview', label: 'Overview', icon: '⌂' },
  { href: '/transactions', label: 'Transactions', icon: '⇵' },
  { href: '/budgets', label: 'Budgets', icon: '◔' },
  { href: '/pots', label: 'Pots', icon: '◙' },
  { href: '/recurring-bills', label: 'Recurring bills', icon: '▤' },
];

const titleByPath: Record<string, string> = {
  '/overview': 'Overview',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/pots': 'Pots',
  '/recurring-bills': 'Recurring Bills',
};

export default function DashboardShell({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const currentUser = storage.getUser();
    if (!currentUser) {
      router.replace('/');
      return;
    }

    const sidebarState = localStorage.getItem('finance_sidebar_collapsed') === 'true';
    setCollapsed(sidebarState);
    setUser(currentUser);
    setReady(true);
  }, [router]);

  const pageTitle = useMemo(() => {
    return titleByPath[pathname] || 'Overview';
  }, [pathname]);

  function toggleSidebar(): void {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('finance_sidebar_collapsed', String(next));
      return next;
    });
  }

  function logout(): void {
    storage.logoutUser();
    router.replace('/');
  }

  if (!ready || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f2f2] text-slate-900 flex">
      <aside className={`bg-[#1d1d2b] text-slate-100 transition-all duration-300 ${collapsed ? 'w-24' : 'w-64'} p-4 md:p-6 flex flex-col rounded-r-3xl`}>
        <div className="mb-10">
          <h1 className={`font-bold tracking-tight ${collapsed ? 'text-3xl text-center' : 'text-5xl'}`}>
            {collapsed ? 'f' : 'finance'}
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4 px-4'} py-3 rounded-xl transition-colors ${
                  active
                    ? 'bg-[#f4f4f4] text-[#1d1d2b] font-semibold'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
                title={item.label}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 pt-6">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-500/40 py-2 text-sm text-slate-200 hover:bg-slate-700/40"
          >
            <span>{collapsed ? '▸' : '◂'}</span>
            {!collapsed && <span>Minimize Menu</span>}
          </button>
          <button
            onClick={logout}
            className="w-full rounded-xl bg-slate-100 text-slate-900 py-2 font-semibold hover:bg-white"
          >
            {collapsed ? '↩' : 'Logout'}
          </button>
        </div>
      </aside>

      <section className="flex-1 p-6 md:p-8 lg:p-10">
        <header className="mb-8 flex items-center justify-between">
          <h2 className="text-4xl font-bold text-[#22222d]">{pageTitle}</h2>
          <p className="hidden md:block text-sm text-slate-500">Welcome, {user.name}</p>
        </header>

        {children}
      </section>
    </div>
  );
}
