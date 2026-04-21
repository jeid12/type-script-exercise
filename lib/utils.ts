export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validatePositiveNumber(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSignupForm(name: string, email: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!name.trim()) {
    errors.name = 'Name is required';
  }

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be at least 8 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateBudgetForm(category: string, maxSpend: string, theme: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!category.trim()) {
    errors.category = 'Category is required';
  }

  if (!maxSpend.trim()) {
    errors.maxSpend = 'Maximum spend is required';
  } else if (!validatePositiveNumber(maxSpend)) {
    errors.maxSpend = 'Must be a positive number';
  }

  if (!theme.trim()) {
    errors.theme = 'Theme is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateTransactionForm(
  amount: string,
  category: string,
  date: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!amount.trim()) {
    errors.amount = 'Amount is required';
  } else if (!validatePositiveNumber(amount)) {
    errors.amount = 'Must be a positive number';
  }

  if (!category.trim()) {
    errors.category = 'Category is required';
  }

  if (!date.trim()) {
    errors.date = 'Date is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function parseAmount(value: string): number {
  return parseFloat(value) || 0;
}

export function parseFormValues(values: Record<string, string>): Record<string, string | number | boolean> {
  const parsed: Record<string, string | number | boolean> = {};

  Object.entries(values).forEach(([key, value]) => {
    if (!isNaN(parseFloat(value)) && isFinite(Number(value))) {
      parsed[key] = parseFloat(value);
    } else if (value === 'true' || value === 'false') {
      parsed[key] = value === 'true';
    } else {
      parsed[key] = value;
    }
  });

  return parsed;
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

export function showSuccessMessage(message: string, durationMs = 200): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const containerId = 'global-success-toast-container';
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto rounded-lg bg-[#201f24] px-4 py-3 text-sm font-semibold text-white shadow-lg border border-[#35343a]';
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
    if (container && container.childElementCount === 0) {
      container.remove();
    }
  }, durationMs);
}
