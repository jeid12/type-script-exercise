import { AppData, Transaction, Budget, Pot, RecurringBill, User } from './types';

const STORAGE_KEY = 'finance_app_data';

const defaultAppData: AppData = {
  user: null,
  transactions: [],
  budgets: [],
  pots: [],
  bills: [],
};

function getAppData(): AppData {
  if (typeof window === 'undefined') {
    return defaultAppData;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (!stored) {
    return defaultAppData;
  }

  try {
    const parsed = JSON.parse(stored) as AppData;
    return parsed;
  } catch {
    return defaultAppData;
  }
}

function saveAppData(data: AppData): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function saveUser(user: User): void {
  const data = getAppData();
  data.user = user;
  saveAppData(data);
}

export function getUser(): User | null {
  return getAppData().user;
}

export function logoutUser(): void {
  const data = getAppData();
  data.user = null;
  saveAppData(data);
}

export function addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
  const data = getAppData();
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
  };
  data.transactions.push(newTransaction);
  saveAppData(data);
  return newTransaction;
}

export function getTransactions(): Transaction[] {
  return getAppData().transactions;
}

export function addBudget(budget: Omit<Budget, 'id'>): Budget {
  const data = getAppData();
  const newBudget: Budget = {
    ...budget,
    id: generateId(),
  };
  data.budgets.push(newBudget);
  saveAppData(data);
  return newBudget;
}

export function getBudgets(): Budget[] {
  return getAppData().budgets;
}

export function addPot(pot: Omit<Pot, 'id'>): Pot {
  const data = getAppData();
  const newPot: Pot = {
    ...pot,
    id: generateId(),
  };
  data.pots.push(newPot);
  saveAppData(data);
  return newPot;
}

export function getPots(): Pot[] {
  return getAppData().pots;
}

export function updatePot(id: string, saved: number): void {
  const data = getAppData();
  const pot = data.pots.find(p => p.id === id);
  if (pot) {
    pot.saved = saved;
    saveAppData(data);
  }
}

export function addBill(bill: Omit<RecurringBill, 'id'>): RecurringBill {
  const data = getAppData();
  const newBill: RecurringBill = {
    ...bill,
    id: generateId(),
  };
  data.bills.push(newBill);
  saveAppData(data);
  return newBill;
}

export function getBills(): RecurringBill[] {
  return getAppData().bills;
}

export function calculateSummary(): { balance: number; income: number; expenses: number } {
  const transactions = getTransactions();
  
  let income = 0;
  let expenses = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      income += transaction.amount;
    } else {
      expenses += transaction.amount;
    }
  });

  return {
    balance: income - expenses,
    income,
    expenses,
  };
}

export function getExpensesByCategory(): Record<string, number> {
  const transactions = getTransactions();
  const expenses: Record<string, number> = {};

  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      expenses[transaction.category] = (expenses[transaction.category] || 0) + transaction.amount;
    }
  });

  return expenses;
}

export function getBillsSummary(): { paid: number; upcoming: number; due: number } {
  const bills = getBills();
  const today = new Date().toISOString().split('T')[0];

  let paid = 0;
  let upcoming = 0;
  let due = 0;

  bills.forEach(bill => {
    if (bill.status === 'paid') {
      paid += bill.amount;
    } else if (bill.dueDate < today) {
      due += bill.amount;
    } else {
      upcoming += bill.amount;
    }
  });

  return { paid, upcoming, due };
}
