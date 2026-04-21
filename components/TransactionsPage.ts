import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

type SortKey = 'latest' | 'oldest' | 'az' | 'za' | 'highest' | 'lowest';

const PAGE_SIZE = 8;

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function getRecipientName(description: string, recipient: string): string {
  const cleanedRecipient = recipient.trim();
  if (cleanedRecipient) return cleanedRecipient;
  return description.trim() || 'Unknown';
}

function getCategoryList(): string[] {
  const categories = storage.getTransactions().map(tx => tx.category.trim()).filter(Boolean);
  return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b));
}

export function renderTransactionsPage(onAddClick: () => void): void {
  const page = dom.querySelector<HTMLDivElement>('#transactions-page')!;
  dom.clearChildren(page);

  const categories = getCategoryList();

  const html = `
    <div class="space-y-6">
      <div class="flex items-center justify-end">
        <button id="add-transaction-btn" class="rounded-xl bg-[#1d1d2b] px-6 py-3 text-white font-semibold hover:bg-[#2a2a3d] transition-colors">
          +Add New Transaction
        </button>
      </div>

      <section class="rounded-2xl border border-[#ece7e7] bg-white p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            id="transaction-search"
            type="text"
            placeholder="Search transaction"
            class="h-12 w-full max-w-[520px] rounded-xl border border-[#cfcaca] px-5 text-[28px] leading-none text-[#1f2131] placeholder:text-[#8f95a2] focus:outline-none"
          />

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div class="flex items-center gap-2">
              <label for="sort-by" class="text-sm text-slate-500">Sort by</label>
              <select id="sort-by" class="h-12 min-w-[150px] rounded-lg border border-[#d7dce2] px-3 text-[25px] leading-none text-[#1f2131] focus:outline-none">
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="az">A to Z</option>
                <option value="za">Z to A</option>
                <option value="highest">Highest</option>
                <option value="lowest">Lowers</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <label for="category-filter" class="text-sm text-slate-500">Filter by Category</label>
              <select id="category-filter" class="h-12 min-w-[180px] rounded-lg border border-[#d7dce2] px-3 text-[25px] leading-none text-[#1f2131] focus:outline-none">
                <option value="all">All Transactions</option>
                ${categories.map(category => `<option value="${category}">${category}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="mt-7 overflow-x-auto">
          <table class="w-full min-w-[820px]">
            <thead>
              <tr class="border-b border-[#eceff3] text-left text-sm text-[#8a8f98]">
                <th class="pb-3 pl-4 font-medium">Recipient / Sender</th>
                <th class="pb-3 px-4 font-medium">Category</th>
                <th class="pb-3 px-4 font-medium">Transaction Date</th>
                <th class="pb-3 pr-4 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody id="transactions-list"></tbody>
          </table>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <button id="tx-prev" class="rounded-xl bg-[#f4f1f1] px-5 py-3 text-[#8f8f9b] font-semibold disabled:opacity-40">
            ◀ Prev
          </button>

          <div id="tx-page-indicator" class="h-10 min-w-10 rounded-lg bg-[#1d1d2b] px-3 flex items-center justify-center text-white font-semibold">1</div>

          <button id="tx-next" class="rounded-xl bg-[#f4f1f1] px-5 py-3 text-[#8f8f9b] font-semibold disabled:opacity-40">
            Next ▶
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
  const pageIndicator = dom.querySelector<HTMLDivElement>('#tx-page-indicator')!;

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
      const matchesCategory = category === 'all' || tx.category === category;
      return matchesSearch && matchesCategory;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'az') {
        return getRecipientName(a.description, a.recipient).localeCompare(getRecipientName(b.description, b.recipient));
      }
      if (sortBy === 'za') {
        return getRecipientName(b.description, b.recipient).localeCompare(getRecipientName(a.description, a.recipient));
      }
      if (sortBy === 'highest') {
        return b.amount - a.amount;
      }
      return a.amount - b.amount;
    });

    return list;
  }

  function renderRows(): void {
    const tableBody = dom.querySelector<HTMLTableSectionElement>('#transactions-list')!;
    const filtered = getFilteredTransactions();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    const visibleRows = filtered.slice(start, start + PAGE_SIZE);

    dom.clearChildren(tableBody);

    if (visibleRows.length === 0) {
      const emptyRow = dom.createElement('tr', {
        innerHTML: '<td colspan="4" class="py-12 text-center text-slate-500">No results.</td>',
      });
      dom.appendChild(tableBody, emptyRow);
    } else {
      visibleRows.forEach(tx => {
        const recipient = getRecipientName(tx.description, tx.recipient);
        const amountText = `${tx.type === 'income' ? '+' : '-'}${utils.formatCurrency(tx.amount)}`;
        const amountClass = tx.type === 'income' ? 'text-[#2f8f8c]' : 'text-[#d05151]';

        const row = dom.createElement('tr', {
          className: 'border-b border-[#eceff3] last:border-0',
          innerHTML: `
            <td class="px-4 py-5">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-[#6d6e7f] text-white text-sm font-bold flex items-center justify-center">
                  ${recipient.charAt(0).toUpperCase()}
                </div>
                <span class="text-[27px] leading-none font-semibold text-[#1f2131]">${recipient}</span>
              </div>
            </td>
            <td class="px-4 py-5 text-[25px] leading-none text-[#6f7480]">${tx.category}</td>
            <td class="px-4 py-5 text-[25px] leading-none text-[#6f7480]">${utils.formatDate(tx.date)}</td>
            <td class="px-4 py-5 text-right text-[29px] leading-none font-bold ${amountClass}">${amountText}</td>
          `,
        });

        dom.appendChild(tableBody, row);
      });
    }

    pageIndicator.textContent = String(currentPage);
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
    if (currentPage > 1) {
      currentPage -= 1;
      renderRows();
    }
  });

  dom.addEventListener(nextBtn, 'click', () => {
    const totalPages = Math.max(1, Math.ceil(getFilteredTransactions().length / PAGE_SIZE));
    if (currentPage < totalPages) {
      currentPage += 1;
      renderRows();
    }
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
    className: 'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4',
    innerHTML: `
      <div class="w-full max-w-[610px] rounded-xl bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-4xl leading-none font-bold text-[#1f2131]">Add New Transaction</h3>
          <button id="close-tx-modal" class="text-2xl text-[#777b86] hover:text-[#1f2131]">×</button>
        </div>

        <form id="transaction-form" class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Transaction Name</label>
            <input id="tx-name" name="transactionName" maxlength="30" type="text" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-[25px] leading-none text-[#1f2131] focus:outline-none" required>
            <p id="tx-name-count" class="mt-2 text-right text-xs text-[#81889a]">30 characters left</p>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Transaction Date</label>
            <input name="date" type="date" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-[25px] leading-none text-[#1f2131] focus:outline-none" required>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Category</label>
            <select name="category" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-[25px] leading-none text-[#1f2131] focus:outline-none" required>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Salary">Salary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Amount</label>
            <input name="amount" type="number" step="0.01" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-[25px] leading-none text-[#1f2131] focus:outline-none" required>
          </div>

          <label class="flex items-center gap-2 text-sm font-semibold text-[#6e7280]">
            <span>Recurring</span>
            <input name="recurring" type="checkbox" class="h-4 w-4 rounded border-[#cfd4dc]" />
          </label>

          <button type="submit" class="mt-2 h-12 w-full rounded-lg bg-[#6f6f73] text-lg font-semibold text-white hover:bg-[#5f6068]">
            Submit
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

    onAdd(
      type,
      safeAmount,
      values.category,
      values.date,
      transactionName,
      transactionName
    );

    if (recurring) {
      storage.addBill({
        title: transactionName,
        dueDate: values.date,
        amount: safeAmount,
        status: 'pending',
      });
    }

    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(closeButton, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}
