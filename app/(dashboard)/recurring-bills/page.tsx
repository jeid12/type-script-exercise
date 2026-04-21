'use client';

import { useEffect } from 'react';
import { renderRecurringBillsPage } from '@/components/RecurringBillsPage';

export default function RecurringBillsRoutePage() {
  useEffect(() => {
    renderRecurringBillsPage();
  }, []);

  return <div id="bills-page" className="space-y-8" />;
}
