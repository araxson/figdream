import { Database } from '@/types/database.types'

export type CustomerFavorite = Database['public']['Tables']['customer_favorites']['Row'] & {
  salons?: Database['public']['Tables']['salons']['Row']
  services?: Database['public']['Tables']['services']['Row']
  staff_profiles?: {
    profiles?: Database['public']['Tables']['profiles']['Row']
  }
}

export type FavoriteTab = 'salons' | 'services' | 'staff'