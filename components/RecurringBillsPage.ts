import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

const PAGE_SIZE = 8;

type SortKey = 'latest' | 'oldest' | 'highest' | 'lowest' | 'az' | 'za';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function renderRecurringBillsPage(): void {
  const page = dom.querySelector<HTMLDivElement>('#bills-page')!;
  dom.clearChildren(page);

  const summary = storage.getBillsSummary();
  const total = summary.paid + summary.upcoming + summary.due;

  const html = `
    <div class="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
      <section class="space-y-4">
        <article class="rounded-2xl bg-[#201f24] p-6 text-white">
          <div class="mb-8">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="white" fill-opacity="0.15"/>
              <path d="M10 16h12M16 10v12" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="text-sm text-[#b3b3b3] mb-2">Total Bills</p>
          <p class="text-[32px] leading-none font-bold">${utils.formatCurrency(total)}</p>
        </article>

        <article class="rounded-2xl bg-white p-6">
          <h3 class="text-lg font-bold text-[#201f24] mb-5">Summary</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-[#f2eeeb] pb-4">
              <span class="text-sm text-[#696868]">Paid Bills</span>
              <span class="text-sm font-bold text-[#277c78]">${utils.formatCurrency(summary.paid)}</span>
            </div>
            <div class="flex items-center justify-between border-b border-[#f2eeeb] pb-4">
              <span class="text-sm text-[#696868]">Total Upcoming</span>
              <span class="text-sm font-bold text-[#201f24]">${utils.formatCurrency(summary.upcoming)}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-[#696868]">Due Soon</span>
              <span class="text-sm font-bold text-[#c94736]">${utils.formatCurrency(summary.due)}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="rounded-2xl bg-white p-6 md:p-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div class="relative max-w-[280px] w-full">
            <input
              id="bills-search"
              type="text"
              placeholder="Search bills"
              class="h-11 w-full rounded-lg border border-[#98908b] pl-4 pr-10 text-sm text-[#201f24] placeholder:text-[#98908b] focus:outline-none focus:border-[#201f24]"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#98908b] text-sm">🔍</span>
          </div>

          <div class="flex items-center gap-2">
            <label for="bills-sort" class="text-xs text-[#696868] whitespace-nowrap">Sort by</label>
            <select id="bills-sort" class="h-11 rounded-lg border border-[#98908b] px-3 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24] bg-white">
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A to Z</option>
              <option value="za">Z to A</option>
              <option value="highest">Highest</option>
              <option value="lowest">Lowest</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[500px]">
            <thead>
              <tr class="border-b border-[#f2eeeb] text-left">
                <th class="pb-3 text-xs font-normal text-[#696868]">Bill Title</th>
                <th class="pb-3 px-4 text-xs font-normal text-[#696868]">Due Date</th>
                <th class="pb-3 px-4 text-xs font-normal text-[#696868]">Status</th>
                <th class="pb-3 text-right text-xs font-normal text-[#696868]">Amount</th>
              </tr>
            </thead>
            <tbody id="bills-list"></tbody>
          </table>
        </div>

        <div class="mt-6 flex items-center justify-between gap-2">
          <button id="bills-prev" class="flex items-center gap-2 rounded-lg border border-[#f2eeeb] px-4 py-2 text-sm text-[#201f24] hover:bg-[#f8f4f0] disabled:opacity-40 transition-colors">
            ← Prev
          </button>

          <div id="bills-page-numbers" class="flex items-center gap-1"></div>

          <button id="bills-next" class="flex items-center gap-2 rounded-lg border border-[#f2eeeb] px-4 py-2 text-sm text-[#201f24] hover:bg-[#f8f4f0] disabled:opacity-40 transition-colors">
            Next →
          </button>
        </div>
      </section>
    </div>
  `;

  dom.setHTML(page, html);

  const searchInput = dom.querySelector<HTMLInputElement>('#bills-search')!;
  const sortSelect = dom.querySelector<HTMLSelectElement>('#bills-sort')!;
  const prevBtn = dom.querySelector<HTMLButtonElement>('#bills-prev')!;
  const nextBtn = dom.querySelector<HTMLButtonElement>('#bills-next')!;
  const pageNumbers = dom.querySelector<HTMLDivElement>('#bills-page-numbers')!;

  let searchTerm = '';
  let sortBy: SortKey = 'latest';
  let currentPage = 1;

  function getSortedBills() {
    let list = storage.getBills().filter(bill => {
      const query = normalize(searchTerm);
      if (!query) return true;
      return `${bill.title} ${bill.status}`.toLowerCase().includes(query);
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      if (sortBy === 'oldest') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'za') return b.title.localeCompare(a.title);
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
        className: `h-9 min-w-[36px] rounded-lg border text-sm transition-colors px-2 ${
          i === currentPage
            ? 'border-[#201f24] bg-[#201f24] text-white'
            : 'border-[#f2eeeb] text-[#201f24] hover:bg-[#f8f4f0]'
        }`,
      });
      btn.addEventListener('click', () => { currentPage = i; renderRows(); });
      dom.appendChild(pageNumbers, btn);
    }
  }

  function renderRows() {
    const body = dom.querySelector<HTMLTableSectionElement>('#bills-list')!;
    const list = getSortedBills();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const visible = list.slice(start, start + PAGE_SIZE);

    dom.clearChildren(body);

    if (visible.length === 0) {
      dom.appendChild(body, dom.createElement('tr', {
        innerHTML: '<td colspan="4" class="py-12 text-center text-sm text-[#696868]">No results.</td>',
      }));
    } else {
      visible.forEach(bill => {
        const today = new Date().toISOString().split('T')[0];
        const isPaid = bill.status === 'paid';
        const isOverdue = !isPaid && bill.dueDate < today;

        const statusClass = isPaid ? 'text-[#277c78]' : isOverdue ? 'text-[#c94736]' : 'text-[#be6c49]';
        const statusText = isPaid ? '✓ Paid' : isOverdue ? 'Overdue' : 'Due Soon';

        const row = dom.createElement('tr', {
          className: 'border-b border-[#f2eeeb] last:border-0',
          innerHTML: `
            <td class="py-4 pr-4">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-[#f2eeeb] flex items-center justify-center text-xs font-bold text-[#201f24] shrink-0">
                  ${bill.title.charAt(0).toUpperCase()}
                </div>
                <span class="text-sm font-bold text-[#201f24]">${bill.title}</span>
              </div>
            </td>
            <td class="px-4 py-4 text-xs text-[#696868]">${utils.formatDate(bill.dueDate)}</td>
            <td class="px-4 py-4 text-xs font-semibold ${statusClass}">${statusText}</td>
            <td class="py-4 text-right text-sm font-bold text-[#201f24]">${utils.formatCurrency(bill.amount)}</td>
          `,
        });

        dom.appendChild(body, row);
      });
    }

    renderPageNumbers(totalPages);
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
  }

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

  dom.addEventListener(prevBtn, 'click', () => {
    if (currentPage > 1) { currentPage -= 1; renderRows(); }
  });

  dom.addEventListener(nextBtn, 'click', () => {
    const totalPages = Math.max(1, Math.ceil(getSortedBills().length / PAGE_SIZE));
    if (currentPage < totalPages) { currentPage += 1; renderRows(); }
  });

  renderRows();
}
