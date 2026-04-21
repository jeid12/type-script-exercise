import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

function progress(saved: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, (saved / target) * 100);
}

function colorByTheme(theme: string): string {
  const key = theme.trim().toLowerCase();
  const map: Record<string, string> = {
    green: '#277c78',
    grey: '#97a0ac',
    cyan: '#82c9d7',
    orange: '#be6c49',
    purple: '#826cb0',
    red: '#c94736',
    yellow: '#f2cdac',
    navy: '#626070',
    turquoise: '#597c7c',
    brown: '#93674f',
    magenta: '#9d507d',
    blue: '#3f82b2',
  };
  return map[key] || '#277c78';
}

export function renderPotsPage(onAddClick: () => void): void {
  const page = dom.querySelector<HTMLDivElement>('#pots-page')!;
  dom.clearChildren(page);

  const pots = storage.getPots();

  const html = `
    <div class="space-y-6">
      <div class="flex items-center justify-end">
        <button id="add-pot-btn" class="rounded-xl bg-[#1d1d2b] px-6 py-3 text-white font-semibold hover:bg-[#2a2a3d]">
          +Add New Pot
        </button>
      </div>

      <div id="pots-list" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        ${pots.length === 0 ? '<div class="col-span-full rounded-xl border border-[#ece7e7] bg-white p-10 text-center text-[#8a8f98]">No pots yet. Add one to start saving.</div>' : ''}
      </div>
    </div>
  `;

  dom.setHTML(page, html);

  const addBtn = dom.querySelector<HTMLButtonElement>('#add-pot-btn')!;
  dom.addEventListener(addBtn, 'click', onAddClick);

  if (pots.length === 0) return;

  const list = dom.querySelector<HTMLDivElement>('#pots-list')!;
  dom.clearChildren(list);

  pots.forEach(pot => {
    const percent = progress(pot.saved, pot.target);
    const barColor = colorByTheme(pot.theme);

    const card = dom.createElement('article', {
      className: 'rounded-xl border border-[#ece7e7] bg-white p-5',
      innerHTML: `
        <div class="mb-5 flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="inline-block h-4 w-4 rounded-full" style="background:${barColor}"></span>
            <h3 class="text-[34px] leading-none font-bold text-[#252733]">${pot.name}</h3>
          </div>
          <button class="text-xl text-[#4f5664]">•••</button>
        </div>

        <div class="mb-4 flex items-end justify-between">
          <span class="text-[27px] leading-none text-[#6f7480]">Total Saved</span>
          <span class="text-[51px] leading-none font-bold text-[#252733]">${utils.formatCurrency(pot.saved)}</span>
        </div>

        <div class="h-2 rounded bg-[#ece7e7] overflow-hidden mb-3">
          <div class="h-full" style="width:${percent}%; background:${barColor};"></div>
        </div>

        <div class="mb-5 flex justify-between text-[25px] leading-none text-[#8a8f98]">
          <span>${percent.toFixed(1)}%</span>
          <span>Target of ${utils.formatCurrency(pot.target)}</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button class="add-money-btn rounded-xl bg-[#f4f1f1] py-3 font-semibold text-[#2d2f3b] hover:bg-[#ebe5e5]" data-pot-id="${pot.id}">+ Add Money</button>
          <button class="withdraw-btn rounded-xl bg-[#f4f1f1] py-3 font-semibold text-[#2d2f3b] hover:bg-[#ebe5e5]" data-pot-id="${pot.id}">Withdraw</button>
        </div>
      `,
    });

    dom.appendChild(list, card);
  });
}

export function showAddPotForm(onAdd: (name: string, target: number, theme: string) => void): void {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4',
    innerHTML: `
      <div class="w-full max-w-[610px] rounded-xl bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-4xl leading-none font-bold text-[#1f2131]">Add New Pot</h3>
          <button id="close-pot-modal" class="text-2xl text-[#777b86] hover:text-[#1f2131]">×</button>
        </div>

        <form id="pot-form" class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Pot Name</label>
            <input name="name" type="text" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-[25px] leading-none text-[#1f2131] focus:outline-none" required>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Target Amount</label>
            <input name="target" type="number" step="0.01" min="0" placeholder="e.g. $5000" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-[25px] leading-none text-[#1f2131] focus:outline-none" required>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Theme</label>
            <select name="theme" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-[25px] leading-none text-[#1f2131] focus:outline-none" required>
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
              <option value="blue">Blue</option>
            </select>
          </div>

          <button type="submit" class="mt-2 h-12 w-full rounded-lg bg-[#1d1d2b] text-lg font-semibold text-white hover:bg-[#2a2a3d]">
            Submit
          </button>
        </form>
      </div>
    `,
  });

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#pot-form')!;
  const closeBtn = dom.querySelector<HTMLButtonElement>('#close-pot-modal')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onAdd(values.name, parseFloat(values.target), values.theme);
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(closeBtn, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}

export function showAddMoneyForm(
  potId: string,
  potName: string,
  currentSaved: number,
  target: number,
  onAdd: (amount: number) => void
): void {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4',
    innerHTML: `
      <div class="w-full max-w-[610px] rounded-xl bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-4xl leading-none font-bold text-[#1f2131]">Add Money</h3>
          <button id="close-add-money" class="text-2xl text-[#777b86] hover:text-[#1f2131]">×</button>
        </div>

        <p class="mb-4 text-[27px] leading-none text-[#6f7480]">Add money to ${potName}</p>

        <form id="add-money-form" class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Amount</label>
            <input name="amount" type="number" step="0.01" min="0" max="${Math.max(0, target - currentSaved)}" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-[25px] leading-none text-[#1f2131] focus:outline-none" required>
          </div>

          <button type="submit" class="mt-2 h-12 w-full rounded-lg bg-[#1d1d2b] text-lg font-semibold text-white hover:bg-[#2a2a3d]">
            Submit
          </button>
        </form>
      </div>
    `,
  });

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#add-money-form')!;
  const closeBtn = dom.querySelector<HTMLButtonElement>('#close-add-money')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onAdd(parseFloat(values.amount));
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(closeBtn, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}

export function showWithdrawForm(
  potId: string,
  potName: string,
  currentSaved: number,
  onWithdraw: (amount: number) => void
): void {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4',
    innerHTML: `
      <div class="w-full max-w-[610px] rounded-xl bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-4xl leading-none font-bold text-[#1f2131]">Withdraw</h3>
          <button id="close-withdraw" class="text-2xl text-[#777b86] hover:text-[#1f2131]">×</button>
        </div>

        <p class="mb-4 text-[27px] leading-none text-[#6f7480]">Withdraw from ${potName}</p>

        <form id="withdraw-form" class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-[#6e7280]">Amount</label>
            <input name="amount" type="number" step="0.01" min="0" max="${Math.max(0, currentSaved)}" class="h-12 w-full rounded-lg border border-[#cfd4dc] px-4 text-[25px] leading-none text-[#1f2131] focus:outline-none" required>
          </div>

          <button type="submit" class="mt-2 h-12 w-full rounded-lg bg-[#1d1d2b] text-lg font-semibold text-white hover:bg-[#2a2a3d]">
            Submit
          </button>
        </form>
      </div>
    `,
  });

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#withdraw-form')!;
  const closeBtn = dom.querySelector<HTMLButtonElement>('#close-withdraw')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onWithdraw(parseFloat(values.amount));
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(closeBtn, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}
