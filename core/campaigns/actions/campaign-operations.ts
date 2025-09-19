'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import {
  sendCampaign as sendCampaignDAL,
  scheduleCampaign as scheduleCampaignDAL,
  pauseCampaign as pauseCampaignDAL,
  testCampaign as testCampaignDAL
} from '../dal/campaigns-mutations'
import type { Campaign } from '../types'

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
const ScheduleCampaignSchema = z.object({
  scheduled_at: z.string().datetime()
})

const TestCampaignSchema = z.object({
  test_emails: z.array(z.string().email()).optional(),
  test_phones: z.array(z.string()).optional()
})

// SEND campaign
export async function sendCampaign(
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
    // 3. Verify campaign exists and is ready
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('salon_id', profile.current_salon_id)
      .single()

    if (!campaign) {
      return {
        success: false,
        error: 'Campaign not found',
        code: 'NOT_FOUND'
      }
    }

    if (campaign.status === 'sent') {
      return {
        success: false,
        error: 'Campaign already sent',
        code: 'ALREADY_SENT'
      }
    }

    if (campaign.status === 'sending') {
      return {
        success: false,
        error: 'Campaign is already being sent',
        code: 'IN_PROGRESS'
      }
    }

    // 4. Send campaign
    const result = await sendCampaignDAL(id)

    // 5. Cache Invalidation
    revalidatePath('/dashboard/campaigns')
    revalidatePath(`/dashboard/campaigns/${id}`)
    revalidateTag(`campaign-${id}`)
    revalidateTag(`campaigns-${profile.current_salon_id}`)

    return {
      success: true,
      data: result,
      message: 'Campaign sent successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - sendCampaign]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send campaign',
      code: 'SEND_FAILED'
    }
  }
}

// SCHEDULE campaign
export async function scheduleCampaign(
  id: string,
  data: FormData | { scheduled_at: string }
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

    const validatedData = ScheduleCampaignSchema.parse(rawData)

    // 4. Schedule campaign
    const result = await scheduleCampaignDAL(id, validatedData.scheduled_at)

    // 5. Cache Invalidation
    revalidatePath('/dashboard/campaigns')
    revalidatePath(`/dashboard/campaigns/${id}`)
    revalidateTag(`campaign-${id}`)
    revalidateTag(`campaigns-${profile.current_salon_id}`)

    return {
      success: true,
      data: result,
      message: 'Campaign scheduled successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - scheduleCampaign]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid schedule time',
        fieldErrors: error.flatten().fieldErrors as Record<string, string[] | undefined>,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to schedule campaign',
      code: 'SCHEDULE_FAILED'
    }
  }
}

// PAUSE campaign
export async function pauseCampaign(
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
    // 3. Pause campaign
    const result = await pauseCampaignDAL(id)

    // 4. Cache Invalidation
    revalidatePath('/dashboard/campaigns')
    revalidatePath(`/dashboard/campaigns/${id}`)
    revalidateTag(`campaign-${id}`)
    revalidateTag(`campaigns-${profile.current_salon_id}`)

    return {
      success: true,
      data: result,
      message: 'Campaign paused successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - pauseCampaign]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pause campaign',
      code: 'PAUSE_FAILED'
    }
  }
}

// TEST campaign
export async function testCampaign(
  id: string,
  data: FormData | { test_emails?: string[], test_phones?: string[] }
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

  // 2. Get user context
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_salon_id, role, email')
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

    const validatedData = TestCampaignSchema.parse(rawData)

    // Default to user's email if no test emails provided
    const testEmails = validatedData.test_emails || [profile.email]

    // 4. Send test
    await testCampaignDAL(id, {
      test_emails: testEmails,
      test_phones: validatedData.test_phones
    })

    return {
      success: true,
      message: `Test sent to ${testEmails.length} recipient(s)`
    }

  } catch (error) {
    console.error('[Server Action Error - testCampaign]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid test recipients',
        fieldErrors: error.flatten().fieldErrors as Record<string, string[] | undefined>,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test',
      code: 'TEST_FAILED'
    }
  }
}