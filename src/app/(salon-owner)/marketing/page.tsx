'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/database/supabase/client';
import type { Database } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Plus, 
  Edit, 
  Trash2,
  Users,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Eye,
  MousePointer,
  UserX,
  DollarSign,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Smartphone,
  Globe,
  Hash,
  Percent,
  ArrowUp,
  ArrowDown,
  FileText,
  Image as ImageIcon,
  Link,
  Zap
} from 'lucide-react';

// ULTRA-TYPES: Comprehensive marketing types
type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row'];
type SmsCampaign = Database['public']['Tables']['sms_campaigns']['Row'];

interface CampaignWithStats extends EmailCampaign {
  recipients_count?: number;
  open_rate?: number;
  click_rate?: number;
  status_color?: string;
  status_icon?: any;
}

interface SmsCampaignWithStats extends SmsCampaign {
  recipients_count?: number;
  delivery_rate?: number;
  click_rate?: number;
  cost?: number;
  status_color?: string;
  status_icon?: any;
}

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: any;
  color: string;
}

// ULTRA-CONSTANTS: Campaign configuration
const CAMPAIGN_STATUS_CONFIG = {
  draft: { color: 'text-gray-500', bg: 'bg-gray-100', icon: Edit, label: 'Draft' },
  scheduled: { color: 'text-blue-500', bg: 'bg-blue-100', icon: Clock, label: 'Scheduled' },
  sending: { color: 'text-yellow-500', bg: 'bg-yellow-100', icon: Send, label: 'Sending' },
  sent: { color: 'text-green-500', bg: 'bg-green-100', icon: CheckCircle, label: 'Sent' },
  paused: { color: 'text-orange-500', bg: 'bg-orange-100', icon: Pause, label: 'Paused' },
  cancelled: { color: 'text-red-500', bg: 'bg-red-100', icon: XCircle, label: 'Cancelled' },
  failed: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle, label: 'Failed' }
} as const;

const CAMPAIGN_TEMPLATES = [
  { id: 'welcome', name: 'Welcome Email', type: 'email', category: 'onboarding' },
  { id: 'appointment-reminder', name: 'Appointment Reminder', type: 'sms', category: 'transactional' },
  { id: 'promotion', name: 'Special Offer', type: 'email', category: 'promotional' },
  { id: 'review-request', name: 'Review Request', type: 'email', category: 'engagement' },
  { id: 'birthday', name: 'Birthday Wishes', type: 'email', category: 'personal' },
  { id: 'reengagement', name: 'We Miss You', type: 'email', category: 'retention' }
];

export default function MarketingAutomationPage() {
  // ULTRA-STATE: Comprehensive marketing management
  const [emailCampaigns, setEmailCampaigns] = useState<CampaignWithStats[]>([]);
  const [smsCampaigns, setSmsCampaigns] = useState<SmsCampaignWithStats[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [campaignType, setCampaignType] = useState<'email' | 'sms'>('email');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ campaign: any; type: 'email' | 'sms' } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ campaignId: string; type: 'email' | 'sms' } | null>(null);

  // ULTRA-METRICS: Campaign analytics
  const [metrics, setMetrics] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEmailsSent: 0,
    totalSmsSent: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
    totalRevenue: 0,
    totalCost: 0
  });

  // ULTRA-FORM: Campaign creation form
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'promotional',
    subject: '',
    preview_text: '',
    content: '',
    segment: 'all',
    schedule_type: 'immediate',
    scheduled_for: '',
    template_id: ''
  });

  // ULTRA-FETCH: Load marketing data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get current user and salon
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      // Fetch email campaigns
      const { data: emailData, error: emailError } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          email_campaign_recipients (
            id,
            status,
            opened_at,
            clicked_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (emailError) throw emailError;

      // Process email campaigns with stats
      const processedEmails = (emailData || []).map(campaign => {
        const recipients = campaign.email_campaign_recipients || [];
        const sent = recipients.filter(r => r.status === 'sent').length;
        const opened = recipients.filter(r => r.opened_at).length;
        const clicked = recipients.filter(r => r.clicked_at).length;

        const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status as keyof typeof CAMPAIGN_STATUS_CONFIG];

        return {
          ...campaign,
          recipients_count: recipients.length,
          open_rate: sent > 0 ? (opened / sent) * 100 : 0,
          click_rate: opened > 0 ? (clicked / opened) * 100 : 0,
          status_color: statusConfig?.color,
          status_icon: statusConfig?.icon
        };
      });

      setEmailCampaigns(processedEmails);

      // Fetch SMS campaigns
      const { data: smsData, error: smsError } = await supabase
        .from('sms_campaigns')
        .select(`
          *,
          sms_campaign_recipients (
            id,
            status,
            delivered_at,
            clicked_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (smsError) throw smsError;

      // Process SMS campaigns with stats
      const processedSms = (smsData || []).map(campaign => {
        const recipients = campaign.sms_campaign_recipients || [];
        const sent = recipients.filter(r => r.status === 'sent').length;
        const delivered = recipients.filter(r => r.delivered_at).length;
        const clicked = recipients.filter(r => r.clicked_at).length;

        const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status as keyof typeof CAMPAIGN_STATUS_CONFIG];
        const costPerSms = 0.01; // Example cost

        return {
          ...campaign,
          recipients_count: recipients.length,
          delivery_rate: sent > 0 ? (delivered / sent) * 100 : 0,
          click_rate: delivered > 0 ? (clicked / delivered) * 100 : 0,
          cost: sent * costPerSms,
          status_color: statusConfig?.color,
          status_icon: statusConfig?.icon
        };
      });

      setSmsCampaigns(processedSms);

      // Load customer segments
      const mockSegments: CustomerSegment[] = [
        { id: 'all', name: 'All Customers', description: 'Everyone in your database', count: 1250, icon: Users, color: 'text-blue-500' },
        { id: 'new', name: 'New Customers', description: 'Joined in last 30 days', count: 85, icon: Zap, color: 'text-green-500' },
        { id: 'vip', name: 'VIP Customers', description: 'High-value customers', count: 124, icon: Target, color: 'text-purple-500' },
        { id: 'inactive', name: 'Inactive', description: 'No visit in 60+ days', count: 230, icon: UserX, color: 'text-gray-500' }
      ];
      setSegments(mockSegments);

      // Calculate metrics
      const totalEmails = processedEmails.reduce((sum, c) => sum + (c.recipients_count || 0), 0);
      const totalSms = processedSms.reduce((sum, c) => sum + (c.recipients_count || 0), 0);
      const avgOpenRate = processedEmails.length > 0 
        ? processedEmails.reduce((sum, c) => sum + (c.open_rate || 0), 0) / processedEmails.length
        : 0;
      const avgClickRate = processedEmails.length > 0
        ? processedEmails.reduce((sum, c) => sum + (c.click_rate || 0), 0) / processedEmails.length
        : 0;
      const totalCost = processedSms.reduce((sum, c) => sum + (c.cost || 0), 0);

      setMetrics({
        totalCampaigns: processedEmails.length + processedSms.length,
        activeCampaigns: [...processedEmails, ...processedSms].filter(c => 
          c.status === 'sending' || c.status === 'scheduled'
        ).length,
        totalEmailsSent: totalEmails,
        totalSmsSent: totalSms,
        averageOpenRate: avgOpenRate,
        averageClickRate: avgClickRate,
        totalRevenue: 0, // Would calculate from conversions
        totalCost: totalCost
      });

    } catch (error) {
      console.error('Error loading marketing data:', error);
      toast.error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ULTRA-HANDLER: Create campaign
  const handleCreateCampaign = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (campaignType === 'email') {
        const { error } = await supabase
          .from('email_campaigns')
          .insert({
            name: campaignForm.name,
            type: campaignForm.type,
            subject: campaignForm.subject,
            preview_text: campaignForm.preview_text,
            html_content: campaignForm.content,
            text_content: campaignForm.content,
            status: 'draft',
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Email campaign created successfully');
      } else {
        const { error } = await supabase
          .from('sms_campaigns')
          .insert({
            name: campaignForm.name,
            message: campaignForm.content,
            status: 'draft',
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('SMS campaign created successfully');
      }

      setShowCampaignDialog(false);
      loadData();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  // ULTRA-HANDLER: Send campaign
  const handleSendCampaign = async (campaign: any, type: 'email' | 'sms') => {
    setPendingAction({ campaign, type });
    setSendConfirmOpen(true);
  };

  const confirmSendCampaign = async () => {
    if (!pendingAction) return;
    
    const { campaign, type } = pendingAction;
    
    try {
      const supabase = createClient();
      const table = type === 'email' ? 'email_campaigns' : 'sms_campaigns';

      const { error } = await supabase
        .from(table)
        .update({
          status: 'sending',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success(`${type === 'email' ? 'Email' : 'SMS'} campaign is being sent`);
      loadData();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    } finally {
      setSendConfirmOpen(false);
      setPendingAction(null);
    }
  };

  // ULTRA-HANDLER: Delete campaign
  const handleDeleteCampaign = async (campaignId: string, type: 'email' | 'sms') => {
    setPendingDelete({ campaignId, type });
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteCampaign = async () => {
    if (!pendingDelete) return;
    
    const { campaignId, type } = pendingDelete;
    
    try {
      const supabase = createClient();
      const table = type === 'email' ? 'email_campaigns' : 'sms_campaigns';

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      toast.success('Campaign deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    } finally {
      setDeleteConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading marketing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ULTRA-HEADER: Marketing dashboard header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Send className="h-6 w-6" />
            Marketing Automation
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage email and SMS campaigns
          </p>
        </div>
        <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>
                Design and configure your marketing campaign
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex gap-2">
                <Button
                  variant={campaignType === 'email' ? 'default' : 'outline'}
                  onClick={() => setCampaignType('email')}
                  className="flex-1"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Campaign
                </Button>
                <Button
                  variant={campaignType === 'sms' ? 'default' : 'outline'}
                  onClick={() => setCampaignType('sms')}
                  className="flex-1"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  SMS Campaign
                </Button>
              </div>

              <div>
                <Label>Campaign Name</Label>
                <Input
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              {campaignType === 'email' && (
                <>
                  <div>
                    <Label>Subject Line</Label>
                    <Input
                      value={campaignForm.subject}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., Get 20% off your next visit!"
                    />
                  </div>
                  <div>
                    <Label>Preview Text</Label>
                    <Input
                      value={campaignForm.preview_text}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, preview_text: e.target.value }))}
                      placeholder="e.g., Limited time offer - Book now!"
                    />
                  </div>
                </>
              )}

              <div>
                <Label>Message Content</Label>
                <Textarea
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={campaignType === 'email' 
                    ? 'Write your email content here...' 
                    : 'Write your SMS message (160 characters)...'}
                  rows={campaignType === 'email' ? 8 : 3}
                  maxLength={campaignType === 'sms' ? 160 : undefined}
                />
                {campaignType === 'sms' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {campaignForm.content.length}/160 characters
                  </p>
                )}
              </div>

              <div>
                <Label>Target Segment</Label>
                <Select value={campaignForm.segment} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, segment: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map(segment => (
                      <SelectItem key={segment.id} value={segment.id}>
                        <span className="flex items-center gap-2">
                          <segment.icon className={`h-4 w-4 ${segment.color}`} />
                          {segment.name} ({segment.count})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Send Time</Label>
                <Select value={campaignForm.schedule_type} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, schedule_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Send Immediately</SelectItem>
                    <SelectItem value="scheduled">Schedule for Later</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {campaignForm.schedule_type === 'scheduled' && (
                <div>
                  <Label>Schedule Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={campaignForm.scheduled_for}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduled_for: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ULTRA-METRICS: Campaign overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEmailsSent.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              {metrics.averageOpenRate.toFixed(1)}% open rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSmsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${metrics.totalCost.toFixed(2)} total cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageClickRate.toFixed(1)}%</div>
            <Progress value={metrics.averageClickRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* ULTRA-TABS: Campaign management */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="email">Email Campaigns</TabsTrigger>
          <TabsTrigger value="sms">SMS Campaigns</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Recent Email Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Recent Email Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emailCampaigns.slice(0, 3).map(campaign => {
                    const StatusIcon = campaign.status_icon || Info;
                    return (
                      <Card key={campaign.id}>
                        <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <p className="font-medium">{campaign.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {campaign.recipients_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {campaign.open_rate?.toFixed(1)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointer className="h-3 w-3" />
                              {campaign.click_rate?.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                          <Badge variant="outline" className={campaign.status_color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {campaign.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent SMS Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent SMS Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {smsCampaigns.slice(0, 3).map(campaign => {
                    const StatusIcon = campaign.status_icon || Info;
                    return (
                      <Card key={campaign.id}>
                        <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <p className="font-medium">{campaign.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {campaign.recipients_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {campaign.delivery_rate?.toFixed(1)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${campaign.cost?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                          <Badge variant="outline" className={campaign.status_color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {campaign.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Click Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailCampaigns.map(campaign => {
                  const StatusIcon = campaign.status_icon || Info;
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{campaign.subject}</TableCell>
                      <TableCell>{campaign.recipients_count || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          {campaign.open_rate?.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3 text-muted-foreground" />
                          {campaign.click_rate?.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={campaign.status_color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(campaign.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {campaign.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendCampaign(campaign, 'email')}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCampaign(campaign.id, 'email')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Delivery Rate</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {smsCampaigns.map(campaign => {
                  const StatusIcon = campaign.status_icon || Info;
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{campaign.message}</TableCell>
                      <TableCell>{campaign.recipients_count || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-muted-foreground" />
                          {campaign.delivery_rate?.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>${campaign.cost?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={campaign.status_color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(campaign.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {campaign.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendCampaign(campaign, 'sms')}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCampaign(campaign.id, 'sms')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>
                Target specific groups of customers with your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {segments.map(segment => (
                  <Card key={segment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-muted ${segment.color}`}>
                            <segment.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{segment.name}</p>
                            <p className="text-sm text-muted-foreground">{segment.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{segment.count}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Templates</CardTitle>
              <CardDescription>
                Start with pre-built templates for common campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {CAMPAIGN_TEMPLATES.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        {template.type === 'email' ? (
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="font-medium">{template.name}</p>
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Campaign Confirmation Dialog */}
      <AlertDialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send this campaign to {pendingAction?.campaign?.recipients_count || 0} recipients? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSendConfirmOpen(false);
              setPendingAction(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendCampaign}>
              Send Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Campaign Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone and will permanently 
              remove all campaign data and analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmOpen(false);
              setPendingDelete(null);
            }}>
              Keep Campaign
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCampaign}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}