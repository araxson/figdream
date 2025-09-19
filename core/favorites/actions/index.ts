'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import {
  createFavorite as createFavoriteDAL,
  updateFavorite as updateFavoriteDAL,
  deleteFavorite as deleteFavoriteDAL,
  toggleFavorite as toggleFavoriteDAL
} from '../dal/favorites-mutations'
import {
  getFavorites as getFavoritesDAL,
  getFavoriteById as getFavoriteByIdDAL,
  checkIsFavorite as checkIsFavoriteDAL
} from '../dal/favorites-queries'
import type {
  Favorite,
  FavoriteInsert,
  FavoriteUpdate,
  FavoritesFilter,
  FavoritesResponse
} from '../types'

// Response types
interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

// Validation schemas
const CreateFavoriteSchema = z.object({
  salon_id: z.string().uuid().optional(),
  staff_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.salon_id || data.staff_id || data.service_id,
  { message: 'At least one of salon, staff, or service must be selected' }
)

const UpdateFavoriteSchema = z.object({
  notes: z.string().optional(),
})

const ToggleFavoriteSchema = z.object({
  salon_id: z.string().uuid().optional(),
  staff_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.salon_id || data.staff_id || data.service_id,
  { message: 'At least one of salon, staff, or service must be selected' }
)

// CREATE Actions
export async function createFavorite(
  data: FormData | FavoriteInsert
): Promise<ActionResponse<Favorite>> {
  // 1. MANDATORY: Enterprise Authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    // 2. Input Validation & Extraction
    const rawData = data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data

    const validatedData = CreateFavoriteSchema.parse(rawData)

    // 3. Check for duplicate favorite
    const isDuplicate = await checkIsFavoriteDAL({
      customerId: user.id,
      salonId: validatedData.salon_id,
      staffId: validatedData.staff_id,
      serviceId: validatedData.service_id,
    })

    if (isDuplicate) {
      return {
        success: false,
        error: 'This item is already in your favorites',
        code: 'DUPLICATE_FAVORITE'
      }
    }

    // 4. Create favorite with user context
    const result = await createFavoriteDAL({
      ...validatedData,
      customer_id: user.id,
      created_at: new Date().toISOString()
    })

    // 5. Intelligent Cache Invalidation
    revalidatePath('/customer/favorites')
    revalidatePath('/customer/profile')
    revalidateTag(`favorites-${user.id}`)
    if (validatedData.salon_id) {
      revalidateTag(`salon-favorites-${validatedData.salon_id}`)
    }

    // 6. Success Response
    return {
      success: true,
      data: result,
      message: 'Added to favorites successfully'
    }

  } catch (error) {
    // 7. Comprehensive Error Handling
    console.error('[Server Action Error - createFavorite]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to add to favorites',
      code: 'OPERATION_FAILED'
    }
  }
}

// UPDATE Actions
export async function updateFavorite(
  id: string,
  data: FormData | FavoriteUpdate
): Promise<ActionResponse<Favorite>> {
  // 1. MANDATORY: Enterprise Authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    // 2. Verify ownership
    const existing = await getFavoriteByIdDAL(id)
    if (!existing) {
      return {
        success: false,
        error: 'Favorite not found',
        code: 'NOT_FOUND'
      }
    }

    if (existing.customer_id !== user.id) {
      return {
        success: false,
        error: 'SECURITY: Unauthorized access',
        code: 'UNAUTHORIZED'
      }
    }

    // 3. Input Validation
    const rawData = data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data

    const validatedData = UpdateFavoriteSchema.parse(rawData)

    // 4. Update favorite
    const result = await updateFavoriteDAL(id, validatedData)

    // 5. Cache Invalidation
    revalidatePath('/customer/favorites')
    revalidateTag(`favorites-${user.id}`)

    return {
      success: true,
      data: result,
      message: 'Favorite updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateFavorite]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      favoriteId: id,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to update favorite',
      code: 'OPERATION_FAILED'
    }
  }
}

// DELETE Actions
export async function deleteFavorite(
  id: string
): Promise<ActionResponse<void>> {
  // 1. MANDATORY: Enterprise Authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    // 2. Verify ownership
    const existing = await getFavoriteByIdDAL(id)
    if (!existing) {
      return {
        success: false,
        error: 'Favorite not found',
        code: 'NOT_FOUND'
      }
    }

    if (existing.customer_id !== user.id) {
      return {
        success: false,
        error: 'SECURITY: Unauthorized access',
        code: 'UNAUTHORIZED'
      }
    }

    // 3. Delete favorite
    await deleteFavoriteDAL(id)

    // 4. Cache Invalidation
    revalidatePath('/customer/favorites')
    revalidateTag(`favorites-${user.id}`)
    if (existing.salon_id) {
      revalidateTag(`salon-favorites-${existing.salon_id}`)
    }

    return {
      success: true,
      message: 'Removed from favorites'
    }

  } catch (error) {
    console.error('[Server Action Error - deleteFavorite]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      favoriteId: id,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to remove from favorites',
      code: 'OPERATION_FAILED'
    }
  }
}

// TOGGLE Actions
export async function toggleFavorite(
  data: FormData | { salon_id?: string; staff_id?: string; service_id?: string; notes?: string }
): Promise<ActionResponse<{ added: boolean; favorite?: Favorite }>> {
  // 1. MANDATORY: Enterprise Authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    // 2. Input Validation
    const rawData = data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data

    const validatedData = ToggleFavoriteSchema.parse(rawData)

    // 3. Toggle favorite
    const result = await toggleFavoriteDAL({
      customerId: user.id,
      salonId: validatedData.salon_id,
      staffId: validatedData.staff_id,
      serviceId: validatedData.service_id,
      notes: validatedData.notes,
    })

    // 4. Cache Invalidation
    revalidatePath('/customer/favorites')
    revalidatePath('/customer/profile')
    revalidateTag(`favorites-${user.id}`)
    if (validatedData.salon_id) {
      revalidateTag(`salon-favorites-${validatedData.salon_id}`)
    }

    return {
      success: true,
      data: result,
      message: result.added ? 'Added to favorites' : 'Removed from favorites'
    }

  } catch (error) {
    console.error('[Server Action Error - toggleFavorite]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to update favorites',
      code: 'OPERATION_FAILED'
    }
  }
}

// READ Actions
export async function getFavorites(
  filter?: FavoritesFilter
): Promise<ActionResponse<FavoritesResponse>> {
  // 1. MANDATORY: Enterprise Authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    // 2. Get favorites with user filter
    const result = await getFavoritesDAL({
      ...filter,
      customerId: user.id // Ensure user only sees their own favorites
    })

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('[Server Action Error - getFavorites]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to fetch favorites',
      code: 'OPERATION_FAILED'
    }
  }
}

// BULK Actions
export async function bulkDeleteFavorites(
  ids: string[]
): Promise<ActionResponse<{ deleted: number }>> {
  // 1. MANDATORY: Enterprise Authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    // 2. Validate ownership for all items
    let deleted = 0
    const errors: string[] = []

    for (const id of ids) {
      try {
        const existing = await getFavoriteByIdDAL(id)

        if (!existing) {
          errors.push(`Favorite ${id} not found`)
          continue
        }

        if (existing.customer_id !== user.id) {
          errors.push(`Unauthorized access to favorite ${id}`)
          continue
        }

        await deleteFavoriteDAL(id)
        deleted++
      } catch (err) {
        errors.push(`Failed to delete favorite ${id}`)
      }
    }

    // 3. Cache Invalidation
    revalidatePath('/customer/favorites')
    revalidateTag(`favorites-${user.id}`)

    if (errors.length > 0) {
      return {
        success: false,
        data: { deleted },
        error: `Partially completed: ${errors.join(', ')}`,
        code: 'PARTIAL_SUCCESS'
      }
    }

    return {
      success: true,
      data: { deleted },
      message: `${deleted} favorites removed`
    }

  } catch (error) {
    console.error('[Server Action Error - bulkDeleteFavorites]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      idsCount: ids.length,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to delete favorites',
      code: 'OPERATION_FAILED'
    }
  }
}

// CHECK Actions
export async function checkFavorite(
  params: { salon_id?: string; staff_id?: string; service_id?: string }
): Promise<ActionResponse<boolean>> {
  // 1. MANDATORY: Enterprise Authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const isFavorite = await checkIsFavoriteDAL({
      customerId: user.id,
      salonId: params.salon_id,
      staffId: params.staff_id,
      serviceId: params.service_id,
    })

    return {
      success: true,
      data: isFavorite
    }

  } catch (error) {
    console.error('[Server Action Error - checkFavorite]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      params,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to check favorite status',
      code: 'OPERATION_FAILED'
    }
  }
}