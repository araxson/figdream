import { createClient } from '@/lib/supabase/server'

async function getFavorites() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data: favorites } = await supabase
    .from('customer_favorites')
    .select(`
      *,
      salons (
        id,
        name,
        description,
        phone,
        salon_locations (
          city,
          state
        )
      )
    `)
    .eq('customer_id', user.id)
    .eq('favorite_type', 'salon')
  
  return favorites || []
}

export default async function FavoritesPage() {
  const favorites = await getFavorites()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorite Salons</h1>
      {favorites.length === 0 ? (
        <p className="text-muted-foreground">You haven&apos;t added any favorite salons yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{favorite.salons?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {favorite.salons?.salon_locations?.[0]?.city}, {favorite.salons?.salon_locations?.[0]?.state}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}