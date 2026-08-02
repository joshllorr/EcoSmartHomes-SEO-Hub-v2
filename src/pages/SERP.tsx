import React from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import SERPViewer from '../components/SERP/SERPViewer';

export default function SERP() {
  const serp = useDashboardStore((s) => s.serp);

  return (
    <div className="p-8" id="serp-page-view">
      <SERPViewer serp={serp} />
    </div>
  );
}
