import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

type ThemeStyle = {
  name: string;
  color: string;
};

const themeMap: Record<string, ThemeStyle> = {
  green: { name: 'Green', color: '#277c78' },
  grey: { name: 'Grey', color: '#97a0ac' },
  cyan: { name: 'Cyan', color: '#82c9d7' },
  orange: { name: 'Orange', color: '#be6c49' },
  purple: { name: 'Purple', color: '#826cb0' },
  red: { name: 'Red', color: '#c94736' },
  yellow: { name: 'Yellow', color: '#f2cdac' },
  navy: { name: 'Navy', color: '#626070' },
  turquoise: { name: 'Turquoise', color: '#597c7c' },
  brown: { name: 'Brown', color: '#93674f' },
  magenta: { name: 'Magenta', color: '#9d507d' },
  blue: { name: 'Blue', color: '#3f82b2' },
};

function getTheme(theme: string): ThemeStyle {
  const key = theme.trim().toLowerCase();
  return themeMap[key] || themeMap.magenta;
}

function normalizeCategory(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'bill' || normalized === 'bills') {
    return 'bill';
  }
  return normalized;
}

function isBudgetCategoryMatch(transactionCategory: string, budgetCategory: string): boolean {
  return normalizeCategory(transactionCategory) === normalizeCategory(budgetCategory);
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
    const color = getTheme(budget.theme).color;
    slices.push(`${color} ${start.toFixed(2)}% ${end.toFixed(2)}%`);
    start = end;
  });

  if (start < 100) {
    slices.push(`#ece7e7 ${start.toFixed(2)}% 100%`);
  }

  return `conic-gradient(${slices.join(', ')})`;
}

function renderDonut(
  totalSpent: number,
  totalLimit: number,
  budgets: Array<{ maxSpend: number; theme: string }>
): string {
  const ring = buildBudgetDonutGradient(budgets, totalLimit);

  return `
    <div id="budget-balance-donut" class="js-balance-donut mx-auto mb-8 h-48 w-48 cursor-pointer rounded-full flex items-center justify-center" style="background: ${ring};">
      <div class="h-[120px] w-[120px] rounded-full bg-white flex flex-col items-center justify-center text-center">
        <p class="text-2xl leading-none font-bold text-[#201f24]">$${Math.floor(totalSpent)}</p>
        <p class="text-[11px] text-[#696868] mt-1">of ${utils.formatCurrency(totalLimit)} limit</p>
      </div>
    </div>
  `;
}

function attachDonutSpinOnFirstClick(selector: string): void {
  const donut = dom.querySelector<HTMLDivElement>(selector);
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

export function renderBudgetsPage(onAddClick: () => void): void {
  const page = dom.querySelector<HTMLDivElement>('#budgets-page')!;
  dom.clearChildren(page);

  const budgets = storage.getBudgets();
  const expensesByCategory = storage.getExpensesByCategory();
  const transactions = storage.getTransactions();

  const totalLimit = budgets.reduce((sum, item) => sum + item.maxSpend, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + (expensesByCategory[item.category] || 0), 0);

  const html = `
    <div class="space-y-6">
      <div class="flex justify-end">
        <button id="add-budget-btn" class="rounded-lg bg-[#201f24] px-5 py-3 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          + Add New Budget
        </button>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
        <section class="rounded-2xl bg-white p-6">
          ${renderDonut(totalSpent, totalLimit || 0, budgets)}

          <h3 class="text-lg font-bold text-[#201f24] mb-5">Spending Summary</h3>
          <div id="budgets-summary-list" class="space-y-3"></div>
        </section>

        <section class="space-y-4" id="budgets-details"></section>
      </div>
    </div>
  `;

  dom.setHTML(page, html);
  attachDonutSpinOnFirstClick('#budget-balance-donut');

  const addBtn = dom.querySelector<HTMLButtonElement>('#add-budget-btn')!;
  dom.addEventListener(addBtn, 'click', onAddClick);

  const summaryList = dom.querySelector<HTMLDivElement>('#budgets-summary-list')!;
  const detailsContainer = dom.querySelector<HTMLDivElement>('#budgets-details')!;

  if (budgets.length === 0) {
    dom.setHTML(summaryList, '<p class="text-sm text-[#696868]">No budget categories yet.</p>');
    dom.setHTML(detailsContainer, '<div class="rounded-2xl bg-white p-10 text-center text-sm text-[#696868]">No budgets yet. Add one to start tracking.</div>');
    return;
  }

  budgets.forEach(budget => {
    const spent = expensesByCategory[budget.category] || 0;
    const free = Math.max(0, budget.maxSpend - spent);
    const percent = Math.min(100, utils.calculatePercentage(spent, budget.maxSpend));
    const theme = getTheme(budget.theme);
    const latestSpending = transactions
      .filter(transaction => transaction.type === 'expense' && isBudgetCategoryMatch(transaction.category, budget.category))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    const latestSpendingHtml = latestSpending.length
      ? latestSpending.map(transaction => `
          <div class="flex items-center justify-between border-b border-[#f2eeeb] pb-3 last:border-0 last:pb-0">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-full bg-white text-xs font-bold text-[#201f24] flex items-center justify-center shrink-0">
                ${(transaction.recipient || transaction.description || transaction.category).charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="text-sm font-bold text-[#201f24]">${transaction.recipient || transaction.description || transaction.category}</p>
                <p class="text-xs text-[#696868]">${utils.formatDateShort(transaction.date)}</p>
              </div>
            </div>
            <p class="text-sm font-bold text-[#201f24]">-${utils.formatCurrency(transaction.amount)}</p>
          </div>
        `).join('')
      : '<p class="text-sm text-[#696868]">No spending yet.</p>';

    const summaryRow = dom.createElement('div', {
      className: 'flex items-center justify-between border-b border-[#f2eeeb] pb-3 last:border-0',
      innerHTML: `
        <div class="flex items-center gap-3">
          <span class="inline-block h-4 w-1 rounded-full" style="background:${theme.color}"></span>
          <span class="text-sm text-[#696868]">${budget.category}</span>
        </div>
        <span class="text-sm font-bold text-[#201f24]">${utils.formatCurrency(spent)} <span class="text-[#696868] font-normal">of ${utils.formatCurrency(budget.maxSpend)}</span></span>
      `,
    });

    const card = dom.createElement('article', {
      className: 'rounded-2xl bg-white p-6',
      innerHTML: `
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="inline-block h-4 w-4 rounded-full shrink-0" style="background:${theme.color}"></span>
            <h4 class="text-xl font-bold text-[#201f24]">${budget.category}</h4>
          </div>
          <button class="text-sm text-[#696868] hover:text-[#201f24]">•••</button>
        </div>

        <p class="text-sm text-[#696868] mb-4">Maximum of ${utils.formatCurrency(budget.maxSpend)}</p>

        <div class="h-8 rounded-lg bg-[#f8f4f0] overflow-hidden mb-3 p-1">
          <div class="h-full rounded" style="width:${percent}%; background:${theme.color};"></div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-5">
          <div class="border-l-4 pl-3" style="border-color:${theme.color};">
            <p class="text-xs text-[#696868] mb-1">Spent</p>
            <p class="text-sm font-bold text-[#201f24]">${utils.formatCurrency(spent)}</p>
          </div>
          <div class="border-l-4 border-[#f2eeeb] pl-3">
            <p class="text-xs text-[#696868] mb-1">Remaining</p>
            <p class="text-sm font-bold text-[#201f24]">${utils.formatCurrency(free)}</p>
          </div>
        </div>

        <div class="rounded-xl bg-[#f8f4f0] p-4">
          <div class="mb-4 flex items-center justify-between">
            <h5 class="text-sm font-bold text-[#201f24]">Latest Spending</h5>
            <a href="/transactions" class="text-xs text-[#696868] hover:text-[#201f24] flex items-center gap-1">See All <span>›</span></a>
          </div>
          <div class="space-y-3">${latestSpendingHtml}</div>
        </div>
      `,
    });

    dom.appendChild(summaryList, summaryRow);
    dom.appendChild(detailsContainer, card);
  });
}

export function showAddBudgetForm(onAdd: (category: string, maxSpend: number, theme: string) => void): void {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4',
    innerHTML: `
      <div class="w-full max-w-[560px] rounded-2xl bg-white p-8 shadow-2xl">
        <div class="mb-5 flex items-center justify-between">
          <h3 class="text-xl font-bold text-[#201f24]">Add New Budget</h3>
          <button id="close-budget-modal" class="text-[#696868] hover:text-[#201f24] text-xl leading-none">×</button>
        </div>

        <p class="mb-5 text-sm text-[#696868]">Choose a category to set a spending budget. These categories can help you monitor spending.</p>

        <form id="budget-form" class="space-y-4">
          <div>
            <label class="mb-1 block text-xs font-bold text-[#201f24]">Budget Category</label>
            <select name="category" class="h-11 w-full rounded-lg border border-[#98908b] px-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24] bg-white" required>
              <option value="">Select a category</option>
              <option value="Bills">Bills</option>
              <option value="Dining Out">Dining Out</option>
              <option value="Groceries">Groceries</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Transportation">Transportation</option>
              <option value="Shopping">Shopping</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-[#201f24]">Maximum Spend</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#696868]">$</span>
              <input name="maxSpend" type="number" step="0.01" min="0" placeholder="e.g. 2000"
                class="h-11 w-full rounded-lg border border-[#98908b] pl-7 pr-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24]" required>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-[#201f24]">Theme</label>
            <select name="theme" class="h-11 w-full rounded-lg border border-[#98908b] px-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24] bg-white" required>
              <option value="">Select a theme</option>
              <option value="green">● Green</option>
              <option value="yellow">● Yellow</option>
              <option value="cyan">● Cyan</option>
              <option value="navy">● Navy</option>
              <option value="red">● Red</option>
              <option value="purple">● Purple</option>
              <option value="turquoise">● Turquoise</option>
              <option value="brown">● Brown</option>
              <option value="magenta">● Magenta</option>
              <option value="blue">● Blue</option>
              <option value="grey">● Grey</option>
              <option value="orange">● Orange</option>
            </select>
          </div>

          <button type="submit" class="mt-2 h-12 w-full rounded-lg bg-[#201f24] text-sm font-bold text-white hover:opacity-90 transition-opacity">
            Add Budget
          </button>
        </form>
      </div>
    `,
  });

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#budget-form')!;
  const closeButton = dom.querySelector<HTMLButtonElement>('#close-budget-modal')!;

  dom.addEventListener(form, 'submit', (event: Event) => {
    event.preventDefault();
    const values = dom.getFormValues(form);
    onAdd(values.category, parseFloat(values.maxSpend), values.theme);
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(closeButton, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}
