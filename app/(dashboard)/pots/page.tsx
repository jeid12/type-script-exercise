'use client';

import { useEffect, useState } from 'react';
import * as storage from '@/lib/storage';
import * as dom from '@/lib/dom';
import { renderPotsPage, showAddPotForm, showAddMoneyForm, showWithdrawForm } from '@/components/PotsPage';

export default function PotsRoutePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    renderPotsPage(() => {
      showAddPotForm((name, target, theme) => {
        storage.addPot({ name, target, saved: 0, theme });
        setRefreshKey(prev => prev + 1);
      });
    });

    const addMoneyBtns = dom.querySelectorAll<HTMLButtonElement>('.add-money-btn');
    addMoneyBtns.forEach(btn => {
      dom.addEventListener(btn, 'click', () => {
        const potId = btn.getAttribute('data-pot-id');
        if (!potId) return;

        const pot = storage.getPots().find(item => item.id === potId);
        if (!pot) return;

        showAddMoneyForm(potId, pot.name, pot.saved, pot.target, (amount: number) => {
          storage.updatePot(potId, Math.min(pot.target, pot.saved + amount));
          setRefreshKey(prev => prev + 1);
        });
      });
    });

    const withdrawBtns = dom.querySelectorAll<HTMLButtonElement>('.withdraw-btn');
    withdrawBtns.forEach(btn => {
      dom.addEventListener(btn, 'click', () => {
        const potId = btn.getAttribute('data-pot-id');
        if (!potId) return;

        const pot = storage.getPots().find(item => item.id === potId);
        if (!pot) return;

        showWithdrawForm(potId, pot.name, pot.saved, (amount: number) => {
          storage.updatePot(potId, Math.max(0, pot.saved - amount));
          setRefreshKey(prev => prev + 1);
        });
      });
    });
  }, [refreshKey]);

  return <div id="pots-page" className="space-y-8" />;
}
