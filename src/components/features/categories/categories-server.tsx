import { createClient } from '@/lib/supabase/server'
import { CategoriesClient } from './categories-client'

async function getCategoriesData(salonId?: string) {
  const supabase = await createClient()
  
  // Build query for categories with salon and service count
  let categoriesQuery = supabase
    .from('service_categories')
    .select(`
      *,
      salon:salons!service_categories_salon_id_fkey(
        id,
        name,
        slug
      ),
      services:services(count)
    `)
    .order('display_order', { ascending: true })
  
  // Filter by salon if provided
  if (salonId) {
    categoriesQuery = categoriesQuery.eq('salon_id', salonId)
  }
  
  const { data: categories, error: categoriesError } = await categoriesQuery
  
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
  }
  
  // Get salons for filter dropdown
  const { data: salons } = await supabase
    .from('salons')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  // Get statistics
  const statsQuery = supabase
    .from('service_categories')
    .select('*', { count: 'exact', head: true })
  
  if (salonId) {
    statsQuery.eq('salon_id', salonId)
  }
  
  const { count: totalCategories } = await statsQuery
  
  const activeStatsQuery = supabase
    .from('service_categories')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  if (salonId) {
    activeStatsQuery.eq('salon_id', salonId)
  }
  
  const { count: activeCategories } = await activeStatsQuery
  
  // Count total services across all categories
  let servicesQuery = supabase
    .from('services')
    .select('category_id', { count: 'exact', head: true })
  
  if (salonId) {
    // Get categories for this salon first
    const { data: salonCategories } = await supabase
      .from('service_categories')
      .select('id')
      .eq('salon_id', salonId)
    
    const categoryIds = salonCategories?.map(c => c.id) || []
    if (categoryIds.length > 0) {
      servicesQuery = servicesQuery.in('category_id', categoryIds)
    }
  }
  
  const { count: totalServices } = await servicesQuery
  
  // Get salon count if super admin view
  const { count: totalSalons } = salonId 
    ? { count: 1 }
    : await supabase
        .from('salons')
        .select('*', { count: 'exact', head: true })
  
  // Transform categories to include service count
  const categoriesWithCounts = categories?.map(category => ({
    ...category,
    serviceCount: category.services?.[0]?.count || 0,
    services: undefined // Remove raw service data
  })) || []
  
  return {
    categories: categoriesWithCounts,
    salons: salons || [],
    counts: {
      total: totalCategories || 0,
      active: activeCategories || 0,
      services: totalServices || 0,
      salons: totalSalons || 0
    },
    currentSalonId: salonId
  }
}

interface CategoriesServerProps {
  salonId?: string
}

export async function CategoriesServer({ salonId }: CategoriesServerProps) {
  const data = await getCategoriesData(salonId)
  
  return <CategoriesClient {...data} />
}