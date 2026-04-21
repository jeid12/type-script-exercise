import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

export function renderRecurringBillsPage(): void {
  const page = dom.querySelector<HTMLDivElement>('#bills-page')!;
  dom.clearChildren(page);

  const bills = storage.getBills();
  const billsSummary = storage.getBillsSummary();
  const today = new Date().toISOString().split('T')[0];

  const html = `
    <div class="space-y-8">
      <div>
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recurring Bills</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">Paid Bills</p>
              <p class="text-3xl font-bold text-green-600 dark:text-green-400">${utils.formatCurrency(billsSummary.paid)}</p>
            </div>
            <span class="text-3xl">✓</span>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">Total Upcoming</p>
              <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">${utils.formatCurrency(billsSummary.upcoming)}</p>
            </div>
            <span class="text-3xl">📅</span>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">Due Soon</p>
              <p class="text-3xl font-bold text-red-600 dark:text-red-400">${utils.formatCurrency(billsSummary.due)}</p>
            </div>
            <span class="text-3xl">⚠️</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Bill Title</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Due Date</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Amount</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Status</th>
              </tr>
            </thead>
            <tbody id="bills-list" class="divide-y divide-slate-200 dark:divide-slate-700">
              ${bills.length === 0 ? '<tr><td colspan="4" class="text-center py-12 text-slate-500 dark:text-slate-400">No recurring bills yet</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  dom.setHTML(page, html);

  const billsList = dom.querySelector<HTMLTableSectionElement>('#bills-list')!;
  if (bills.length > 0) {
    dom.clearChildren(billsList);
    bills.forEach(bill => {
      const isOverdue = bill.dueDate < today && bill.status === 'pending';
      const isDueSoon = bill.dueDate >= today && bill.status === 'pending';

      let statusBadge = '';
      if (bill.status === 'paid') {
        statusBadge = '<span class="inline-block px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">Paid</span>';
      } else if (isOverdue) {
        statusBadge = '<span class="inline-block px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">Overdue</span>';
      } else if (isDueSoon) {
        statusBadge = '<span class="inline-block px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">Due Soon</span>';
      }

      const row = dom.createElement('tr', {
        className: 'hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors',
        innerHTML: `
          <td class="px-6 py-4">
            <p class="font-semibold text-slate-900 dark:text-white">${bill.title}</p>
          </td>
          <td class="px-6 py-4">
            <p class="text-slate-600 dark:text-slate-400">${utils.formatDate(bill.dueDate)}</p>
          </td>
          <td class="px-6 py-4">
            <p class="font-bold text-slate-900 dark:text-white">${utils.formatCurrency(bill.amount)}</p>
          </td>
          <td class="px-6 py-4">
            ${statusBadge}
          </td>
        `,
      });
      dom.appendChild(billsList, row);
    });
  }
}
