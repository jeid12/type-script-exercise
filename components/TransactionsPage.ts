import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

export function renderTransactionsPage(onAddClick: () => void): void {
  const page = dom.querySelector<HTMLDivElement>('#transactions-page')!;
  dom.clearChildren(page);

  const transactions = storage.getTransactions();

  const html = `
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">Track and manage all your transactions</p>
        </div>
        <button id="add-transaction-btn" class="w-full sm:w-auto bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-800 font-medium transition-colors">
          + Add Transaction
        </button>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <input 
            type="text" 
            id="transaction-search" 
            placeholder="Search transactions..." 
            class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Description</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Category</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Date</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">Amount</th>
              </tr>
            </thead>
            <tbody id="transactions-list" class="divide-y divide-slate-200 dark:divide-slate-700">
              ${transactions.length === 0 ? '<tr><td colspan="4" class="text-center py-12 text-slate-500 dark:text-slate-400">No transactions yet</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  dom.setHTML(page, html);

  const addBtn = dom.querySelector<HTMLButtonElement>('#add-transaction-btn')!;
  dom.addEventListener(addBtn, 'click', onAddClick);

  const txList = dom.querySelector<HTMLTableSectionElement>('#transactions-list')!;
  if (transactions.length > 0) {
    dom.clearChildren(txList);
    transactions.forEach(tx => {
      const row = dom.createElement('tr', {
        className: 'hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors',
        innerHTML: `
          <td class="px-6 py-4 text-slate-900 dark:text-white font-medium">${tx.description}</td>
          <td class="px-6 py-4 text-slate-600 dark:text-slate-400">${tx.category}</td>
          <td class="px-6 py-4 text-slate-600 dark:text-slate-400">${utils.formatDate(tx.date)}</td>
          <td class="px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
            ${tx.type === 'income' ? '+' : '-'}${utils.formatCurrency(tx.amount)}
          </td>
        `,
      });
      dom.appendChild(txList, row);
    });
  }

  const searchInput = dom.querySelector<HTMLInputElement>('#transaction-search')!;
  dom.addEventListener(searchInput, 'input', (e: Event) => {
    const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
    const rows = dom.querySelectorAll<HTMLTableRowElement>('#transactions-list tr');

    rows.forEach(row => {
      const text = row.textContent?.toLowerCase() || '';
      if (text.includes(searchTerm)) {
        dom.show(row);
      } else {
        dom.hide(row);
      }
    });
  });
}

export function showAddTransactionForm(onAdd: (type: 'income' | 'expense', amount: number, category: string, date: string, description: string, recipient: string) => void): void {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
    innerHTML: `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Add Transaction</h3>
        <form id="transaction-form" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
            <select name="type" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
            <input type="number" name="amount" placeholder="0.00" step="0.01" min="0" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <input type="text" name="category" placeholder="e.g., Groceries" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <input type="text" name="description" placeholder="What was this for?" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date</label>
            <input type="date" name="date" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
          </div>
          <div class="flex gap-3 pt-6">
            <button type="submit" class="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 font-semibold transition-colors">Add</button>
            <button type="button" id="cancel-tx" class="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    `,
  });

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#transaction-form')!;
  const cancelBtn = dom.querySelector<HTMLButtonElement>('#cancel-tx')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onAdd(
      values.type as 'income' | 'expense',
      parseFloat(values.amount),
      values.category,
      values.date,
      values.description,
      ''
    );
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(cancelBtn, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}
