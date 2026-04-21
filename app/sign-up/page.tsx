'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as dom from '@/lib/dom';
import * as storage from '@/lib/storage';
import { renderSignupPage } from '@/components/SignupPage';
import { signupWithCredentials } from '@/lib/auth';

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    if (storage.getUser()) {
      router.replace('/overview');
      return;
    }

    renderSignupPage(
      () => router.push('/'),
      (name: string, email: string, password: string) => {
        const result = signupWithCredentials(name, email, password);
        if (!result.ok) {
          const errorsDiv = dom.querySelector<HTMLDivElement>('#signup-errors');
          if (!errorsDiv) return;
          dom.clearChildren(errorsDiv);
          const errorEl = dom.createElement('div', {
            textContent: result.message,
            className: 'text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded',
          });
          dom.appendChild(errorsDiv, errorEl);
          return;
        }

        router.push('/overview');
      }
    );
  }, [router]);

  return <div id="signup-page" className="min-h-screen" />;
}
