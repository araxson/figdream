import { Metadata } from 'next';
import { ServiceCategoriesClient } from './client';

export const metadata: Metadata = {
  title: 'Service Categories | Dashboard',
  description: 'Organize and manage service categories',
};

export default function ServiceCategoriesPage() {
  return <ServiceCategoriesClient />;
}