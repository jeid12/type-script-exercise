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

function colorByTheme(theme: string): string {
  return resolveThemeColor(theme);
}

function buildBudgetDonutGradient(
  budgets: Array<{ maxSpend: number; theme: string }>,
  totalLimit: number
): string {
  if (budgets.length === 0 || totalLimit <= 0) {
    return 'conic-gradient(#f2eeeb 0% 100%)';
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
    slices.push(`#f2eeeb ${start.toFixed(2)}% 100%`);
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

  const totalBudgetLimit = budgets.reduce((sum, budget) => sum + budget.maxSpend, 0);
  const totalBudgetSpent = budgets.reduce((sum, budget) => sum + (expensesByCategory[budget.category] || 0), 0);
  const budgetsRing = buildBudgetDonutGradient(budgets, totalBudgetLimit);
  const totalPotsSaved = pots.reduce((s, p) => s + p.saved, 0);

  const budgetsLegendHtml = budgets.length
    ? budgets.slice(0, 4).map(budget => {
        const spent = expensesByCategory[budget.category] || 0;
        const color = resolveThemeColor(budget.theme);
        return `
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="inline-block h-3 w-3 rounded-full shrink-0" style="background:${color}"></span>
              <span class="text-xs text-[#696868]">${budget.category}</span>
            </div>
            <span class="text-xs font-bold text-[#201f24]">${utils.formatCurrency(spent)}</span>
          </div>
        `;
      }).join('')
    : '<p class="text-xs text-[#696868]">No budgets yet</p>';

  const recentTransactionsHtml = transactions.length === 0
    ? '<p class="text-sm text-[#696868]">No transactions yet.</p>'
    : transactions.slice(0, 5).map(tx => {
        const name = tx.recipient || tx.description || 'Unknown';
        const amountClass = tx.type === 'income' ? 'text-[#277c78]' : 'text-[#201f24]';
        const prefix = tx.type === 'income' ? '+' : '-';
        return `
          <div class="flex items-center justify-between border-b border-[#f2eeeb] pb-4 last:border-0 last:pb-0">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-full bg-[#f2eeeb] text-xs font-bold text-[#201f24] flex items-center justify-center shrink-0">${name.charAt(0).toUpperCase()}</div>
              <div>
                <p class="text-sm font-bold text-[#201f24]">${name}</p>
                <p class="text-xs text-[#696868]">${tx.category}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold ${amountClass}">${prefix}${utils.formatCurrency(tx.amount)}</p>
              <p class="text-xs text-[#696868]">${utils.formatDateShort(tx.date)}</p>
            </div>
          </div>
        `;
      }).join('');

  const html = `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-[#201f24] text-white rounded-2xl p-6">
          <p class="text-sm text-[#b3b3b3] mb-3">Current Balance</p>
          <p class="text-[32px] leading-none font-bold">${utils.formatCurrency(summary.balance)}</p>
        </div>
        <div class="bg-white rounded-2xl p-6">
          <p class="text-sm text-[#696868] mb-3">Income</p>
          <p class="text-[32px] leading-none font-bold text-[#201f24]">${utils.formatCurrency(summary.income)}</p>
        </div>
        <div class="bg-white rounded-2xl p-6">
          <p class="text-sm text-[#696868] mb-3">Expenses</p>
          <p class="text-[32px] leading-none font-bold text-[#201f24]">${utils.formatCurrency(summary.expenses)}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div class="space-y-4">
          <section class="bg-white rounded-2xl p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-xl font-bold text-[#201f24]">Pots</h3>
              <a href="/pots" class="text-sm text-[#696868] hover:text-[#201f24] flex items-center gap-1">See Details <span>›</span></a>
            </div>
            <div class="rounded-xl bg-[#f8f4f0] p-4 grid grid-cols-2 gap-4 items-center">
              <div class="flex items-center gap-3 border-r border-[#e3ddd9] pr-4">
                <div class="h-10 w-10 rounded-full bg-[#201f24] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 12h-7V5l-7 7h7v7l7-7z"/></svg>
                </div>
                <div>
                  <p class="text-xs text-[#696868]">Total Saved</p>
                  <p class="text-xl font-bold text-[#201f24]">${utils.formatCurrency(totalPotsSaved)}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                ${pots.slice(0, 4).map(p => `
                  <div class="flex items-center gap-2">
                    <span class="inline-block h-3 w-1 rounded-sm shrink-0" style="background:${colorByTheme(p.theme)}"></span>
                    <div class="min-w-0">
                      <p class="text-xs text-[#696868] truncate">${p.name}</p>
                      <p class="text-xs font-bold text-[#201f24]">${utils.formatCurrency(p.saved)}</p>
                    </div>
                  </div>
                `).join('')}
                ${pots.length === 0 ? '<p class="text-xs text-[#696868] col-span-2">No pots yet</p>' : ''}
              </div>
            </div>
          </section>

          <section class="bg-white rounded-2xl p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-xl font-bold text-[#201f24]">Transactions</h3>
              <a href="/transactions" class="text-sm text-[#696868] hover:text-[#201f24] flex items-center gap-1">See All <span>›</span></a>
            </div>
            <div class="space-y-4">${recentTransactionsHtml}</div>
          </section>
        </div>

        <div class="space-y-4">
          <section class="bg-white rounded-2xl p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-xl font-bold text-[#201f24]">Budgets</h3>
              <a href="/budgets" class="text-sm text-[#696868] hover:text-[#201f24] flex items-center gap-1">See Details <span>›</span></a>
            </div>
            <div class="flex items-center gap-6">
              <div id="overview-balance-donut" class="js-balance-donut w-40 h-40 cursor-pointer rounded-full flex items-center justify-center shrink-0" style="background:${budgetsRing};">
                <div class="w-[100px] h-[100px] rounded-full bg-white flex flex-col items-center justify-center text-center">
                  <span class="text-xl leading-none font-bold text-[#201f24]">$${Math.floor(totalBudgetSpent)}</span>
                  <span class="text-[10px] text-[#696868] mt-1">of ${utils.formatCurrency(totalBudgetLimit)} limit</span>
                </div>
              </div>
              <div class="space-y-3 flex-1">${budgetsLegendHtml}</div>
            </div>
          </section>

          <section class="bg-white rounded-2xl p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-xl font-bold text-[#201f24]">Recurring Bills</h3>
              <a href="/recurring-bills" class="text-sm text-[#696868] hover:text-[#201f24] flex items-center gap-1">See Details <span>›</span></a>
            </div>
            <div class="space-y-3">
              <div class="rounded-xl bg-[#f8f4f0] px-4 py-3 border-l-4 border-[#277c78] flex items-center justify-between">
                <span class="text-sm text-[#696868]">Paid Bills</span>
                <span class="text-sm font-bold text-[#201f24]">${utils.formatCurrency(billsSummary.paid)}</span>
              </div>
              <div class="rounded-xl bg-[#f8f4f0] px-4 py-3 border-l-4 border-[#97a0ac] flex items-center justify-between">
                <span class="text-sm text-[#696868]">Total Upcoming</span>
                <span class="text-sm font-bold text-[#201f24]">${utils.formatCurrency(billsSummary.upcoming)}</span>
              </div>
              <div class="rounded-xl bg-[#f8f4f0] px-4 py-3 border-l-4 border-[#f2cdac] flex items-center justify-between">
                <span class="text-sm text-[#696868]">Due Soon</span>
                <span class="text-sm font-bold text-[#c94736]">${utils.formatCurrency(billsSummary.due)}</span>
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
    donut.addEventListener('animationend', () => {
      donut.classList.remove('balance-donut-spin-once');
    }, { once: true });
  });
}
