import { Metadata } from 'next'
import { FavoritesList } from '@/components/customer/favorites/favorites-list'

export const metadata: Metadata = {
  title: 'Favorites',
  description: 'Your favorite salons and services',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
        <p className="text-muted-foreground">Your favorite salons and services</p>
      </div>
      
      <FavoritesList />
    </div>
  )
}
