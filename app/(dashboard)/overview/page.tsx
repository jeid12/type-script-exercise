'use client';

import { useEffect } from 'react';
import { renderOverviewPage } from '../../../components/OverviewPage';

export default function OverviewRoutePage() {
  useEffect(() => {
    renderOverviewPage();
  }, []);

  return <div id="overview-page" className="space-y-8" />;
}
