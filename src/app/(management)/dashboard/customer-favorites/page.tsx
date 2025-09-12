import { Metadata } from 'next';
import { CustomerFavoritesManager } from '@/components/features/customers/customer-favorites-manager';

export const metadata: Metadata = {
  title: 'Customer Favorites | Dashboard',
  description: 'Track customer preferences for services, staff, and products',
};

export default function CustomerFavoritesPage() {
  return <CustomerFavoritesManager />;
}