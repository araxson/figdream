import { FavoritesList } from '@/core/customer/components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Favorites',
  description: 'Your favorite salons, services, and staff',
};

export default function FavoritesPage() {
  // TODO: Fetch favorites from server
  return <FavoritesList favorites={[]} />;
}