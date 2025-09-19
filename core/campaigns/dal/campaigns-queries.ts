import { createClient } from "@/lib/supabase/server";
import type {
  Campaign,
  CampaignsFilter,
  CampaignsResponse,
  CampaignTemplate,
  TemplatesFilter,
  TemplatesResponse,
  AudiencePreview,
  CampaignAnalytics,
  AudienceConfig,
  CustomerPreview,
} from "./campaigns-types";

/**
 * Get campaigns with pagination and filtering
 */
export async function getCampaigns(
  filter: CampaignsFilter = {}
): Promise<CampaignsResponse> {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get user's salon context
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_salon_id")
    .eq("id", user.id)
    .single();

  if (!profile?.current_salon_id) {
    throw new Error("No salon context");
  }

  const page = filter.page || 1;
  const pageSize = filter.pageSize || 20;
  const offset = (page - 1) * pageSize;

  // For now, return mock data since campaign tables don't exist yet
  // This will be replaced with actual database queries when tables are created
  const mockCampaigns: Campaign[] = [
    {
      id: "1",
      salon_id: profile.current_salon_id,
      name: "Summer Sale - 20% Off All Services",
      description: "Promote summer services with special discount",
      type: "email",
      status: "sent",
      subject: "☀️ Summer Sale - Save 20% on All Services!",
      content: "Get ready for summer with our exclusive offer...",
      html_content: "<h1>Summer Sale</h1><p>Get ready for summer...</p>",
      scheduled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: user.id,
      metrics: {
        recipients: 1250,
        sent: 1250,
        delivered: 1235,
        opened: 567,
        clicked: 234,
        bounced: 15,
        unsubscribed: 3,
        complained: 0,
        open_rate: 45.9,
        click_rate: 18.9,
        bounce_rate: 1.2,
        conversion_rate: 12.5,
        revenue: 4500,
      },
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      salon_id: profile.current_salon_id,
      name: "New Client Welcome Series",
      description: "Automated welcome email for new clients",
      type: "email",
      status: "scheduled",
      subject: "Welcome to {{salon_name}}!",
      content: "We're thrilled to have you as our newest client...",
      scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      created_by: user.id,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      salon_id: profile.current_salon_id,
      name: "Appointment Reminder SMS",
      type: "sms",
      status: "draft",
      content: "Hi {{customer_name}}, this is a reminder about your appointment at {{salon_name}} on {{appointment_date}} at {{appointment_time}}. Reply CONFIRM to confirm or CANCEL to cancel.",
      created_by: user.id,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Apply filters
  let filteredCampaigns = [...mockCampaigns];

  if (filter.type) {
    filteredCampaigns = filteredCampaigns.filter(c => c.type === filter.type);
  }

  if (filter.status) {
    filteredCampaigns = filteredCampaigns.filter(c => c.status === filter.status);
  }

  if (filter.search) {
    const search = filter.search.toLowerCase();
    filteredCampaigns = filteredCampaigns.filter(
      c =>
        c.name.toLowerCase().includes(search) ||
        c.description?.toLowerCase().includes(search) ||
        c.subject?.toLowerCase().includes(search)
    );
  }

  // Apply sorting
  const sortBy = filter.sortBy || "created_at";
  const sortOrder = filter.sortOrder || "desc";

  filteredCampaigns.sort((a, b) => {
    const aVal: any = a[sortBy as keyof Campaign];
    const bVal: any = b[sortBy as keyof Campaign];

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Apply pagination
  const paginatedCampaigns = filteredCampaigns.slice(offset, offset + pageSize);

  return {
    data: paginatedCampaigns,
    total: filteredCampaigns.length,
    page,
    pageSize,
  };
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get user's salon context
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_salon_id")
    .eq("id", user.id)
    .single();

  if (!profile?.current_salon_id) {
    throw new Error("No salon context");
  }

  // Mock implementation
  const campaigns = await getCampaigns({ salon_id: profile.current_salon_id });
  return campaigns.data.find(c => c.id === id) || null;
}

/**
 * Get campaign templates
 */
export async function getCampaignTemplates(
  filter: TemplatesFilter = {}
): Promise<TemplatesResponse> {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const page = filter.page || 1;
  const pageSize = filter.pageSize || 20;

  // Mock templates
  const mockTemplates: CampaignTemplate[] = [
    {
      id: "t1",
      name: "Welcome Email",
      description: "Welcome new customers to your salon",
      type: "email",
      category: "Welcome",
      subject: "Welcome to {{salon_name}}!",
      content: "Dear {{customer_name}},\n\nWelcome to {{salon_name}}! We're excited to have you as our newest client.",
      html_content: "<h1>Welcome!</h1><p>Dear {{customer_name}},</p><p>Welcome to {{salon_name}}!</p>",
      variables: [
        { key: "customer_name", label: "Customer Name", type: "text", required: true },
        { key: "salon_name", label: "Salon Name", type: "text", required: true },
      ],
      is_active: true,
      is_system: true,
      usage_count: 145,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "t2",
      name: "Appointment Reminder",
      description: "Remind customers about upcoming appointments",
      type: "sms",
      category: "Reminders",
      content: "Hi {{customer_name}}, reminder: You have an appointment at {{salon_name}} on {{date}} at {{time}}. Reply Y to confirm.",
      variables: [
        { key: "customer_name", label: "Customer Name", type: "text", required: true },
        { key: "salon_name", label: "Salon Name", type: "text", required: true },
        { key: "date", label: "Appointment Date", type: "date", required: true },
        { key: "time", label: "Appointment Time", type: "text", required: true },
      ],
      is_active: true,
      is_system: true,
      usage_count: 523,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "t3",
      name: "Birthday Discount",
      description: "Send birthday wishes with a special discount",
      type: "email",
      category: "Promotions",
      subject: "🎉 Happy Birthday from {{salon_name}}!",
      content: "Happy Birthday {{customer_name}}! Enjoy {{discount}}% off your next visit.",
      html_content: "<h1>🎉 Happy Birthday!</h1><p>Dear {{customer_name}},</p><p>Enjoy {{discount}}% off!</p>",
      variables: [
        { key: "customer_name", label: "Customer Name", type: "text", required: true },
        { key: "salon_name", label: "Salon Name", type: "text", required: true },
        { key: "discount", label: "Discount %", type: "number", default_value: 20 },
      ],
      is_active: true,
      is_system: true,
      usage_count: 89,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Apply filters
  let filteredTemplates = [...mockTemplates];

  if (filter.type) {
    filteredTemplates = filteredTemplates.filter(t => t.type === filter.type);
  }

  if (filter.category) {
    filteredTemplates = filteredTemplates.filter(t => t.category === filter.category);
  }

  if (filter.search) {
    const search = filter.search.toLowerCase();
    filteredTemplates = filteredTemplates.filter(
      t =>
        t.name.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
    );
  }

  const offset = (page - 1) * pageSize;
  const paginatedTemplates = filteredTemplates.slice(offset, offset + pageSize);

  return {
    data: paginatedTemplates,
    total: filteredTemplates.length,
    page,
    pageSize,
  };
}

/**
 * Get audience preview based on filters
 */
export async function getAudiencePreview(
  audienceConfig: AudienceConfig
): Promise<AudiencePreview> {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get user's salon context
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_salon_id")
    .eq("id", user.id)
    .single();

  if (!profile?.current_salon_id) {
    throw new Error("No salon context");
  }

  // Mock audience preview
  const mockCustomers: CustomerPreview[] = [
    {
      id: "c1",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567890",
      last_visit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      total_spent: 450,
      visit_count: 12,
    },
    {
      id: "c2",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567891",
      last_visit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      total_spent: 320,
      visit_count: 8,
    },
    {
      id: "c3",
      name: "Emily Johnson",
      email: "emily@example.com",
      last_visit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      total_spent: 680,
      visit_count: 15,
    },
  ];

  // Apply audience filters
  let filteredCustomers = [...mockCustomers];

  if (audienceConfig.filters?.has_email === true) {
    filteredCustomers = filteredCustomers.filter(c => c.email);
  }

  if (audienceConfig.filters?.has_phone === true) {
    filteredCustomers = filteredCustomers.filter(c => c.phone);
  }

  if (audienceConfig.filters?.visit_count?.min) {
    filteredCustomers = filteredCustomers.filter(
      c => (c.visit_count || 0) >= audienceConfig.filters!.visit_count!.min!
    );
  }

  if (audienceConfig.filters?.total_spent?.min) {
    filteredCustomers = filteredCustomers.filter(
      c => (c.total_spent || 0) >= audienceConfig.filters!.total_spent!.min!
    );
  }

  return {
    total_count: filteredCustomers.length,
    segments: [
      { name: "Active Customers", count: 234, percentage: 45 },
      { name: "VIP Customers", count: 56, percentage: 11 },
      { name: "New Customers", count: 89, percentage: 17 },
      { name: "Dormant Customers", count: 141, percentage: 27 },
    ],
    preview_customers: filteredCustomers.slice(0, 5),
  };
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(
  campaignId: string
): Promise<CampaignAnalytics | null> {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const campaign = await getCampaignById(campaignId);
  if (!campaign) return null;

  // Mock analytics data
  return {
    campaign_id: campaignId,
    metrics: campaign.metrics || {
      recipients: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      complained: 0,
      open_rate: 0,
      click_rate: 0,
      bounce_rate: 0,
    },
    timeline: [
      {
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        opens: 45,
        clicks: 12,
        conversions: 3,
      },
      {
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        opens: 89,
        clicks: 34,
        conversions: 8,
      },
      {
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        opens: 156,
        clicks: 67,
        conversions: 15,
      },
      {
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        opens: 234,
        clicks: 98,
        conversions: 23,
      },
    ],
    engagement: {
      most_clicked_links: [
        { url: "https://example.com/book", clicks: 145, unique_clicks: 98 },
        { url: "https://example.com/services", clicks: 89, unique_clicks: 67 },
      ],
      peak_engagement_time: "10:00 AM",
      average_read_time: 25,
    },
    conversions: {
      total_conversions: 45,
      conversion_value: 4500,
      top_converting_services: [
        { service_id: "s1", service_name: "Hair Color", conversions: 15, revenue: 1500 },
        { service_id: "s2", service_name: "Haircut", conversions: 20, revenue: 2000 },
      ],
    },
    devices: [
      { device: "Mobile", opens: 456, clicks: 189, percentage: 65 },
      { device: "Desktop", opens: 234, clicks: 98, percentage: 30 },
      { device: "Tablet", opens: 35, clicks: 12, percentage: 5 },
    ],
    locations: [
      { location: "New York", opens: 234, clicks: 89, percentage: 35 },
      { location: "Los Angeles", opens: 156, clicks: 67, percentage: 25 },
      { location: "Chicago", opens: 98, clicks: 34, percentage: 15 },
    ],
  };
}

/**
 * Get campaign stats for dashboard
 */
export async function getCampaignStats() {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get user's salon context
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_salon_id")
    .eq("id", user.id)
    .single();

  if (!profile?.current_salon_id) {
    throw new Error("No salon context");
  }

  // Mock stats
  return {
    total_campaigns: 24,
    active_campaigns: 3,
    total_sent: 15678,
    average_open_rate: 42.5,
    average_click_rate: 18.3,
    total_revenue_generated: 45000,
  };
}
