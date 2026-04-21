import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

type SortKey = 'latest' | 'oldest' | 'az' | 'za' | 'highest' | 'lowest';

const PAGE_SIZE = 8;
const TRANSACTION_CATEGORIES = ['Entertainment', 'Bill', 'Groceries', 'Dining Out', 'Transportation'] as const;

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function getRecipientName(description: string, recipient: string): string {
  const cleanedRecipient = recipient.trim();
  if (cleanedRecipient) return cleanedRecipient;
  return description.trim() || 'Unknown';
}

function categoryMatches(selectedCategory: string, txCategory: string): boolean {
  if (selectedCategory === 'all') return true;

  const selected = normalize(selectedCategory);
  const actual = normalize(txCategory);

  if (selected === 'bill') {
    return actual === 'bill' || actual === 'bills';
  }

  return selected === actual;
}

export function renderTransactionsPage(onAddClick: () => void): void {
  const page = dom.querySelector<HTMLDivElement>('#transactions-page')!;
  dom.clearChildren(page);

  const html = `
    <div class="space-y-6">
      <div class="flex items-center justify-end">
        <button id="add-transaction-btn" class="rounded-lg bg-[#201f24] px-5 py-3 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          + Add New Transaction
        </button>
      </div>

      <section class="rounded-2xl bg-white p-6 md:p-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div class="relative max-w-[320px] w-full">
            <input
              id="transaction-search"
              type="text"
              placeholder="Search transaction"
              class="h-11 w-full rounded-lg border border-[#98908b] pl-4 pr-10 text-sm text-[#201f24] placeholder:text-[#98908b] focus:outline-none focus:border-[#201f24]"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#98908b] text-sm">🔍</span>
          </div>

          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <label for="sort-by" class="text-xs text-[#696868] whitespace-nowrap">Sort by</label>
              <select id="sort-by" class="h-11 rounded-lg border border-[#98908b] px-3 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24] bg-white">
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="az">A to Z</option>
                <option value="za">Z to A</option>
                <option value="highest">Highest</option>
                <option value="lowest">Lowest</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <label for="category-filter" class="text-xs text-[#696868] whitespace-nowrap">Category</label>
              <select id="category-filter" class="h-11 rounded-lg border border-[#98908b] px-3 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24] bg-white">
                <option value="all">All Transactions</option>
                ${TRANSACTION_CATEGORIES.map(category => `<option value="${category}">${category}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[600px]">
            <thead>
              <tr class="border-b border-[#f2eeeb] text-left">
                <th class="pb-3 text-xs font-normal text-[#696868]">Recipient / Sender</th>
                <th class="pb-3 px-4 text-xs font-normal text-[#696868]">Category</th>
                <th class="pb-3 px-4 text-xs font-normal text-[#696868]">Transaction Date</th>
                <th class="pb-3 text-right text-xs font-normal text-[#696868]">Amount</th>
              </tr>
            </thead>
            <tbody id="transactions-list"></tbody>
          </table>
        </div>

        <div class="mt-6 flex items-center justify-between gap-2">
          <button id="tx-prev" class="flex items-center gap-2 rounded-lg border border-[#f2eeeb] px-4 py-2 text-sm font-normal text-[#201f24] hover:bg-[#f8f4f0] disabled:opacity-40 transition-colors">
            ← Prev
          </button>

          <div id="tx-page-numbers" class="flex items-center gap-1"></div>

          <button id="tx-next" class="flex items-center gap-2 rounded-lg border border-[#f2eeeb] px-4 py-2 text-sm font-normal text-[#201f24] hover:bg-[#f8f4f0] disabled:opacity-40 transition-colors">
            Next →
          </button>
        </div>
      </section>
    </div>
  `;

  dom.setHTML(page, html);

  const addBtn = dom.querySelector<HTMLButtonElement>('#add-transaction-btn')!;
  const searchInput = dom.querySelector<HTMLInputElement>('#transaction-search')!;
  const sortSelect = dom.querySelector<HTMLSelectElement>('#sort-by')!;
  const categorySelect = dom.querySelector<HTMLSelectElement>('#category-filter')!;
  const prevBtn = dom.querySelector<HTMLButtonElement>('#tx-prev')!;
  const nextBtn = dom.querySelector<HTMLButtonElement>('#tx-next')!;
  const pageNumbers = dom.querySelector<HTMLDivElement>('#tx-page-numbers')!;

  let searchTerm = '';
  let sortBy: SortKey = 'latest';
  let category = 'all';
  let currentPage = 1;

  function getFilteredTransactions() {
    let list = storage.getTransactions().filter(tx => {
      const query = normalize(searchTerm);
      const recipient = getRecipientName(tx.description, tx.recipient);
      const haystack = `${recipient} ${tx.category} ${tx.description}`.toLowerCase();
      const matchesSearch = query === '' || haystack.includes(query);
      const matchesCategory = categoryMatches(category, tx.category);
      return matchesSearch && matchesCategory;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'az') return getRecipientName(a.description, a.recipient).localeCompare(getRecipientName(b.description, b.recipient));
      if (sortBy === 'za') return getRecipientName(b.description, b.recipient).localeCompare(getRecipientName(a.description, a.recipient));
      if (sortBy === 'highest') return b.amount - a.amount;
      return a.amount - b.amount;
    });

    return list;
  }

  function renderPageNumbers(totalPages: number): void {
    dom.clearChildren(pageNumbers);
    const max = Math.min(totalPages, 5);
    for (let i = 1; i <= max; i++) {
      const btn = dom.createElement('button', {
        textContent: String(i),
        className: `h-9 min-w-[36px] rounded-lg border text-sm font-normal transition-colors px-2 ${
          i === currentPage
            ? 'border-[#201f24] bg-[#201f24] text-white'
            : 'border-[#f2eeeb] text-[#201f24] hover:bg-[#f8f4f0]'
        }`,
      });
      btn.addEventListener('click', () => {
        currentPage = i;
        renderRows();
      });
      dom.appendChild(pageNumbers, btn);
    }
  }

  function renderRows(): void {
    const tableBody = dom.querySelector<HTMLTableSectionElement>('#transactions-list')!;
    const filtered = getFilteredTransactions();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const visibleRows = filtered.slice(start, start + PAGE_SIZE);

    dom.clearChildren(tableBody);

    if (visibleRows.length === 0) {
      const emptyRow = dom.createElement('tr', {
        innerHTML: '<td colspan="4" class="py-12 text-center text-sm text-[#696868]">No transactions found.</td>',
      });
      dom.appendChild(tableBody, emptyRow);
    } else {
      visibleRows.forEach(tx => {
        const recipient = getRecipientName(tx.description, tx.recipient);
        const amountText = `${tx.type === 'income' ? '+' : '-'}${utils.formatCurrency(tx.amount)}`;
        const amountClass = tx.type === 'income' ? 'text-[#277c78]' : 'text-[#201f24]';

        const initials = recipient.slice(0, 2).toUpperCase();
        const row = dom.createElement('tr', {
          className: 'border-b border-[#f2eeeb] last:border-0',
          innerHTML: `
            <td class="py-4 pr-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-[#f2eeeb] text-[#201f24] text-xs font-bold flex items-center justify-center shrink-0">
                  ${initials}
                </div>
                <span class="text-sm font-bold text-[#201f24]">${recipient}</span>
              </div>
            </td>
            <td class="px-4 py-4 text-xs text-[#696868]">${tx.category}</td>
            <td class="px-4 py-4 text-xs text-[#696868]">${utils.formatDate(tx.date)}</td>
            <td class="py-4 text-right text-sm font-bold ${amountClass}">${amountText}</td>
          `,
        });

        dom.appendChild(tableBody, row);
      });
    }

    renderPageNumbers(totalPages);
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
  }

  dom.addEventListener(addBtn, 'click', onAddClick);

  dom.addEventListener(searchInput, 'input', (event: Event) => {
    searchTerm = (event.target as HTMLInputElement).value;
    currentPage = 1;
    renderRows();
  });

  dom.addEventListener(sortSelect, 'change', (event: Event) => {
    sortBy = (event.target as HTMLSelectElement).value as SortKey;
    currentPage = 1;
    renderRows();
  });

  dom.addEventListener(categorySelect, 'change', (event: Event) => {
    category = (event.target as HTMLSelectElement).value;
    currentPage = 1;
    renderRows();
  });

  dom.addEventListener(prevBtn, 'click', () => {
    if (currentPage > 1) { currentPage -= 1; renderRows(); }
  });

  dom.addEventListener(nextBtn, 'click', () => {
    const totalPages = Math.max(1, Math.ceil(getFilteredTransactions().length / PAGE_SIZE));
    if (currentPage < totalPages) { currentPage += 1; renderRows(); }
  });

  renderRows();
}

export function showAddTransactionForm(
  onAdd: (
    type: 'income' | 'expense',
    amount: number,
    category: string,
    date: string,
    description: string,
    recipient: string
  ) => void
): void {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4',
    innerHTML: `
      <div class="w-full max-w-[560px] rounded-2xl bg-white p-8 shadow-2xl">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-xl font-bold text-[#201f24]">Add New Transaction</h3>
          <button id="close-tx-modal" class="text-[#696868] hover:text-[#201f24] text-xl leading-none">×</button>
        </div>

        <form id="transaction-form" class="space-y-4">
          <div>
            <label class="mb-1 block text-xs font-bold text-[#201f24]">Transaction Name</label>
            <input id="tx-name" name="transactionName" maxlength="30" type="text"
              class="h-11 w-full rounded-lg border border-[#98908b] px-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24]" required>
            <p id="tx-name-count" class="mt-1 text-right text-xs text-[#696868]">30 characters left</p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-[#201f24]">Transaction Date</label>
            <input name="date" type="date"
              class="h-11 w-full rounded-lg border border-[#98908b] px-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24]" required>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-[#201f24]">Category</label>
            <select name="category"
              class="h-11 w-full rounded-lg border border-[#98908b] px-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24] bg-white" required>
              <option value="Entertainment">Entertainment</option>
              <option value="Bill">Bill</option>
              <option value="Groceries">Groceries</option>
              <option value="Dining Out">Dining Out</option>
              <option value="Transportation">Transportation</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-[#201f24]">Amount (negative = expense)</label>
            <input name="amount" type="number" step="0.01"
              class="h-11 w-full rounded-lg border border-[#98908b] px-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24]" required>
          </div>

          <label class="flex items-center gap-3 cursor-pointer">
            <input name="recurring" type="checkbox" class="h-4 w-4 rounded border-[#98908b] accent-[#277c78]" />
            <span class="text-sm text-[#201f24]">Add as recurring bill</span>
          </label>

          <button type="submit"
            class="mt-2 h-12 w-full rounded-lg bg-[#201f24] text-sm font-bold text-white hover:opacity-90 transition-opacity">
            Add Transaction
          </button>
        </form>
      </div>
    `,
  });

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#transaction-form')!;
  const closeButton = dom.querySelector<HTMLButtonElement>('#close-tx-modal')!;
  const nameInput = dom.querySelector<HTMLInputElement>('#tx-name')!;
  const nameCounter = dom.querySelector<HTMLParagraphElement>('#tx-name-count')!;

  dom.addEventListener(nameInput, 'input', () => {
    const remaining = Math.max(0, 30 - nameInput.value.length);
    nameCounter.textContent = `${remaining} characters left`;
  });

  dom.addEventListener(form, 'submit', (event: Event) => {
    event.preventDefault();

    const values = dom.getFormValues(form);
    const amountRaw = parseFloat(values.amount);
    const safeAmount = Math.abs(amountRaw);
    const type = amountRaw < 0 ? 'expense' : 'income';
    const transactionName = values.transactionName.trim();
    const recurring = Boolean((form.querySelector('input[name="recurring"]') as HTMLInputElement)?.checked);

    onAdd(type, safeAmount, values.category, values.date, transactionName, transactionName);

    if (recurring) {
      storage.addBill({ title: transactionName, dueDate: values.date, amount: safeAmount, status: 'pending' });
    }

    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(closeButton, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}
