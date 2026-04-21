'use client';

import { useEffect, useState } from 'react';
import * as storage from '@/lib/storage';
import * as utils from '@/lib/utils';
import { renderBudgetsPage, showAddBudgetForm } from '@/components/BudgetsPage';

export default function BudgetsRoutePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    renderBudgetsPage(() => {
      showAddBudgetForm((category, maxSpend, theme) => {
        storage.addBudget({ category, maxSpend, theme });
        utils.showSuccessMessage('Budget added successfully');
        setRefreshKey(prev => prev + 1);
      });
    });
  }, [refreshKey]);

  return <div id="budgets-page" className="space-y-8" />;
}
