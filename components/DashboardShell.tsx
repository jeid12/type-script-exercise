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
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const currentUser = storage.getUser();
    if (!currentUser) {
      router.replace('/');
      return;
    }

    const storedSidebarState = localStorage.getItem('finance_sidebar_collapsed');
    const sidebarState = storedSidebarState === null ? true : storedSidebarState === 'true';
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
    <div className="min-h-screen bg-[#f4f1f1] text-slate-900 flex">
      <aside className={`bg-[#1d1d2b] text-slate-100 transition-all duration-300 ${collapsed ? 'w-[58px]' : 'w-60'} p-3 md:p-4 flex flex-col`}>
        <div className={`mb-8 ${collapsed ? 'mt-1' : 'mt-2'}`}>
          <h1 className={`font-bold tracking-tight ${collapsed ? 'text-4xl text-center' : 'text-4xl px-2'}`}>
            {collapsed ? 'f' : 'finance'}
          </h1>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${
                  collapsed
                    ? active
                      ? 'text-[#37b8b4]'
                      : 'text-slate-300 hover:text-white'
                    : active
                      ? 'bg-[#f4f4f4] text-[#1d1d2b] font-semibold'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
                title={item.label}
              >
                <span className="text-[15px] leading-none">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 pt-4">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm text-slate-300 hover:bg-slate-700/40"
          >
            <span>{collapsed ? '▸' : '◂'}</span>
            {!collapsed && <span>Minimize Menu</span>}
          </button>
        </div>
      </aside>

      <section className="flex-1 p-6 md:p-8 lg:p-10">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-[42px] leading-none font-bold text-[#23232d]">{pageTitle}</h2>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1d1d2b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a2a3c]"
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </header>

        {children}
      </section>
    </div>
  );
}
