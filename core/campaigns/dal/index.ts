// Query exports
export {
  getCampaigns,
  getCampaignById,
  getCampaignTemplates,
  getAudiencePreview,
  getCampaignAnalytics,
  getCampaignStats,
} from "./campaigns-queries";

// Mutation exports
export {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  updateCampaignStatus,
  sendCampaign,
  sendTestCampaign,
  duplicateCampaign,
  saveCampaignTemplate,
  deleteCampaignTemplate,
} from "./campaigns-mutations";

// Type exports
export type {
  Campaign,
  CampaignData,
  CampaignStatus,
  CampaignType,
  CampaignTemplate,
  CampaignsFilter,
  CampaignsResponse,
  TemplatesFilter,
  TemplatesResponse,
  AudienceConfig,
  AudienceFilters,
  AudiencePreview,
  ScheduleConfig,
  CampaignSettings,
  CampaignMetrics,
  CampaignAnalytics,
  ABTestConfig,
  CampaignVariant,
} from "./campaigns-types";