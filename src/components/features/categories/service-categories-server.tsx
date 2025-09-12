import { createClient } from '@/lib/supabase/server'
import { ServiceCategoriesClient } from './service-categories-client'

async function getCategoriesData() {
  const supabase = await createClient()
  
  // Get categories with service counts
  const { data: categories, error: categoriesError } = await supabase
    .from('service_categories')
    .select(`
      *,
      services(count)
    `)
    .order('display_order', { ascending: true })
  
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
  }
  
  // Get statistics
  const { count: totalCount } = await supabase
    .from('service_categories')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeCount } = await supabase
    .from('service_categories')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  // Get services without category
  const { count: uncategorizedCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .is('category_id', null)
  
  return {
    categories: categories || [],
    counts: {
      total: totalCount || 0,
      active: activeCount || 0,
      inactive: (totalCount || 0) - (activeCount || 0),
      uncategorized: uncategorizedCount || 0
    }
  }
}

export async function ServiceCategoriesServer() {
  const data = await getCategoriesData()
  
  return <ServiceCategoriesClient {...data} />
}