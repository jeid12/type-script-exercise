import * as dom from '@/lib/dom';
import { User } from '@/lib/types';

export function renderDashboardLayout(
  user: User,
  currentPage: string,
  onNavClick: (page: string) => void,
  onLogout: () => void
): HTMLDivElement {
  const dashboardPage = dom.querySelector<HTMLDivElement>('#dashboard-page')!;
  dom.clearChildren(dashboardPage);

  const html = `
    <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside class="w-64 bg-slate-900 text-white p-6 hidden lg:flex flex-col">
        <h1 class="text-2xl font-bold mb-12 tracking-tight">finance</h1>
        
        <nav class="flex-1 space-y-3">
          <a href="#" class="nav-link flex items-center gap-4 px-4 py-3 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors ${currentPage === 'overview' ? 'bg-slate-800 text-white' : ''}" data-page="overview">
            <span class="text-2xl">📊</span>
            <span class="font-medium">Overview</span>
          </a>
          <a href="#" class="nav-link flex items-center gap-4 px-4 py-3 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors ${currentPage === 'transactions' ? 'bg-slate-800 text-white' : ''}" data-page="transactions">
            <span class="text-2xl">💳</span>
            <span class="font-medium">Transactions</span>
          </a>
          <a href="#" class="nav-link flex items-center gap-4 px-4 py-3 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors ${currentPage === 'budgets' ? 'bg-slate-800 text-white' : ''}" data-page="budgets">
            <span class="text-2xl">📈</span>
            <span class="font-medium">Budgets</span>
          </a>
          <a href="#" class="nav-link flex items-center gap-4 px-4 py-3 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors ${currentPage === 'pots' ? 'bg-slate-800 text-white' : ''}" data-page="pots">
            <span class="text-2xl">🏦</span>
            <span class="font-medium">Pots</span>
          </a>
          <a href="#" class="nav-link flex items-center gap-4 px-4 py-3 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors ${currentPage === 'bills' ? 'bg-slate-800 text-white' : ''}" data-page="bills">
            <span class="text-2xl">📄</span>
            <span class="font-medium">Recurring Bills</span>
          </a>
        </nav>
        
        <button id="logout-btn" class="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
          <span>→</span> Logout
        </button>
      </aside>

      <main class="flex-1 flex flex-col">
        <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 lg:px-12 py-6 flex justify-between items-center">
          <h2 id="page-title" class="text-3xl font-bold text-slate-900 dark:text-white">Overview</h2>
          <div class="flex items-center gap-4">
            <span class="hidden sm:block text-sm text-slate-600 dark:text-slate-400">Welcome, <strong>${user.name}</strong></span>
            <button id="mobile-logout-btn" class="lg:hidden bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors">Logout</button>
          </div>
        </header>

        <div class="flex-1 p-6 lg:p-12 overflow-y-auto">
          <div id="pages" class="space-y-8">
            <div id="overview-page" class="space-y-8"></div>
            <div id="transactions-page" class="hidden space-y-8"></div>
            <div id="budgets-page" class="hidden space-y-8"></div>
            <div id="pots-page" class="hidden space-y-8"></div>
            <div id="bills-page" class="hidden space-y-8"></div>
          </div>
        </div>
      </main>
    </div>
  `;

  dom.setHTML(dashboardPage, html);
  dom.show(dashboardPage);

  const navLinks = dom.querySelectorAll<HTMLAnchorElement>('.nav-link');
  navLinks.forEach(link => {
    dom.addEventListener(link, 'click', (e: Event) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (page) {
        onNavClick(page);
      }
    });
  });

  const logoutBtn = dom.querySelector<HTMLButtonElement>('#logout-btn');
  if (logoutBtn) {
    dom.addEventListener(logoutBtn, 'click', onLogout);
  }

  const mobileLogoutBtn = dom.querySelector<HTMLButtonElement>('#mobile-logout-btn');
  if (mobileLogoutBtn) {
    dom.addEventListener(mobileLogoutBtn, 'click', onLogout);
  }

  return dashboardPage;
}

export function switchPage(page: string, pageTitle: string): void {
  const pages = dom.querySelectorAll<HTMLDivElement>('[id$="-page"]');
  pages.forEach(p => dom.hide(p));

  const targetPage = dom.querySelector<HTMLDivElement>(`#${page}-page`)!;
  if (targetPage) {
    dom.show(targetPage);
  }

  const titleEl = dom.querySelector<HTMLHeadingElement>('#page-title')!;
  if (titleEl) {
    dom.setText(titleEl, pageTitle);
  }

  const navLinks = dom.querySelectorAll<HTMLAnchorElement>('.nav-link');
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === page) {
      link.classList.add('bg-slate-800', 'text-white');
    } else {
      link.classList.remove('bg-slate-800', 'text-white');
    }
  });
}
