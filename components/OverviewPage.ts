import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

const themeColorMap: Record<string, string> = {
  green: '#277c78',
  grey: '#97a0ac',
  cyan: '#82c9d7',
  orange: '#be6c49',
  purple: '#826cb0',
  red: '#c94736',
  yellow: '#f2cdac',
  navy: '#626070',
  turquoise: '#597c7c',
  brown: '#93674f',
  magenta: '#9d507d',
  blue: '#3f82b2',
};

function resolveThemeColor(theme: string): string {
  const key = theme.trim().toLowerCase();
  return themeColorMap[key] || themeColorMap.magenta;
}

function buildBudgetDonutGradient(
  budgets: Array<{ maxSpend: number; theme: string }>,
  totalLimit: number
): string {
  if (budgets.length === 0 || totalLimit <= 0) {
    return 'conic-gradient(#ece7e7 0% 100%)';
  }

  let start = 0;
  const slices: string[] = [];

  budgets.forEach((budget, index) => {
    const ratio = Math.max(0, budget.maxSpend) / totalLimit;
    const end = index === budgets.length - 1 ? 100 : Math.min(100, start + ratio * 100);
    slices.push(`${resolveThemeColor(budget.theme)} ${start.toFixed(2)}% ${end.toFixed(2)}%`);
    start = end;
  });

  if (start < 100) {
    slices.push(`#ece7e7 ${start.toFixed(2)}% 100%`);
  }

  return `conic-gradient(${slices.join(', ')})`;
}

export function renderOverviewPage(): void {
  const page = dom.querySelector<HTMLDivElement>('#overview-page')!;
  dom.clearChildren(page);

  const summary = storage.calculateSummary();
  const pots = storage.getPots();
  const budgets = storage.getBudgets();
  const transactions = storage.getTransactions();
  const billsSummary = storage.getBillsSummary();
  const expensesByCategory = storage.getExpensesByCategory();

  const firstPot = pots[0];
  const totalBudgetLimit = budgets.reduce((sum, budget) => sum + budget.maxSpend, 0);
  const totalBudgetSpent = budgets.reduce((sum, budget) => sum + (expensesByCategory[budget.category] || 0), 0);
  const budgetsRing = buildBudgetDonutGradient(budgets, totalBudgetLimit);
  const budgetsLegendHtml = budgets.length
    ? budgets
        .map(budget => {
          const spent = expensesByCategory[budget.category] || 0;
          const color = resolveThemeColor(budget.theme);
          return `
            <div class="border-l-4 pl-2" style="border-color:${color};">
              <p class="text-sm text-slate-500">${budget.category}</p>
              <p class="font-semibold text-[#1f2131]">${utils.formatCurrency(spent)}</p>
            </div>
          `;
        })
        .join('')
    : '<div class="border-l-4 pl-2" style="border-color:#d6d9df;"><p class="text-sm text-slate-500">No Budget</p><p class="font-semibold text-[#1f2131]">$0.00</p></div>';

  const html = `
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-[#1d1d2b] text-white rounded-xl p-4">
          <p class="text-xs text-slate-300 mb-2">Current Balance</p>
          <p class="text-[46px] leading-none font-bold">${utils.formatCurrency(summary.balance)}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-[#ece7e7]">
          <p class="text-xs text-slate-400 mb-2">Income</p>
          <p class="text-[46px] leading-none font-bold text-[#202233]">${utils.formatCurrency(summary.income)}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-[#ece7e7]">
          <p class="text-xs text-slate-400 mb-2">Expenses</p>
          <p class="text-[46px] leading-none font-bold text-[#202233]">${utils.formatCurrency(summary.expenses)}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div class="space-y-3">
          <section class="bg-white rounded-xl border border-[#ece7e7] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[32px] leading-none font-semibold text-[#272833]">Pots</h3>
              <a href="/pots" class="text-sm text-slate-500 hover:text-slate-700">See Details <span class="ml-1">›</span></a>
            </div>

            <div class="rounded-xl bg-[#f6f2f2] p-3 grid grid-cols-2 gap-3 items-center">
              <div class="border-r border-[#d7d0d0] pr-3">
                <p class="text-xs text-slate-500 mb-1">Pots</p>
                <p class="text-5xl font-bold text-[#1f2131]">${firstPot ? Math.floor(firstPot.saved) : 0}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">${firstPot ? firstPot.name : 'No pot yet'}</p>
                <p class="text-4xl font-bold text-[#1f2131]">${firstPot ? utils.formatCurrency(firstPot.saved) : '$0'}</p>
              </div>
            </div>
          </section>

          <section class="bg-white rounded-xl border border-[#ece7e7] p-4 min-h-[132px]">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[32px] leading-none font-semibold text-[#272833]">Transactions</h3>
              <a href="/transactions" class="text-sm text-slate-500 hover:text-slate-700">See Details <span class="ml-1">›</span></a>
            </div>
            <p class="text-sm text-slate-400">${transactions.length === 0 ? 'No Data Provided' : `${transactions.length} transactions recorded`}</p>
          </section>
        </div>

        <div class="space-y-3">
          <section class="bg-white rounded-xl border border-[#ece7e7] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[32px] leading-none font-semibold text-[#272833]">Budgets</h3>
              <a href="/budgets" class="text-sm text-slate-500 hover:text-slate-700">See Details <span class="ml-1">›</span></a>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-4">
              <div class="flex justify-center">
                <div id="overview-balance-donut" class="js-balance-donut w-36 h-36 cursor-pointer rounded-full flex items-center justify-center" style="background:${budgetsRing};">
                  <div class="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center">
                    <span class="text-4xl leading-none font-bold text-[#1f2131]">$${Math.floor(totalBudgetSpent)}</span>
                    <span class="text-[11px] text-slate-500">of ${utils.formatCurrency(totalBudgetLimit)} limit</span>
                  </div>
                </div>
              </div>
              <div class="lg:pr-3">
                <div class="space-y-3">${budgetsLegendHtml}</div>
              </div>
            </div>
          </section>

          <section class="bg-white rounded-xl border border-[#ece7e7] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[32px] leading-none font-semibold text-[#272833]">Recurring Bills</h3>
              <a href="/recurring-bills" class="text-sm text-slate-500 hover:text-slate-700">See Details <span class="ml-1">›</span></a>
            </div>

            <div class="space-y-2">
              <div class="rounded-lg bg-[#f6f2f2] px-3 py-2 border-l-4 border-[#3f918d] flex items-center justify-between">
                <span class="text-sm text-slate-500">Paid Bills</span>
                <span class="font-semibold text-[#1f2131]">${utils.formatCurrency(billsSummary.paid)}</span>
              </div>
              <div class="rounded-lg bg-[#f6f2f2] px-3 py-2 border-l-4 border-[#f1be8d] flex items-center justify-between">
                <span class="text-sm text-slate-500">Total Upcoming</span>
                <span class="font-semibold text-[#1f2131]">${utils.formatCurrency(billsSummary.upcoming)}</span>
              </div>
              <div class="rounded-lg bg-[#f6f2f2] px-3 py-2 border-l-4 border-[#78d3e0] flex items-center justify-between">
                <span class="text-sm text-slate-500">Due Soon</span>
                <span class="font-semibold text-[#1f2131]">${utils.formatCurrency(billsSummary.due)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `;

  dom.setHTML(page, html);

  const donut = dom.querySelector<HTMLDivElement>('#overview-balance-donut');
  if (!donut) return;

  donut.addEventListener('click', () => {
    if (donut.dataset.spun === 'true') return;
    donut.dataset.spun = 'true';
    donut.classList.add('balance-donut-spin-once');
    donut.addEventListener(
      'animationend',
      () => {
        donut.classList.remove('balance-donut-spin-once');
      },
      { once: true }
    );
  });
}
