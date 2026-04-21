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
        <button id="add-pot-btn" class="rounded-lg bg-[#201f24] px-5 py-3 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          + Add New Pot
        </button>
      </div>

      <div id="pots-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${pots.length === 0 ? '<div class="col-span-full rounded-2xl bg-white p-10 text-center text-sm text-[#696868]">No pots yet. Add one to start saving.</div>' : ''}
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
      className: 'rounded-2xl bg-white p-6',
      innerHTML: `
        <div class="mb-8 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="inline-block h-4 w-4 rounded-full shrink-0" style="background:${barColor}"></span>
            <h3 class="text-xl font-bold text-[#201f24]">${pot.name}</h3>
          </div>
          <button class="text-[#696868] hover:text-[#201f24] text-sm">•••</button>
        </div>

        <div class="mb-4 flex items-end justify-between">
          <span class="text-sm text-[#696868]">Total Saved</span>
          <span class="text-[32px] leading-none font-bold text-[#201f24]">${utils.formatCurrency(pot.saved)}</span>
        </div>

        <div class="h-2 rounded-full bg-[#f2eeeb] overflow-hidden mb-3">
          <div class="h-full rounded-full transition-all" style="width:${percent}%; background:${barColor};"></div>
        </div>

        <div class="mb-8 flex justify-between text-xs text-[#696868]">
          <span class="font-bold">${percent.toFixed(1)}%</span>
          <span>Target of ${utils.formatCurrency(pot.target)}</span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button class="add-money-btn rounded-lg bg-[#f8f4f0] py-3 text-sm font-bold text-[#201f24] hover:bg-[#f2eeeb] transition-colors" data-pot-id="${pot.id}">+ Add Money</button>
          <button class="withdraw-btn rounded-lg bg-[#f8f4f0] py-3 text-sm font-bold text-[#201f24] hover:bg-[#f2eeeb] transition-colors" data-pot-id="${pot.id}">Withdraw</button>
        </div>
      `,
    });

    dom.appendChild(list, card);
  });
}

function modalShell(title: string, bodyHtml: string): HTMLDivElement {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4',
    innerHTML: `
      <div class="w-full max-w-[560px] rounded-2xl bg-white p-8 shadow-2xl">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-xl font-bold text-[#201f24]">${title}</h3>
          <button class="modal-close text-[#696868] hover:text-[#201f24] text-xl leading-none">×</button>
        </div>
        ${bodyHtml}
      </div>
    `,
  });
  return overlay as HTMLDivElement;
}

export function showAddPotForm(onAdd: (name: string, target: number, theme: string) => void): void {
  const overlay = modalShell('Add New Pot', `
    <form id="pot-form" class="space-y-4">
      <div>
        <label class="mb-1 block text-xs font-bold text-[#201f24]">Pot Name</label>
        <input name="name" type="text" maxlength="30"
          class="h-11 w-full rounded-lg border border-[#98908b] px-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24]" required>
      </div>

      <div>
        <label class="mb-1 block text-xs font-bold text-[#201f24]">Target Amount</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#696868]">$</span>
          <input name="target" type="number" step="0.01" min="0" placeholder="e.g. 5000"
            class="h-11 w-full rounded-lg border border-[#98908b] pl-7 pr-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24]" required>
        </div>
      </div>

      <div>
        <label class="mb-1 block text-xs font-bold text-[#201f24]">Theme</label>
        <select name="theme"
          class="h-11 w-full rounded-lg border border-[#98908b] px-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24] bg-white" required>
          <option value="green">● Green</option>
          <option value="yellow">● Yellow</option>
          <option value="cyan">● Cyan</option>
          <option value="navy">● Navy</option>
          <option value="red">● Red</option>
          <option value="purple">● Purple</option>
          <option value="turquoise">● Turquoise</option>
          <option value="brown">● Brown</option>
          <option value="magenta">● Magenta</option>
          <option value="blue">● Blue</option>
          <option value="grey">● Grey</option>
          <option value="orange">● Orange</option>
        </select>
      </div>

      <button type="submit"
        class="mt-2 h-12 w-full rounded-lg bg-[#201f24] text-sm font-bold text-white hover:opacity-90 transition-opacity">
        Add Pot
      </button>
    </form>
  `);

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#pot-form')!;
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.modal-close')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onAdd(values.name, parseFloat(values.target), values.theme);
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(closeBtn, 'click', () => dom.removeChild(document.body, overlay));
}

export function showAddMoneyForm(
  _potId: string,
  potName: string,
  currentSaved: number,
  target: number,
  onAdd: (amount: number) => void
): void {
  const percent = target > 0 ? Math.round((currentSaved / target) * 100) : 0;

  const overlay = modalShell('Add to Pot', `
    <p class="text-sm text-[#696868] mb-6">Add money to "${potName}"</p>

    <div class="mb-6 rounded-xl bg-[#f8f4f0] p-4 flex items-center justify-between">
      <div>
        <p class="text-xs text-[#696868] mb-1">New Amount</p>
        <p class="text-2xl font-bold text-[#201f24]">${utils.formatCurrency(currentSaved)}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-[#696868] mb-1">${percent}% of target</p>
        <p class="text-sm font-bold text-[#201f24]">Target: ${utils.formatCurrency(target)}</p>
      </div>
    </div>

    <form id="add-money-form" class="space-y-4">
      <div>
        <label class="mb-1 block text-xs font-bold text-[#201f24]">Amount to Add</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#696868]">$</span>
          <input name="amount" type="number" step="0.01" min="0" max="${Math.max(0, target - currentSaved)}"
            class="h-11 w-full rounded-lg border border-[#98908b] pl-7 pr-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24]" required>
        </div>
      </div>

      <button type="submit"
        class="mt-2 h-12 w-full rounded-lg bg-[#201f24] text-sm font-bold text-white hover:opacity-90 transition-opacity">
        Confirm Addition
      </button>
    </form>
  `);

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#add-money-form')!;
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.modal-close')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onAdd(parseFloat(values.amount));
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(closeBtn, 'click', () => dom.removeChild(document.body, overlay));
}

export function showWithdrawForm(
  _potId: string,
  potName: string,
  currentSaved: number,
  onWithdraw: (amount: number) => void
): void {
  const overlay = modalShell('Withdraw from Pot', `
    <p class="text-sm text-[#696868] mb-6">Withdraw from "${potName}"</p>

    <div class="mb-6 rounded-xl bg-[#f8f4f0] p-4">
      <p class="text-xs text-[#696868] mb-1">Current Savings</p>
      <p class="text-2xl font-bold text-[#201f24]">${utils.formatCurrency(currentSaved)}</p>
    </div>

    <form id="withdraw-form" class="space-y-4">
      <div>
        <label class="mb-1 block text-xs font-bold text-[#201f24]">Amount to Withdraw</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#696868]">$</span>
          <input name="amount" type="number" step="0.01" min="0" max="${Math.max(0, currentSaved)}"
            class="h-11 w-full rounded-lg border border-[#98908b] pl-7 pr-4 text-sm text-[#201f24] focus:outline-none focus:border-[#201f24]" required>
        </div>
      </div>

      <button type="submit"
        class="mt-2 h-12 w-full rounded-lg bg-[#c94736] text-sm font-bold text-white hover:opacity-90 transition-opacity">
        Confirm Withdrawal
      </button>
    </form>
  `);

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#withdraw-form')!;
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.modal-close')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onWithdraw(parseFloat(values.amount));
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(closeBtn, 'click', () => dom.removeChild(document.body, overlay));
}
