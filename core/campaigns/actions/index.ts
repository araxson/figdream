// Campaign CRUD operations
export {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign
} from './campaign-crud'

// Campaign operations
export {
  sendCampaign,
  scheduleCampaign,
  pauseCampaign,
  testCampaign
} from './campaign-operations'

// Campaign queries
export {
  getCampaigns,
  getCampaignTemplates,
  getAudiencePreview,
  getCampaignAnalytics,
  getCampaignStats
} from './campaign-queries'

// Re-export types for convenience
export type {
  Campaign,
  CampaignInsert,
  CampaignUpdate,
  CampaignsFilter,
  CampaignsResponse,
  CampaignTemplate,
  TemplatesFilter,
  TemplatesResponse,
  AudienceConfig,
  AudiencePreview,
  CampaignAnalytics,
  CampaignStats
} from '../types'