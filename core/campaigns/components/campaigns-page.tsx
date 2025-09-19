"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Mail,
  BarChart,
  FileText,
  Send,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Import components
import { CampaignsList } from "./campaigns-list";
import { CampaignBuilder } from "./campaign-builder";
import { CampaignAnalyticsView } from "./campaign-analytics";
import { TemplateSelector } from "./template-selector";

// Import actions and DAL
import {
  getCampaigns,
  getCampaignAnalytics,
  getCampaignStats,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,
  sendCampaign,
} from "../actions";
import type { Campaign, CampaignData, CampaignAnalytics } from "../dal/campaigns-types";

export function CampaignsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("campaigns");

  // Dialog states
  const [showBuilder, setShowBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Selected items
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedAnalytics, setSelectedAnalytics] = useState<CampaignAnalytics | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Load campaigns and stats
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load campaigns
      const campaignsResult = await getCampaigns();
      if (campaignsResult.success && campaignsResult.data) {
        setCampaigns(campaignsResult.data.data);
      } else {
        toast.error(campaignsResult.error || "Failed to load campaigns");
      }

      // Load stats
      const statsResult = await getCampaignStats();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setShowBuilder(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowBuilder(true);
  };

  const handleSaveCampaign = async (data: CampaignData) => {
    try {
      if (editingCampaign) {
        const result = await updateCampaign(editingCampaign.id, data);
        if (result.success) {
          toast.success("Campaign updated successfully");
          setShowBuilder(false);
          loadData();
        } else {
          toast.error(result.error || "Failed to update campaign");
        }
      } else {
        const result = await createCampaign(data);
        if (result.success) {
          toast.success("Campaign created successfully");
          setShowBuilder(false);
          loadData();
        } else {
          toast.error(result.error || "Failed to create campaign");
        }
      }
    } catch (error) {
      console.error("Failed to save campaign:", error);
      toast.error("Failed to save campaign");
    }
  };

  const handleSendCampaign = async (campaign: Campaign | CampaignData) => {
    try {
      // If it's a new campaign (CampaignData), create it first
      if (!('id' in campaign)) {
        const createResult = await createCampaign(campaign);
        if (!createResult.success || !createResult.data) {
          toast.error(createResult.error || "Failed to create campaign");
          return;
        }
        campaign = createResult.data;
      }

      // Now send the campaign
      const result = await sendCampaign(campaign.id);
      if (result.success) {
        toast.success("Campaign sent successfully!");
        setShowBuilder(false);
        loadData();
      } else {
        toast.error(result.error || "Failed to send campaign");
      }
    } catch (error) {
      console.error("Failed to send campaign:", error);
      toast.error("Failed to send campaign");
    }
  };

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    try {
      const result = await duplicateCampaign(campaign.id);
      if (result.success) {
        toast.success("Campaign duplicated successfully");
        loadData();
      } else {
        toast.error(result.error || "Failed to duplicate campaign");
      }
    } catch (error) {
      console.error("Failed to duplicate campaign:", error);
      toast.error("Failed to duplicate campaign");
    }
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const result = await deleteCampaign(campaign.id);
      if (result.success) {
        toast.success("Campaign deleted successfully");
        loadData();
      } else {
        toast.error(result.error || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error("Failed to delete campaign");
    }
  };

  const handleViewAnalytics = async (campaign: Campaign) => {
    try {
      const result = await getCampaignAnalytics(campaign.id);
      if (result.success && result.data) {
        setSelectedCampaign(campaign);
        setSelectedAnalytics(result.data);
        setShowAnalytics(true);
      } else {
        toast.error(result.error || "Failed to load analytics");
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics");
    }
  };

  const handleTemplateSelect = (template: any) => {
    setShowTemplates(false);
    setEditingCampaign(null);
    setShowBuilder(true);
    // The campaign builder will use the template data
  };

  if (isLoading) {
    return <CampaignsPageSkeleton />;
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your marketing campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button onClick={handleCreateCampaign}>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Campaigns
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_campaigns || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Campaigns
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_campaigns || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sent
                </CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_sent?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Messages delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Open Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.average_open_rate?.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all campaigns
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="campaigns">
            <Mail className="mr-2 h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Clock className="mr-2 h-4 w-4" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignsList
            campaigns={campaigns.filter(c => c.status !== "scheduled")}
            onEdit={handleEditCampaign}
            onDuplicate={handleDuplicateCampaign}
            onDelete={handleDeleteCampaign}
            onViewAnalytics={handleViewAnalytics}
            onSend={(campaign) => handleSendCampaign(campaign)}
            onCreateNew={handleCreateCampaign}
          />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <CampaignsList
            campaigns={campaigns.filter(c => c.status === "scheduled")}
            onEdit={handleEditCampaign}
            onDuplicate={handleDuplicateCampaign}
            onDelete={handleDeleteCampaign}
            onViewAnalytics={handleViewAnalytics}
            onSend={(campaign) => handleSendCampaign(campaign)}
            onCreateNew={handleCreateCampaign}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {campaigns.filter(c => c.status === "sent").length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No analytics available</h3>
                <p className="mt-2 text-muted-foreground">
                  Analytics will appear here once you've sent campaigns
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns
                .filter(c => c.status === "sent")
                .map((campaign) => (
                  <Card key={campaign.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleViewAnalytics(campaign)}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{campaign.name}</CardTitle>
                          <CardDescription>
                            Sent {new Date(campaign.sent_at || "").toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          View Analytics
                        </Button>
                      </div>
                    </CardHeader>
                    {campaign.metrics && (
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Sent</p>
                            <p className="font-medium">{campaign.metrics.sent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Opens</p>
                            <p className="font-medium">{campaign.metrics.open_rate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Clicks</p>
                            <p className="font-medium">{campaign.metrics.click_rate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                            <p className="font-medium">
                              ${(campaign.metrics.revenue || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Campaign Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto">
          <CampaignBuilder
            initialData={editingCampaign || undefined}
            onSave={handleSaveCampaign}
            onSend={handleSendCampaign}
            onCancel={() => setShowBuilder(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Template Selector Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-5xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Templates</DialogTitle>
          </DialogHeader>
          <TemplateSelector
            type="email"
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      {selectedCampaign && selectedAnalytics && (
        <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
          <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto">
            <CampaignAnalyticsView
              campaign={selectedCampaign}
              analytics={selectedAnalytics}
              onRefresh={() => handleViewAnalytics(selectedCampaign)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Loading skeleton
function CampaignsPageSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}