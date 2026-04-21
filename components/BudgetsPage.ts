import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

export function renderBudgetsPage(onAddClick: () => void): void {
  const page = dom.querySelector<HTMLDivElement>('#budgets-page')!;
  dom.clearChildren(page);

  const budgets = storage.getBudgets();
  const expensesByCategory = storage.getExpensesByCategory();

  const html = `
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Budgets</h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">Monitor your spending across categories</p>
        </div>
        <button id="add-budget-btn" class="w-full sm:w-auto bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-800 font-medium transition-colors">
          + Add Budget
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="budgets-list">
        ${budgets.length === 0 ? '<p class="col-span-full text-slate-500 dark:text-slate-400 text-center py-16">No budgets yet. Create one to start tracking!</p>' : ''}
      </div>
    </div>
  `;

  dom.setHTML(page, html);

  const addBtn = dom.querySelector<HTMLButtonElement>('#add-budget-btn')!;
  dom.addEventListener(addBtn, 'click', onAddClick);

  const budgetsList = dom.querySelector<HTMLDivElement>('#budgets-list')!;
  if (budgets.length > 0) {
    dom.clearChildren(budgetsList);
    budgets.forEach(budget => {
      const spent = expensesByCategory[budget.category] || 0;
      const percentage = utils.calculatePercentage(spent, budget.maxSpend);
      const isOverBudget = spent > budget.maxSpend;

      const card = dom.createElement('div', {
        className: `bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-l-4 ${isOverBudget ? 'border-l-red-500 border-slate-200 dark:border-slate-700' : 'border-l-blue-500 border-slate-200 dark:border-slate-700'}`,
        innerHTML: `
          <div class="flex justify-between items-start mb-6">
            <h4 class="text-xl font-bold text-slate-900 dark:text-white">${budget.category}</h4>
            <span class="inline-block px-3 py-1 ${isOverBudget ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'} rounded-full text-xs font-semibold">
              ${percentage}%
            </span>
          </div>
          
          <div class="space-y-4">
            <div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div class="${isOverBudget ? 'bg-red-500' : 'bg-blue-500'} h-full rounded-full" style="width: ${Math.min(percentage, 100)}%"></div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p class="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Spent</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">${utils.formatCurrency(spent)}</p>
              </div>
              <div>
                <p class="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Budget</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">${utils.formatCurrency(budget.maxSpend)}</p>
              </div>
            </div>

            ${isOverBudget ? `<p class="text-xs text-red-600 dark:text-red-400 font-medium pt-2">⚠️ Over budget by ${utils.formatCurrency(spent - budget.maxSpend)}</p>` : ''}
          </div>
        `,
      });

      dom.appendChild(budgetsList, card);
    });
  }
}

export function showAddBudgetForm(onAdd: (category: string, maxSpend: number, theme: string) => void): void {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
    innerHTML: `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Add Budget</h3>
        <form id="budget-form" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <input type="text" name="category" placeholder="e.g., Groceries" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Maximum Spend</label>
            <input type="number" name="maxSpend" placeholder="0.00" step="0.01" min="0" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Theme Color</label>
            <select name="theme" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
              <option value="">Select a color</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="orange">Orange</option>
              <option value="purple">Purple</option>
            </select>
          </div>
          <div class="flex gap-3 pt-6">
            <button type="submit" class="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 font-semibold transition-colors">Add</button>
            <button type="button" id="cancel-budget" class="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    `,
  });

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#budget-form')!;
  const cancelBtn = dom.querySelector<HTMLButtonElement>('#cancel-budget')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onAdd(values.category, parseFloat(values.maxSpend), values.theme);
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(cancelBtn, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}
