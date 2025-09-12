import { Metadata } from 'next';
import { FaqManager } from '@/components/features/support/faq-manager';

export const metadata: Metadata = {
  title: 'FAQ Management | Dashboard',
  description: 'Manage frequently asked questions',
};

export default function FaqPage() {
  return <FaqManager />;
}