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
    <div id="budget-balance-donut" class="js-balance-donut mx-auto mb-8 h-44 w-44 cursor-pointer rounded-full flex items-center justify-center" style="background: ${ring};">
      <div class="h-24 w-24 rounded-full bg-white flex flex-col items-center justify-center text-center">
        <p class="text-3xl leading-none font-bold text-[#1f2131]">$${Math.floor(totalSpent)}</p>
        <p class="text-xs text-[#8a8f98]">of ${utils.formatCurrency(totalLimit)} limit</p>
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
        <button id="add-budget-btn" class="rounded-xl bg-[#201f24] px-6 py-3 text-white font-semibold hover:bg-[#2d2c31]">
          +Add New Budget
        </button>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
        <section class="rounded-xl border border-[#ece7e7] bg-white p-6">
          ${renderDonut(totalSpent, totalLimit || 0, budgets)}

          <h3 class="text-2xl leading-none font-bold text-[#252733] mb-6">Spending Summary</h3>
          <div id="budgets-summary-list" class="space-y-4"></div>
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
    dom.setHTML(summaryList, '<p class="text-sm text-[#8a8f98]">No budget categories yet.</p>');
    dom.setHTML(detailsContainer, '<div class="rounded-xl border border-[#ece7e7] bg-white p-10 text-center text-[#8a8f98]">No budgets yet. Add one to start tracking.</div>');
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
      ? latestSpending
          .map(
            transaction => `
              <div class="flex items-center justify-between border-b border-[#e5dfdf] pb-3 last:border-b-0 last:pb-0">
                <div>
                  <p class="text-base leading-none font-bold text-[#252733]">${transaction.recipient || transaction.description || transaction.category}</p>
                  <p class="mt-1 text-xs leading-none text-[#8a8f98]">${utils.formatDateShort(transaction.date)}</p>
                </div>
                <p class="text-base leading-none font-bold text-[#252733]">${utils.formatCurrency(transaction.amount)}</p>
              </div>
            `
          )
          .join('')
      : '<p class="text-center text-sm leading-none text-[#8a8f98]">You haven\'t made any spendings yet.</p>';

    const summaryRow = dom.createElement('div', {
      className: 'flex items-center justify-between border-b border-[#ece7e7] pb-3',
      innerHTML: `
        <div class="flex items-center gap-2">
          <span class="inline-block h-5 w-1 rounded" style="background:${theme.color}"></span>
          <span class="text-base leading-none text-[#6f7480]">${budget.category}</span>
        </div>
        <span class="text-lg leading-none font-bold text-[#2a2c37]">${utils.formatCurrency(spent)} <span class="text-[#8a8f98] font-medium">of ${utils.formatCurrency(budget.maxSpend)}</span></span>
      `,
    });

    const card = dom.createElement('article', {
      className: 'rounded-xl border border-[#ece7e7] bg-white p-6',
      innerHTML: `
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="inline-block h-4 w-4 rounded-full" style="background:${theme.color}"></span>
            <h4 class="text-2xl leading-none font-bold text-[#252733]">${budget.category}</h4>
          </div>
          <button class="text-xl text-[#4f5664]">•••</button>
        </div>

        <p class="text-base leading-none text-[#6f7480] mb-5">Maximum of ${budget.maxSpend.toFixed(2)}</p>

        <div class="h-6 rounded-md bg-[#f3efef] overflow-hidden mb-4">
          <div class="h-full" style="width:${percent}%; background:${theme.color};"></div>
        </div>

        <div class="grid grid-cols-2 gap-4 border-t border-[#ece7e7] pt-4 mb-4">
          <div class="border-l-4 pl-3" style="border-color:${theme.color};">
            <p class="text-sm leading-none text-[#8a8f98]">Spent</p>
            <p class="text-2xl leading-none font-bold text-[#252733]">${utils.formatCurrency(spent)}</p>
          </div>
          <div class="border-l-4 border-[#ece7e7] pl-3">
            <p class="text-sm leading-none text-[#8a8f98]">Free</p>
            <p class="text-2xl leading-none font-bold text-[#252733]">${utils.formatCurrency(free)}</p>
          </div>
        </div>

        <div class="rounded-xl bg-[#f6f2f2] p-4">
          <div class="mb-4 flex items-center justify-between">
            <h5 class="text-xl leading-none font-bold text-[#252733]">Latest Spending</h5>
            <a href="/transactions" class="text-sm leading-none text-[#6f7480] hover:text-[#3f4756]">See All <span class="ml-1">›</span></a>
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
    className: 'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4',
    innerHTML: `
      <div class="w-full max-w-[610px] rounded-xl bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-3xl leading-none font-bold text-[#1f2131]">Add New Budget</h3>
          <button id="close-budget-modal" class="text-2xl text-[#777b86] hover:text-[#1f2131]">×</button>
        </div>

        <p class="mb-6 text-sm text-[#7f8ba0]">Choose a category to set a spending budget. These categories can help you monitor spending.</p>

        <form id="budget-form" class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Category</label>
            <select name="category" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-base leading-none text-[#1f2131] focus:outline-none" required>
              <option value="">Select a category</option>
              <option value="Bills">Bills</option>
              <option value="Shopping">Shopping</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Maximum Spend</label>
            <input name="maxSpend" type="number" step="0.01" min="0" placeholder="e.g. $2000" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-base leading-none text-[#1f2131] focus:outline-none" required>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Theme</label>
            <select name="theme" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-base leading-none text-[#1f2131] focus:outline-none" required>
              <option value="">Select a theme</option>
              <option value="green">Green</option>
              <option value="grey">Grey</option>
              <option value="cyan">Cyan</option>
              <option value="orange">Orange</option>
              <option value="purple">Purple</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
              <option value="navy">Navy</option>
              <option value="turquoise">Turquoise</option>
              <option value="brown">Brown</option>
              <option value="magenta">Magenta</option>
            </select>
          </div>

          <button type="submit" class="mt-2 h-12 w-full rounded-lg bg-[#201f24] text-lg font-semibold text-white hover:bg-[#2d2c31]">
            Submit
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
