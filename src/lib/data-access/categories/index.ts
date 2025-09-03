'use server'
import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
import { getUserWithRole } from '@/lib/data-access/auth/verify'
import { hasMinimumRoleLevel } from '@/lib/data-access/auth/roles'
// ULTRA-TYPES: Comprehensive type definitions with 3-step-ahead thinking
type ServiceCategoryInsert = Database['public']['Tables']['service_categories']['Insert']
type ServiceCategoryUpdate = Database['public']['Tables']['service_categories']['Update']
type Service = Database['public']['Tables']['services']['Row']
// ULTRA-INTERFACES: Extended types considering future needs
export interface ServiceCategoryWithServices {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  color?: string | null
  display_order: number
  is_active: boolean
  parent_id?: string | null
  salon_id?: string | null
  created_at?: string
  updated_at?: string
  services?: Service[]
  services_count?: number
  subcategories?: ServiceCategoryWithServices[]
  parent_category?: {
    id: string
    name: string
  }
}
export interface CategoryTree {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  color?: string | null
  display_order: number
  is_active: boolean
  children: CategoryTree[]
  services_count: number
}
// ULTRA-RESULTS: Standardized result types for consistency
export interface CategoryResult {
  data: ServiceCategory | null
  error: string | null
}
export interface CategoriesResult {
  data: ServiceCategoryWithServices[] | null
  error: string | null
}
export interface CategoryTreeResult {
  data: CategoryTree[] | null
  error: string | null
}
export interface CategoryDeleteResult {
  success: boolean
  error: string | null
  reassigned_count?: number
}
// ULTRA-FUNCTION: Get all categories with service counts
export async function getServiceCategories(
  includeInactive = false
): Promise<CategoriesResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }
    const supabase = await createClient()
    let query = supabase
      .from('service_categories')
      .select(`
        *,
        services (
          id,
          name,
          description,
          price,
          duration,
          is_active
        )
      `)
      .order('display_order', { ascending: true })
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }
    const { data: categories, error } = await query
    if (error) {
      return { data: null, error: error.message }
    }
    // Process categories with service counts
    const categoriesWithCounts = (categories || []).map(category => ({
      ...category,
      services: category.services || [],
      services_count: category.services?.length || 0
    }))
    return { data: categoriesWithCounts, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to fetch service categories' }
  }
}
// ULTRA-FUNCTION: Get category by ID with full details
export async function getCategoryById(
  categoryId: string
): Promise<{ data: ServiceCategoryWithServices | null; error: string | null }> {
  try {
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }
    const supabase = await createClient()
    const { data: category, error } = await supabase
      .from('service_categories')
      .select(`
        *,
        services (
          id,
          name,
          description,
          price,
          duration,
          is_active
        ),
        parent_category:parent_id (
          id,
          name
        )
      `)
      .eq('id', categoryId)
      .single()
    if (error) {
      return { data: null, error: 'Category not found' }
    }
    return { 
      data: {
        ...category,
        services_count: category.services?.length || 0
      }, 
      error: null 
    }
  } catch (_error) {
    return { data: null, error: 'Failed to fetch category' }
  }
}
// ULTRA-FUNCTION: Build category tree for hierarchical display
export async function getCategoryTree(): Promise<CategoryTreeResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }
    const supabase = await createClient()
    // Fetch all categories and services
    const { data: categories, error: catError } = await supabase
      .from('service_categories')
      .select(`
        *,
        services (id)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (catError) {
      return { data: null, error: catError.message }
    }
    // Build tree structure (considering future nested categories)
    const buildTree = (
      categories: Record<string, unknown>[], 
      parentId: string | null = null
    ): CategoryTree[] => {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          color: cat.color,
          display_order: cat.display_order,
          is_active: cat.is_active,
          services_count: cat.services?.length || 0,
          children: buildTree(categories, cat.id)
        }))
    }
    const tree = buildTree(categories || [], null)
    return { data: tree, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to build category tree' }
  }
}
// ULTRA-FUNCTION: Create new category (salon admin and above)
export async function createServiceCategory(
  categoryData: ServiceCategoryInsert
): Promise<CategoryResult> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_owner')
    if (roleError) {
      return { data: null, error: roleError }
    }
    if (!hasPermission) {
      return { data: null, error: 'Insufficient permissions' }
    }
    const supabase = await createClient()
    // Get max display order for auto-ordering
    const { data: maxOrder } = await supabase
      .from('service_categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()
    const newDisplayOrder = (maxOrder?.display_order || 0) + 1
    const { data: category, error } = await supabase
      .from('service_categories')
      .insert({
        ...categoryData,
        display_order: categoryData.display_order || newDisplayOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: category, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to create category' }
  }
}
// ULTRA-FUNCTION: Update category with validation
export async function updateServiceCategory(
  categoryId: string,
  updates: ServiceCategoryUpdate
): Promise<CategoryResult> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_owner')
    if (roleError) {
      return { data: null, error: roleError }
    }
    if (!hasPermission) {
      return { data: null, error: 'Insufficient permissions' }
    }
    const supabase = await createClient()
    // Prevent circular reference if updating parent_id
    if (updates.parent_id) {
      // Check if the new parent is a descendant of this category
      // This prevents circular references (3-step-ahead thinking)
      const { data: descendants } = await supabase
        .rpc('get_category_descendants', { category_id: categoryId })
      if (descendants?.some((d: { id: string }) => d.id === updates.parent_id)) {
        return { data: null, error: 'Cannot set descendant as parent (circular reference)' }
      }
    }
    // Remove fields that shouldn't be updated directly
    const safeUpdates = { ...updates }
    delete (safeUpdates as Record<string, unknown>).id
    delete (safeUpdates as Record<string, unknown>).created_at
    const { data: category, error } = await supabase
      .from('service_categories')
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single()
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: category, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to update category' }
  }
}
// ULTRA-FUNCTION: Delete category with service reassignment
export async function deleteServiceCategory(
  categoryId: string,
  reassignToCategoryId?: string
): Promise<CategoryDeleteResult> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_owner')
    if (roleError) {
      return { success: false, error: roleError }
    }
    if (!hasPermission) {
      return { success: false, error: 'Insufficient permissions' }
    }
    const supabase = await createClient()
    // Check if category has services
    const { data: _services, count } = await supabase
      .from('services')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId)
    if ((count || 0) > 0 && !reassignToCategoryId) {
      return { 
        success: false, 
        error: `Category has ${count} services. Provide reassignToCategoryId to move them.` 
      }
    }
    // Reassign services if needed
    if ((count || 0) > 0 && reassignToCategoryId) {
      const { error: reassignError } = await supabase
        .from('services')
        .update({ 
          category_id: reassignToCategoryId,
          updated_at: new Date().toISOString()
        })
        .eq('category_id', categoryId)
      if (reassignError) {
        return { success: false, error: 'Failed to reassign services' }
      }
    }
    // Check for subcategories (future-proofing)
    const { count: subCount } = await supabase
      .from('service_categories')
      .select('id', { count: 'exact' })
      .eq('parent_id', categoryId)
    if ((subCount || 0) > 0) {
      // Update subcategories to have no parent
      await supabase
        .from('service_categories')
        .update({ parent_id: null })
        .eq('parent_id', categoryId)
    }
    // Delete the category
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId)
    if (error) {
      return { success: false, error: error.message }
    }
    return { 
      success: true, 
      error: null,
      reassigned_count: count || 0
    }
  } catch (_error) {
    return { success: false, error: 'Failed to delete category' }
  }
}
// ULTRA-FUNCTION: Reorder categories (drag-drop support)
export async function reorderCategories(
  categoryOrders: Array<{ id: string; display_order: number }>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_owner')
    if (roleError) {
      return { success: false, error: roleError }
    }
    if (!hasPermission) {
      return { success: false, error: 'Insufficient permissions' }
    }
    const supabase = await createClient()
    // Update all categories in a transaction-like manner
    const updates = categoryOrders.map(({ id, display_order }) =>
      supabase
        .from('service_categories')
        .update({ 
          display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
    )
    const results = await Promise.all(updates)
    const hasError = results.some(r => r.error)
    if (hasError) {
      return { success: false, error: 'Failed to reorder some categories' }
    }
    return { success: true, error: null }
  } catch (_error) {
    return { success: false, error: 'Failed to reorder categories' }
  }
}
// ULTRA-FUNCTION: Assign services to category
export async function assignServicesToCategory(
  categoryId: string,
  serviceIds: string[]
): Promise<{ success: boolean; error: string | null; updated_count: number }> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_owner')
    if (roleError) {
      return { success: false, error: roleError, updated_count: 0 }
    }
    if (!hasPermission) {
      return { success: false, error: 'Insufficient permissions', updated_count: 0 }
    }
    const supabase = await createClient()
    // Verify category exists
    const { data: category } = await supabase
      .from('service_categories')
      .select('id')
      .eq('id', categoryId)
      .single()
    if (!category) {
      return { success: false, error: 'Category not found', updated_count: 0 }
    }
    // Update services
    const { error, count } = await supabase
      .from('services')
      .update({ 
        category_id: categoryId,
        updated_at: new Date().toISOString()
      })
      .in('id', serviceIds)
    if (error) {
      return { success: false, error: error.message, updated_count: 0 }
    }
    return { 
      success: true, 
      error: null,
      updated_count: count || 0
    }
  } catch (_error) {
    return { success: false, error: 'Failed to assign services', updated_count: 0 }
  }
}
// ULTRA-FUNCTION: Get uncategorized services
export async function getUncategorizedServices(): Promise<{
  data: Service[] | null
  error: string | null
}> {
  try {
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }
    const supabase = await createClient()
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .is('category_id', null)
      .eq('is_active', true)
      .order('name')
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: services || [], error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to fetch uncategorized services' }
  }
}