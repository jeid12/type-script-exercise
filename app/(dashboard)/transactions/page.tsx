'use client';

import { useEffect, useState } from 'react';
import * as storage from '@/lib/storage';
import { renderTransactionsPage, showAddTransactionForm } from '@/components/TransactionsPage';

export default function TransactionsRoutePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    renderTransactionsPage(() => {
      showAddTransactionForm((type, amount, category, date, description, recipient) => {
        storage.addTransaction({
          type,
          amount,
          category,
          date,
          description,
          recipient,
        });
        setRefreshKey(prev => prev + 1);
      });
    });
  }, [refreshKey]);

  return <div id="transactions-page" className="space-y-8" />;
}
