import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

export function renderOverviewPage(): void {
  const page = dom.querySelector<HTMLDivElement>('#overview-page')!;
  dom.clearChildren(page);

  const summary = storage.calculateSummary();
  const pots = storage.getPots();
  const budgets = storage.getBudgets();
  const transactions = storage.getTransactions();
  const bills = storage.getBills();
  const billsSummary = storage.getBillsSummary();

  const summaryHtml = `
    <div>
      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Summary</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-slate-900 dark:bg-slate-800 text-white p-8 rounded-2xl shadow-lg">
          <p class="text-slate-300 text-sm font-medium mb-2">Current Balance</p>
          <p class="text-4xl font-bold">${utils.formatCurrency(summary.balance)}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-sm">
          <p class="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Income</p>
          <p class="text-4xl font-bold text-green-600 dark:text-green-400">${utils.formatCurrency(summary.income)}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-sm">
          <p class="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Expenses</p>
          <p class="text-4xl font-bold text-red-600 dark:text-red-400">${utils.formatCurrency(summary.expenses)}</p>
        </div>
      </div>
    </div>
  `;

  dom.setHTML(page, summaryHtml);

  const potsHtml = `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Pots</h3>
        <a href="/pots" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">See Details →</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="overview-pots">
        ${pots.length === 0 ? '<p class="text-slate-500 dark:text-slate-400 col-span-full text-center py-12">No pots yet. Create one to start saving!</p>' : ''}
      </div>
    </div>
  `;

  const potsDiv = dom.createElement('div', { innerHTML: potsHtml });
  dom.appendChild(page, potsDiv);

  pots.slice(0, 2).forEach(pot => {
    const percentage = utils.calculatePercentage(pot.saved, pot.target);
    const potsContainer = dom.querySelector<HTMLDivElement>('#overview-pots')!;

    const potCard = dom.createElement('div', {
      className: `bg-white dark:bg-slate-800 border border-t-4 border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm`,
      innerHTML: `
        <h4 class="font-bold text-lg text-slate-900 dark:text-white mb-6">${pot.name}</h4>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm text-slate-600 dark:text-slate-400">Total Saved</span>
              <span class="font-bold text-slate-900 dark:text-white">${percentage}%</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div class="bg-slate-600 dark:bg-blue-500 h-full" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-400">${utils.formatCurrency(pot.saved)}</span>
            <span class="text-slate-600 dark:text-slate-400">Target: ${utils.formatCurrency(pot.target)}</span>
          </div>
        </div>
      `,
    });

    dom.appendChild(potsContainer, potCard);
  });

  const budgetsHtml = `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Budgets</h3>
        <a href="/budgets" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">See Details →</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="overview-budgets">
        ${budgets.length === 0 ? '<p class="text-slate-500 dark:text-slate-400 col-span-full text-center py-12">No budgets yet. Set one to track spending!</p>' : ''}
      </div>
    </div>
  `;

  const budgetsDiv = dom.createElement('div', { innerHTML: budgetsHtml });
  dom.appendChild(page, budgetsDiv);

  const expensesByCategory = storage.getExpensesByCategory();
  budgets.slice(0, 4).forEach(budget => {
    const spent = expensesByCategory[budget.category] || 0;
    const percentage = utils.calculatePercentage(spent, budget.maxSpend);
    const budgetsContainer = dom.querySelector<HTMLDivElement>('#overview-budgets')!;

    const budgetCard = dom.createElement('div', {
      className: 'bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700',
      innerHTML: `
        <div class="flex justify-between items-start mb-6">
          <h4 class="font-bold text-lg text-slate-900 dark:text-white">${budget.category}</h4>
          <div class="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">${percentage}%</div>
        </div>
        <div class="space-y-4">
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div class="bg-slate-600 dark:bg-blue-500 h-full" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-400">${utils.formatCurrency(spent)} spent</span>
            <span class="text-slate-600 dark:text-slate-400">Budget: ${utils.formatCurrency(budget.maxSpend)}</span>
          </div>
        </div>
      `,
    });

    dom.appendChild(budgetsContainer, budgetCard);
  });

  const transactionsHtml = `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
        <a href="/transactions" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">See All →</a>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
        <div id="overview-transactions" class="divide-y divide-slate-200 dark:divide-slate-700">
          ${transactions.length === 0 ? '<p class="text-slate-500 dark:text-slate-400 text-center py-12">No transactions yet</p>' : ''}
        </div>
      </div>
    </div>
  `;

  const transactionsDiv = dom.createElement('div', { innerHTML: transactionsHtml });
  dom.appendChild(page, transactionsDiv);

  const txContainer = dom.querySelector<HTMLDivElement>('#overview-transactions')!;
  transactions.slice(0, 5).forEach(tx => {
    const txRow = dom.createElement('div', {
      className: 'flex justify-between items-center p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors',
      innerHTML: `
        <div>
          <p class="font-semibold text-slate-900 dark:text-white">${tx.description}</p>
          <p class="text-sm text-slate-600 dark:text-slate-400">${utils.formatDateShort(tx.date)}</p>
        </div>
        <span class="font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
          ${tx.type === 'income' ? '+' : '-'}${utils.formatCurrency(tx.amount)}
        </span>
      `,
    });
    dom.appendChild(txContainer, txRow);
  });

  const billsHtml = `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Recurring Bills Summary</h3>
        <a href="/recurring-bills" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">See All →</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-3xl">✓</span>
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Paid Bills</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">${utils.formatCurrency(billsSummary.paid)}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-3xl">📅</span>
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Total Upcoming</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">${utils.formatCurrency(billsSummary.upcoming)}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-3xl">⚠️</span>
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Due Soon</p>
              <p class="text-2xl font-bold text-red-600 dark:text-red-400">${utils.formatCurrency(billsSummary.due)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const billsDiv = dom.createElement('div', { innerHTML: billsHtml });
  dom.appendChild(page, billsDiv);
}
