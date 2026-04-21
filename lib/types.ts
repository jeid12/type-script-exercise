export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
  recipient: string;
}

export interface Budget {
  id: string;
  category: string;
  maxSpend: number;
  theme: string;
}

export interface Pot {
  id: string;
  name: string;
  target: number;
  saved: number;
  theme: string;
}

export interface RecurringBill {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending';
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}

export interface Summary {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface AppData {
  user: User | null;
  transactions: Transaction[];
  budgets: Budget[];
  pots: Pot[];
  bills: RecurringBill[];
}
