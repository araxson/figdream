import { Metadata } from 'next';
import { ProductInventoryManager } from '@/components/features/inventory/product-inventory-manager';

export const metadata: Metadata = {
  title: 'Product Inventory | Dashboard',
  description: 'Manage salon products and stock levels',
};

export default function InventoryPage() {
  return <ProductInventoryManager />;
}