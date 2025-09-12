import { Metadata } from 'next';
import { SalonLocationsManager } from '@/components/features/salons/salon-locations-manager';

export const metadata: Metadata = {
  title: 'Salon Locations | Dashboard',
  description: 'Manage salon locations and branches',
};

export default function SalonLocationsPage() {
  return <SalonLocationsManager />;
}