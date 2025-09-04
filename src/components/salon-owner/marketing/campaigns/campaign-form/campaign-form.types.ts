import type { Database } from '@/types/database.types'
import type { 
  CreateCampaignInput,
  UpdateCampaignInput 
} from '@/lib/validations/marketing-schema'

export type Campaign = Database['public']['Tables']['marketing_campaigns']['Row']
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type SmsTemplate = Database['public']['Tables']['sms_templates']['Row']

// Note: customer_segments table does not exist in database
// Using a temporary type definition until table is implemented
export interface Segment {
  id: string
  salon_id: string
  name: string
  description?: string
  conditions: Record<string, unknown>
  member_count?: number
  created_at: string
  updated_at: string
}

export interface CampaignFormProps {
  campaign?: Campaign
  emailTemplates: EmailTemplate[]
  smsTemplates: SmsTemplate[]
  segments: Segment[]
  salonId: string
  locationIds?: string[]
  onSubmit: (data: CreateCampaignInput | UpdateCampaignInput) => Promise<void>
  onCancel?: () => void
  onPreview?: (data: CreateCampaignInput | UpdateCampaignInput) => void
  className?: string
  isSubmitting?: boolean
}

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

export interface CampaignTypeInfo {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  maxContentLength: number
}