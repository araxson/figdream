import { Metadata } from 'next';
import { ExportConfigurationsManager } from '@/components/features/reports/export-configurations-manager';

export const metadata: Metadata = {
  title: 'Export Configurations | Dashboard',
  description: 'Configure automated data exports and reports',
};

export default function ExportConfigurationsPage() {
  return <ExportConfigurationsManager />;
}