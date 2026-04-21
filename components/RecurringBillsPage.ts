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

  const html = `
    <div class="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-4">
      <section class="space-y-4">
        <article class="rounded-xl bg-[#201f24] p-6 text-white">
          <p class="text-sm text-slate-300 mb-3">Total bills</p>
          <p class="text-[51px] leading-none font-bold">${utils.formatCurrency(summary.paid + summary.upcoming + summary.due)}</p>
        </article>

        <article class="rounded-xl border border-[#ece7e7] bg-white p-5">
          <h3 class="text-[39px] leading-none font-bold text-[#252733] mb-4">Summary</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-[#ece7e7] pb-3">
              <span class="text-[27px] leading-none text-[#6f7480]">Paid bills</span>
              <span class="text-[30px] leading-none font-bold text-[#2a2c37]">${utils.formatCurrency(summary.paid)}</span>
            </div>
            <div class="flex items-center justify-between border-b border-[#ece7e7] pb-3">
              <span class="text-[27px] leading-none text-[#6f7480]">Total Upcoming</span>
              <span class="text-[30px] leading-none font-bold text-[#2a2c37]">${utils.formatCurrency(summary.upcoming)}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[27px] leading-none text-[#6f7480]">Due Soon</span>
              <span class="text-[30px] leading-none font-bold text-[#d2524b]">${utils.formatCurrency(summary.due)}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="rounded-2xl border border-[#ece7e7] bg-white p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            id="bills-search"
            type="text"
            placeholder="Search bills"
            class="h-12 w-full max-w-[520px] rounded-xl border border-[#cfcaca] px-5 text-[28px] leading-none text-[#1f2131] placeholder:text-[#8f95a2] focus:outline-none"
          />

          <div class="flex items-center gap-2">
            <label for="bills-sort" class="text-sm text-slate-500">Sort by</label>
            <select id="bills-sort" class="h-12 min-w-[150px] rounded-lg border border-[#d7dce2] px-3 text-[25px] leading-none text-[#1f2131] focus:outline-none">
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A to Z</option>
              <option value="za">Z to A</option>
              <option value="highest">Highest</option>
              <option value="lowest">Lowers</option>
            </select>
          </div>
        </div>

        <div class="mt-7 overflow-x-auto">
          <table class="w-full min-w-[760px]">
            <thead>
              <tr class="border-b border-[#eceff3] text-left text-sm text-[#8a8f98]">
                <th class="pb-3 pl-4 font-medium">Bill Title</th>
                <th class="pb-3 px-4 font-medium">Due Date</th>
                <th class="pb-3 px-4 font-medium">Status</th>
                <th class="pb-3 pr-4 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody id="bills-list"></tbody>
          </table>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <button id="bills-prev" class="rounded-xl bg-[#f8f4f0] px-5 py-3 text-[#8f8f9b] font-semibold disabled:opacity-40">
            ◀ Prev
          </button>

          <div id="bills-page-indicator" class="h-10 min-w-10 rounded-lg bg-[#201f24] px-3 flex items-center justify-center text-white font-semibold">1</div>

          <button id="bills-next" class="rounded-xl bg-[#f8f4f0] px-5 py-3 text-[#8f8f9b] font-semibold disabled:opacity-40">
            Next ▶
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
  const pageIndicator = dom.querySelector<HTMLDivElement>('#bills-page-indicator')!;

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
      if (sortBy === 'latest') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'az') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'za') {
        return b.title.localeCompare(a.title);
      }
      if (sortBy === 'highest') {
        return b.amount - a.amount;
      }
      return a.amount - b.amount;
    });

    return list;
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
      const row = dom.createElement('tr', {
        innerHTML: '<td colspan="4" class="py-12 text-center text-slate-500">No results.</td>',
      });
      dom.appendChild(body, row);
    } else {
      visible.forEach(bill => {
        const statusClass =
          bill.status === 'paid'
            ? 'text-[#2f8f8c]'
            : new Date(bill.dueDate).toISOString().split('T')[0] < new Date().toISOString().split('T')[0]
              ? 'text-[#d2524b]'
              : 'text-[#d2895a]';

        const statusText =
          bill.status === 'paid'
            ? 'Paid'
            : new Date(bill.dueDate).toISOString().split('T')[0] < new Date().toISOString().split('T')[0]
              ? 'Overdue'
              : 'Due Soon';

        const row = dom.createElement('tr', {
          className: 'border-b border-[#eceff3] last:border-0',
          innerHTML: `
            <td class="px-4 py-5 text-[27px] leading-none font-semibold text-[#1f2131]">${bill.title}</td>
            <td class="px-4 py-5 text-[25px] leading-none text-[#6f7480]">${utils.formatDate(bill.dueDate)}</td>
            <td class="px-4 py-5 text-[25px] leading-none font-semibold ${statusClass}">${statusText}</td>
            <td class="px-4 py-5 text-right text-[29px] leading-none font-bold text-[#1f2131]">${utils.formatCurrency(bill.amount)}</td>
          `,
        });

        dom.appendChild(body, row);
      });
    }

    pageIndicator.textContent = String(currentPage);
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
    if (currentPage > 1) {
      currentPage -= 1;
      renderRows();
    }
  });

  dom.addEventListener(nextBtn, 'click', () => {
    const totalPages = Math.max(1, Math.ceil(getSortedBills().length / PAGE_SIZE));
    if (currentPage < totalPages) {
      currentPage += 1;
      renderRows();
    }
  });

  renderRows();
}
