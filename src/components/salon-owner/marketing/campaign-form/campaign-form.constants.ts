import { 
  Mail,
  MessageSquare,
  Users
} from 'lucide-react'
import type { CampaignTypeInfo } from './campaign-form.types'

export const campaignTypeInfo: Record<string, CampaignTypeInfo> = {
  email: {
    icon: Mail,
    label: 'Email Campaign',
    description: 'Send rich HTML emails to your customers',
    maxContentLength: 10000,
  },
  sms: {
    icon: MessageSquare,
    label: 'SMS Campaign',
    description: 'Send text messages directly to customer phones',
    maxContentLength: 1600,
  },
  push: {
    icon: Users,
    label: 'Push Notification',
    description: 'Send push notifications to mobile app users',
    maxContentLength: 160,
  },
  in_app: {
    icon: Users,
    label: 'In-App Message',
    description: 'Display messages within your mobile app',
    maxContentLength: 500,
  },
}