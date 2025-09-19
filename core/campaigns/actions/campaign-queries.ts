'use server'

import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import {
  getCampaigns as getCampaignsDAL,
  getCampaignById as getCampaignByIdDAL,
  getCampaignTemplates as getCampaignTemplatesDAL,
  getAudiencePreview as getAudiencePreviewDAL,
  getCampaignAnalytics as getCampaignAnalyticsDAL,
  getCampaignStats as getCampaignStatsDAL
} from '../dal/campaigns-queries'
import type {
  CampaignsFilter,
  CampaignsResponse,
  TemplatesFilter,
  TemplatesResponse,
  AudienceConfig,
  AudiencePreview,
  CampaignAnalytics,
  CampaignStats
} from '../types'

// Response types
interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  message?: string
}

// GET campaigns
export async function getCampaigns(
  filter?: CampaignsFilter
): Promise<ActionResponse<CampaignsResponse>> {
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

  try {
    // 3. Fetch campaigns with caching
    const getCampaignsCached = unstable_cache(
      async () => getCampaignsDAL(profile.current_salon_id, filter),
      [`campaigns-${profile.current_salon_id}`],
      {
        revalidate: 60, // Cache for 1 minute
        tags: [`campaigns-${profile.current_salon_id}`]
      }
    )

    const result = await getCampaignsCached()

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('[Server Action Error - getCampaigns]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch campaigns',
      code: 'FETCH_FAILED'
    }
  }
}

// GET campaign templates
export async function getCampaignTemplates(
  filter?: TemplatesFilter
): Promise<ActionResponse<TemplatesResponse>> {
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

  try {
    // 2. Fetch templates with caching
    const getTemplatesCached = unstable_cache(
      async () => getCampaignTemplatesDAL(filter),
      ['campaign-templates'],
      {
        revalidate: 3600, // Cache for 1 hour
        tags: ['campaign-templates']
      }
    )

    const result = await getTemplatesCached()

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('[Server Action Error - getCampaignTemplates]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch templates',
      code: 'FETCH_FAILED'
    }
  }
}

// GET audience preview
export async function getAudiencePreview(
  config: AudienceConfig
): Promise<ActionResponse<AudiencePreview>> {
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

  try {
    // 3. Get audience preview
    const result = await getAudiencePreviewDAL(profile.current_salon_id, config)

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('[Server Action Error - getAudiencePreview]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get audience preview',
      code: 'PREVIEW_FAILED'
    }
  }
}

// GET campaign analytics
export async function getCampaignAnalytics(
  id: string
): Promise<ActionResponse<CampaignAnalytics>> {
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

  try {
    // 3. Get analytics with caching
    const getAnalyticsCached = unstable_cache(
      async () => getCampaignAnalyticsDAL(id),
      [`campaign-analytics-${id}`],
      {
        revalidate: 300, // Cache for 5 minutes
        tags: [`campaign-${id}`]
      }
    )

    const result = await getAnalyticsCached()

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('[Server Action Error - getCampaignAnalytics]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get analytics',
      code: 'ANALYTICS_FAILED'
    }
  }
}

// GET campaign stats
export async function getCampaignStats(): Promise<ActionResponse<CampaignStats>> {
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

  try {
    // 3. Get stats with caching
    const getStatsCached = unstable_cache(
      async () => getCampaignStatsDAL(profile.current_salon_id),
      [`campaign-stats-${profile.current_salon_id}`],
      {
        revalidate: 600, // Cache for 10 minutes
        tags: [`campaigns-${profile.current_salon_id}`]
      }
    )

    const result = await getStatsCached()

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('[Server Action Error - getCampaignStats]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats',
      code: 'STATS_FAILED'
    }
  }
}