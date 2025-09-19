import type { Database } from "@/types/database.types";

// Campaign Types
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'paused';
export type CampaignType = 'email' | 'sms' | 'push' | 'multi-channel';
export type RecipientType = 'all' | 'segment' | 'custom';
export type ScheduleType = 'immediate' | 'scheduled' | 'recurring';

// Base Campaign Interface
export interface Campaign {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  subject?: string; // For email
  content: string;
  html_content?: string; // For email
  template_id?: string;
  scheduled_at?: string;
  sent_at?: string;
  created_by: string;
  metrics?: CampaignMetrics;
  created_at: string;
  updated_at: string;
}

// Campaign Creation/Update Data
export interface CampaignData {
  name: string;
  description?: string;
  type: CampaignType;
  subject?: string;
  content: string;
  html_content?: string;
  template_id?: string;
  audience: AudienceConfig;
  schedule: ScheduleConfig;
  settings: CampaignSettings;
}

// Audience Configuration
export interface AudienceConfig {
  type: RecipientType;
  filters?: AudienceFilters;
  segments?: string[];
  custom_list?: string[];
  exclusions?: string[];
  estimated_reach?: number;
}

export interface AudienceFilters {
  age_range?: { min?: number; max?: number };
  gender?: string[];
  location?: string[];
  last_visit?: { from?: string; to?: string };
  total_spent?: { min?: number; max?: number };
  visit_count?: { min?: number; max?: number };
  services?: string[];
  tags?: string[];
  loyalty_status?: string[];
  has_email?: boolean;
  has_phone?: boolean;
  email_opt_in?: boolean;
  sms_opt_in?: boolean;
}

// Schedule Configuration
export interface ScheduleConfig {
  type: ScheduleType;
  send_at?: string;
  timezone?: string;
  recurring?: RecurringSchedule;
  batch_size?: number;
  batch_delay?: number; // minutes between batches
}

export interface RecurringSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  days_of_week?: number[]; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  end_date?: string;
}

// Campaign Settings
export interface CampaignSettings {
  track_opens?: boolean;
  track_clicks?: boolean;
  unsubscribe_link?: boolean;
  reply_to?: string;
  from_name?: string;
  from_email?: string;
  test_mode?: boolean;
  test_recipients?: string[];
  ab_testing?: ABTestConfig;
}

// A/B Testing Configuration
export interface ABTestConfig {
  enabled: boolean;
  variants: CampaignVariant[];
  test_size: number; // percentage
  winning_metric: 'opens' | 'clicks' | 'conversions';
  test_duration: number; // hours
}

export interface CampaignVariant {
  id: string;
  name: string;
  subject?: string;
  content?: string;
  html_content?: string;
}

// Campaign Metrics
export interface CampaignMetrics {
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  complained: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  conversion_rate?: number;
  revenue?: number;
}

// Template Types
export interface CampaignTemplate {
  id: string;
  salon_id?: string; // null for system templates
  name: string;
  description?: string;
  type: CampaignType;
  category: string;
  subject?: string;
  content: string;
  html_content?: string;
  thumbnail_url?: string;
  variables: TemplateVariable[];
  is_active: boolean;
  is_system: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  default_value?: any;
  options?: string[];
  required?: boolean;
}

// Filter and Response Types
export interface CampaignsFilter {
  salon_id?: string;
  type?: CampaignType;
  status?: CampaignStatus;
  search?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'created_at' | 'scheduled_at' | 'sent_at' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CampaignsResponse {
  data: Campaign[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TemplatesFilter {
  salon_id?: string;
  type?: CampaignType;
  category?: string;
  is_system?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface TemplatesResponse {
  data: CampaignTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

// Audience Preview Types
export interface AudiencePreview {
  total_count: number;
  segments: AudienceSegment[];
  preview_customers: CustomerPreview[];
}

export interface AudienceSegment {
  name: string;
  count: number;
  percentage: number;
}

export interface CustomerPreview {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  last_visit?: string;
  total_spent?: number;
  visit_count?: number;
}

// Campaign Analytics Types
export interface CampaignAnalytics {
  campaign_id: string;
  metrics: CampaignMetrics;
  timeline: MetricTimeline[];
  engagement: EngagementData;
  conversions: ConversionData;
  devices: DeviceData[];
  locations: LocationData[];
}

export interface MetricTimeline {
  timestamp: string;
  opens: number;
  clicks: number;
  conversions: number;
}

export interface EngagementData {
  most_clicked_links: LinkClick[];
  peak_engagement_time: string;
  average_read_time: number;
}

export interface LinkClick {
  url: string;
  clicks: number;
  unique_clicks: number;
}

export interface ConversionData {
  total_conversions: number;
  conversion_value: number;
  top_converting_services: ServiceConversion[];
}

export interface ServiceConversion {
  service_id: string;
  service_name: string;
  conversions: number;
  revenue: number;
}

export interface DeviceData {
  device: string;
  opens: number;
  clicks: number;
  percentage: number;
}

export interface LocationData {
  location: string;
  opens: number;
  clicks: number;
  percentage: number;
}
