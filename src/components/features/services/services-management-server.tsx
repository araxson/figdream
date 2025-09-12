import { createClient } from '@/lib/supabase/server'
import { ServicesManagementClient } from './services-management-client'

async function getServicesData() {
  const supabase = await createClient()
  
  // Get services with salon and category info
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select(`
      *,
      salon:salons(id, name),
      category:service_categories(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (servicesError) {
    console.error('Error fetching services:', servicesError)
  }
  
  // Get counts by status
  const { count: totalCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  const { count: inactiveCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', false)
  
  const { count: addonCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('is_addon', true)
  
  // Get salons for filter
  const { data: salons } = await supabase
    .from('salons')
    .select('id, name')
    .order('name')
  
  // Get categories for filter
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name')
    .order('name')
  
  return {
    services: services || [],
    counts: {
      total: totalCount || 0,
      active: activeCount || 0,
      inactive: inactiveCount || 0,
      addons: addonCount || 0
    },
    salons: salons || [],
    categories: categories || []
  }
}

export async function ServicesManagementServer() {
  const data = await getServicesData()
  
  return <ServicesManagementClient {...data} />
}