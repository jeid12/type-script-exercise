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
    <div className="min-h-screen bg-[#f8f4f0] text-[#201f24] flex">
      <aside className={`bg-[#201f24] text-[#b3b3b3] transition-all duration-300 ${collapsed ? 'w-[58px]' : 'w-[300px]'} flex flex-col rounded-r-2xl`}>
        <div className={`px-4 pt-8 pb-6 ${collapsed ? 'flex justify-center' : ''}`}>
          <h1 className="font-bold tracking-tight text-white text-2xl">
            {collapsed ? 'f' : 'finance.'}
          </h1>
        </div>

        <nav className="flex-1 pr-0 pb-4">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-4 pl-8 pr-6'} py-4 transition-colors border-r-4 ${
                  active
                    ? 'bg-[#f8f4f0] text-[#201f24] font-bold border-[#277c78]'
                    : 'border-transparent hover:text-white'
                }`}
                title={item.label}
              >
                <span className="text-lg leading-none shrink-0">{item.icon}</span>
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-8">
          <button
            onClick={toggleSidebar}
            className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'} py-3 text-sm hover:text-white transition-colors`}
          >
            <span className="text-base">{collapsed ? '▸' : '◂'}</span>
            {!collapsed && <span>Minimize Menu</span>}
          </button>
        </div>
      </aside>

      <section className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto">
        <header className="mb-8 flex items-center justify-between">
          <h2 className="text-[32px] leading-none font-bold text-[#201f24]">{pageTitle}</h2>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg bg-[#201f24] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
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
