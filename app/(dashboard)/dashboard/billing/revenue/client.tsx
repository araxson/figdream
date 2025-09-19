'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RevenueAnalytics } from '@/core/billing/components/revenue-analytics';
import { fetchRevenueReport, exportRevenueReportToCSV } from '@/core/billing/actions';
import type { RevenueReport } from '@/core/billing/types';

interface BillingRevenuePageProps {
  initialReport: RevenueReport | null;
  error: Error | null;
}

export function BillingRevenuePage({ initialReport, error }: BillingRevenuePageProps) {
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);

  const handlePeriodChange = async (period: { start: string; end: string }) => {
    setLoading(true);
    try {
      const result = await fetchRevenueReport({
        date_from: period.start,
        date_to: period.end,
      });

      if (result.success) {
        setReport(result.data || null);
      } else {
        toast.error(result.error || 'Failed to fetch revenue report');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!report) return;

    const result = await exportRevenueReportToCSV({
      date_from: report.period.start,
      date_to: report.period.end,
    });

    if (result.success && result.data) {
      // Create download link
      const blob = new Blob([result.data.content], { type: result.data.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Report exported successfully');
    } else {
      toast.error(result.error || 'Failed to export report');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <RevenueAnalytics
        report={report}
        analysis={null}
        loading={loading}
        error={error}
        onPeriodChange={handlePeriodChange}
        onExport={handleExport}
      />
    </div>
  );
}