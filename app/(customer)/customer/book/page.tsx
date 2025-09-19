import { SalonSearchWrapper } from '@/core/customer/components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Select a Salon',
  description: 'Choose a salon to book your appointment',
};

export default function SalonSelectionPage() {
  return <SalonSearchWrapper />;
}