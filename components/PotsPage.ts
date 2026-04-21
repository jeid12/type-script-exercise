import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';

export function renderPotsPage(onAddClick: () => void): void {
  const page = dom.querySelector<HTMLDivElement>('#pots-page')!;
  dom.clearChildren(page);

  const pots = storage.getPots();

  const html = `
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Pots</h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">Save towards your goals</p>
        </div>
        <button id="add-pot-btn" class="w-full sm:w-auto bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-800 font-medium transition-colors">
          + Add New Pot
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="pots-list">
        ${pots.length === 0 ? '<p class="col-span-full text-slate-500 dark:text-slate-400 text-center py-16">No pots yet. Create one to start saving!</p>' : ''}
      </div>
    </div>
  `;

  dom.setHTML(page, html);

  const addBtn = dom.querySelector<HTMLButtonElement>('#add-pot-btn')!;
  dom.addEventListener(addBtn, 'click', onAddClick);

  const potsList = dom.querySelector<HTMLDivElement>('#pots-list')!;
  if (pots.length > 0) {
    dom.clearChildren(potsList);
    pots.forEach(pot => {
      const percentage = utils.calculatePercentage(pot.saved, pot.target);
      const isComplete = pot.saved >= pot.target;

      const card = dom.createElement('div', {
        className: `bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-t-4 border-slate-200 dark:border-slate-700 ${isComplete ? 'border-t-green-500' : 'border-t-blue-500'}`,
        innerHTML: `
          <div class="flex justify-between items-start mb-6">
            <h4 class="text-xl font-bold text-slate-900 dark:text-white">${pot.name}</h4>
            <button class="pot-menu text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2" data-pot-id="${pot.id}">⋮</button>
          </div>

          <div class="space-y-6">
            <div>
              <div class="flex justify-between items-end mb-2">
                <span class="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Saved</span>
                <span class="text-2xl font-bold text-slate-900 dark:text-white">${utils.formatCurrency(pot.saved)}</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-4 rounded-full overflow-hidden">
                <div class="${isComplete ? 'bg-green-500' : 'bg-blue-500'} h-full rounded-full transition-all" style="width: ${Math.min(percentage, 100)}%"></div>
              </div>
            </div>

            <div class="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>${percentage}% Complete</span>
              <span>Target: ${utils.formatCurrency(pot.target)}</span>
            </div>

            <div class="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button class="add-money-btn flex-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-colors" data-pot-id="${pot.id}">
                + Add Money
              </button>
              <button class="withdraw-btn flex-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-colors" data-pot-id="${pot.id}">
                Withdraw
              </button>
            </div>
          </div>
        `,
      });

      dom.appendChild(potsList, card);
    });

    attachPotEventListeners();
  }
}

function attachPotEventListeners(): void {
  dom.querySelectorAll<HTMLButtonElement>('.add-money-btn').forEach(btn => {
    dom.addEventListener(btn, 'click', () => {
      const potId = btn.getAttribute('data-pot-id');
      if (potId) {
        // Event will be handled in main component
        btn.dispatchEvent(new CustomEvent('addMoney', { detail: { potId } }));
      }
    });
  });

  dom.querySelectorAll<HTMLButtonElement>('.withdraw-btn').forEach(btn => {
    dom.addEventListener(btn, 'click', () => {
      const potId = btn.getAttribute('data-pot-id');
      if (potId) {
        btn.dispatchEvent(new CustomEvent('withdraw', { detail: { potId } }));
      }
    });
  });
}

export function showAddPotForm(onAdd: (name: string, target: number, theme: string) => void): void {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
    innerHTML: `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Add New Pot</h3>
        <form id="pot-form" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pot Name</label>
            <input type="text" name="name" placeholder="e.g., Vacation" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Amount</label>
            <input type="number" name="target" placeholder="0.00" step="0.01" min="0" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Theme Color</label>
            <select name="theme" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
              <option value="">Select a color</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="teal">Teal</option>
              <option value="pink">Pink</option>
            </select>
          </div>
          <div class="flex gap-3 pt-6">
            <button type="submit" class="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 font-semibold transition-colors">Create</button>
            <button type="button" id="cancel-pot" class="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    `,
  });

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#pot-form')!;
  const cancelBtn = dom.querySelector<HTMLButtonElement>('#cancel-pot')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onAdd(values.name, parseFloat(values.target), values.theme);
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(cancelBtn, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}

export function showAddMoneyForm(potId: string, potName: string, currentSaved: number, target: number, onAdd: (amount: number) => void): void {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
    innerHTML: `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Add Money</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">Add money to <strong>${potName}</strong></p>
        <form id="add-money-form" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
            <input type="number" name="amount" placeholder="0.00" step="0.01" min="0" max="${target - currentSaved}" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
          </div>
          <div class="flex gap-3 pt-6">
            <button type="submit" class="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 font-semibold transition-colors">Add</button>
            <button type="button" id="cancel-add-money" class="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    `,
  });

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#add-money-form')!;
  const cancelBtn = dom.querySelector<HTMLButtonElement>('#cancel-add-money')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onAdd(parseFloat(values.amount));
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(cancelBtn, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}

export function showWithdrawForm(potId: string, potName: string, currentSaved: number, onWithdraw: (amount: number) => void): void {
  const overlay = dom.createElement('div', {
    className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
    innerHTML: `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Withdraw Money</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">Withdraw from <strong>${potName}</strong></p>
        <form id="withdraw-form" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
            <input type="number" name="amount" placeholder="0.00" step="0.01" min="0" max="${currentSaved}" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
          </div>
          <div class="flex gap-3 pt-6">
            <button type="submit" class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors">Withdraw</button>
            <button type="button" id="cancel-withdraw" class="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    `,
  });

  dom.appendChild(document.body, overlay);

  const form = dom.querySelector<HTMLFormElement>('#withdraw-form')!;
  const cancelBtn = dom.querySelector<HTMLButtonElement>('#cancel-withdraw')!;

  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    onWithdraw(parseFloat(values.amount));
    dom.removeChild(document.body, overlay);
  });

  dom.addEventListener(cancelBtn, 'click', () => {
    dom.removeChild(document.body, overlay);
  });
}
