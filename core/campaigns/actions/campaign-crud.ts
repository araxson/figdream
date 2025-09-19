'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import {
  createCampaign as createCampaignDAL,
  updateCampaign as updateCampaignDAL,
  deleteCampaign as deleteCampaignDAL,
  duplicateCampaign as duplicateCampaignDAL
} from '../dal/campaigns-mutations'
import type {
  Campaign,
  CampaignInsert,
  CampaignUpdate
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
const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['email', 'sms', 'push']),
  subject: z.string().optional(),
  content: z.string().min(1),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed', 'paused']).optional(),
  audience: z.object({
    type: z.enum(['all', 'segment', 'custom']),
    filters: z.object({
      tags: z.array(z.string()).optional(),
      segments: z.array(z.string()).optional()
    }).optional(),
    include_ids: z.array(z.string()).optional(),
    exclude_ids: z.array(z.string()).optional()
  }).optional(),
  scheduled_at: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
})

const UpdateCampaignSchema = CreateCampaignSchema.partial()

// CREATE campaign
export async function createCampaign(
  data: FormData | CampaignInsert
): Promise<ActionResponse<Campaign>> {
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

  // 2. Get user context
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_salon_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.current_salon_id) {
    return {
      success: false,
      error: 'No salon context',
      code: 'NO_SALON_CONTEXT'
    }
  }

  // Check permissions
  if (!['admin', 'owner', 'manager'].includes(profile.role)) {
    return {
      success: false,
      error: 'SECURITY: Insufficient permissions',
      code: 'INSUFFICIENT_PERMISSIONS'
    }
  }

  try {
    // 3. Input Validation
    const rawData = data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data

    const validatedData = CreateCampaignSchema.parse(rawData)

    // 4. Create campaign
    const result = await createCampaignDAL({
      ...validatedData,
      salon_id: profile.current_salon_id,
      status: 'draft',
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    // 5. Cache Invalidation
    revalidatePath('/dashboard/campaigns')
    revalidatePath('/dashboard')
    revalidateTag(`campaigns-${profile.current_salon_id}`)

    return {
      success: true,
      data: result,
      message: 'Campaign created successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - createCampaign]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      salonId: profile?.current_salon_id,
      timestamp: new Date().toISOString()
    })

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors as Record<string, string[] | undefined>,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create campaign',
      code: 'CREATE_FAILED'
    }
  }
}

// UPDATE campaign
export async function updateCampaign(
  id: string,
  data: FormData | CampaignUpdate
): Promise<ActionResponse<Campaign>> {
  // 1. Authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  // 2. Get user context
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_salon_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.current_salon_id) {
    return {
      success: false,
      error: 'No salon context',
      code: 'NO_SALON_CONTEXT'
    }
  }

  // Check permissions
  if (!['admin', 'owner', 'manager'].includes(profile.role)) {
    return {
      success: false,
      error: 'SECURITY: Insufficient permissions',
      code: 'INSUFFICIENT_PERMISSIONS'
    }
  }

  try {
    // 3. Input Validation
    const rawData = data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data

    const validatedData = UpdateCampaignSchema.parse(rawData)

    // 4. Update campaign
    const result = await updateCampaignDAL(id, {
      ...validatedData,
      updated_at: new Date().toISOString()
    })

    // 5. Cache Invalidation
    revalidatePath('/dashboard/campaigns')
    revalidatePath(`/dashboard/campaigns/${id}`)
    revalidateTag(`campaign-${id}`)
    revalidateTag(`campaigns-${profile.current_salon_id}`)

    return {
      success: true,
      data: result,
      message: 'Campaign updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateCampaign]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update campaign',
      code: 'UPDATE_FAILED'
    }
  }
}

// DELETE campaign
export async function deleteCampaign(
  id: string
): Promise<ActionResponse<void>> {
  // 1. Authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  // 2. Get user context and verify ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_salon_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.current_salon_id) {
    return {
      success: false,
      error: 'No salon context',
      code: 'NO_SALON_CONTEXT'
    }
  }

  // Check permissions
  if (!['admin', 'owner', 'manager'].includes(profile.role)) {
    return {
      success: false,
      error: 'SECURITY: Insufficient permissions',
      code: 'INSUFFICIENT_PERMISSIONS'
    }
  }

  try {
    // 3. Delete campaign
    await deleteCampaignDAL(id)

    // 4. Cache Invalidation
    revalidatePath('/dashboard/campaigns')
    revalidateTag(`campaigns-${profile.current_salon_id}`)

    return {
      success: true,
      message: 'Campaign deleted successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - deleteCampaign]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete campaign',
      code: 'DELETE_FAILED'
    }
  }
}

// DUPLICATE campaign
export async function duplicateCampaign(
  id: string
): Promise<ActionResponse<Campaign>> {
  // 1. Authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  // 2. Get user context
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_salon_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.current_salon_id) {
    return {
      success: false,
      error: 'No salon context',
      code: 'NO_SALON_CONTEXT'
    }
  }

  // Check permissions
  if (!['admin', 'owner', 'manager'].includes(profile.role)) {
    return {
      success: false,
      error: 'SECURITY: Insufficient permissions',
      code: 'INSUFFICIENT_PERMISSIONS'
    }
  }

  try {
    // 3. Duplicate campaign
    const result = await duplicateCampaignDAL(id, user.id)

    // 4. Cache Invalidation
    revalidatePath('/dashboard/campaigns')
    revalidateTag(`campaigns-${profile.current_salon_id}`)

    return {
      success: true,
      data: result,
      message: 'Campaign duplicated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - duplicateCampaign]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate campaign',
      code: 'DUPLICATE_FAILED'
    }
  }
}