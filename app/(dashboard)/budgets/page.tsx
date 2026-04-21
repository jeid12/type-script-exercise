'use client';

import { useEffect, useState } from 'react';
import * as storage from '@/lib/storage';
import { renderBudgetsPage, showAddBudgetForm } from '@/components/BudgetsPage';

export default function BudgetsRoutePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    renderBudgetsPage(() => {
      showAddBudgetForm((category, maxSpend, theme) => {
        storage.addBudget({ category, maxSpend, theme });
        setRefreshKey(prev => prev + 1);
      });
    });
  }, [refreshKey]);

  return <div id="budgets-page" className="space-y-8" />;
}
