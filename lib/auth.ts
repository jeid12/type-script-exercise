import * as storage from '@/lib/storage';
import { User } from '@/lib/types';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePassword(password: string): string {
  return password.trim();
}

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem('users');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as User[]) : [];
  } catch {
    return [];
  }
}

export function loginWithCredentials(email: string, password: string): User | null {
  const users = getStoredUsers();
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = normalizePassword(password);
  const matched = users.find(
    user => normalizeEmail(user.email) === normalizedEmail && user.password === normalizedPassword
  );

  if (!matched) return null;

  storage.saveUser(matched);
  return matched;
}

export function signupWithCredentials(name: string, email: string, password: string):
  | { ok: true; user: User }
  | { ok: false; message: string } {
  const users = getStoredUsers();
  const normalizedEmail = normalizeEmail(email);

  if (users.some(user => normalizeEmail(user.email) === normalizedEmail)) {
    return { ok: false, message: 'Email already in use' };
  }

  const newUser: User = {
    id: Date.now().toString(),
    email: normalizedEmail,
    name: name.trim(),
    password: normalizePassword(password),
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  storage.saveUser(newUser);

  return { ok: true, user: newUser };
}
