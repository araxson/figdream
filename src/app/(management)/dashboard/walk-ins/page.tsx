import { Metadata } from 'next';
import { WalkInManager } from '@/components/features/appointments/walk-in-manager';

export const metadata: Metadata = {
  title: 'Walk-in Management | Dashboard',
  description: 'Manage walk-in customers without appointments',
};

export default function WalkInsPage() {
  return <WalkInManager />;
}