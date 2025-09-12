'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Plus, Edit2, Trash2, Copy, Users, Calendar, BarChart3, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface EmailCampaign {
  id: string;
  salon_id: string;
  name: string;
  subject: string;
  content: string;
  template_id?: string;
  segment_criteria?: {
    type: 'all' | 'new' | 'returning' | 'inactive' | 'custom';
    filters?: any;
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  unsubscribed_count: number;
  bounced_count: number;
  is_recurring: boolean;
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    end_date?: string;
  };
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables?: string[];
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{salon_name}}!',
    content: 'Dear {{customer_name}},\n\nWelcome to our salon family! We are excited to have you.',
    category: 'Onboarding',
    variables: ['salon_name', 'customer_name']
  },
  {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    subject: 'Reminder: Your appointment tomorrow',
    content: 'Hi {{customer_name}},\n\nThis is a reminder about your appointment on {{date}} at {{time}}.',
    category: 'Transactional',
    variables: ['customer_name', 'date', 'time', 'service']
  },
  {
    id: 'birthday',
    name: 'Birthday Wishes',
    subject: 'Happy Birthday from {{salon_name}}!',
    content: 'Happy Birthday {{customer_name}}! Enjoy 20% off on your next visit.',
    category: 'Promotional',
    variables: ['customer_name', 'salon_name']
  },
  {
    id: 'win_back',
    name: 'Win Back Campaign',
    subject: 'We miss you at {{salon_name}}',
    content: 'Hi {{customer_name}},\n\nIt has been a while since your last visit. Come back and enjoy 15% off!',
    category: 'Re-engagement',
    variables: ['customer_name', 'salon_name', 'last_visit_date']
  }
];

const SEGMENT_TYPES = [
  { value: 'all', label: 'All Customers', description: 'Send to all active customers' },
  { value: 'new', label: 'New Customers', description: 'Customers who joined in the last 30 days' },
  { value: 'returning', label: 'Returning Customers', description: 'Customers with 2+ appointments' },
  { value: 'inactive', label: 'Inactive Customers', description: 'No appointments in last 60 days' },
  { value: 'custom', label: 'Custom Segment', description: 'Define custom criteria' }
];

export function EmailCampaignsManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    template_id: '',
    segment_type: 'all',
    status: 'draft' as EmailCampaign['status'],
    scheduled_at: '',
    is_recurring: false,
    recurrence_frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    recurrence_interval: 1,
    tags: [] as string[],
    tag_input: ''
  });
  const [stats, setStats] = useState({
    totalSent: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
    activeSubscribers: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchCampaigns();
      fetchStats();
    }
  }, [salonId]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load email campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('salon_id', salonId)
        .eq('status', 'sent');

      if (error) throw error;

      if (data && data.length > 0) {
        const totalSent = data.reduce((sum, c) => sum + c.sent_count, 0);
        const totalOpened = data.reduce((sum, c) => sum + c.opened_count, 0);
        const totalClicked = data.reduce((sum, c) => sum + c.clicked_count, 0);
        
        setStats({
          totalSent,
          averageOpenRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
          averageClickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
          activeSubscribers: 1250 // This would come from actual subscriber count
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const campaignData = {
        salon_id: salonId,
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        template_id: formData.template_id || null,
        segment_criteria: {
          type: formData.segment_type as any,
          filters: {}
        },
        status: formData.status,
        scheduled_at: formData.scheduled_at || null,
        total_recipients: 0, // Would be calculated based on segment
        sent_count: 0,
        opened_count: 0,
        clicked_count: 0,
        unsubscribed_count: 0,
        bounced_count: 0,
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? {
          frequency: formData.recurrence_frequency,
          interval: formData.recurrence_interval
        } : null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        updated_at: new Date().toISOString(),
        created_by: user.id
      };

      if (editingCampaign) {
        const { error } = await supabase
          .from('email_campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id);

        if (error) throw error;
        toast.success('Campaign updated successfully');
      } else {
        const { error } = await supabase
          .from('email_campaigns')
          .insert({
            ...campaignData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Campaign created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Campaign deleted successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const sendCampaign = async (campaign: EmailCampaign) => {
    try {
      // This would trigger the actual email sending process
      const { error } = await supabase
        .from('email_campaigns')
        .update({
          status: 'sending',
          sent_at: new Date().toISOString()
        })
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success('Campaign is being sent');
      fetchCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const pauseCampaign = async (campaign: EmailCampaign) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ status: 'paused' })
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success('Campaign paused');
      fetchCampaigns();
    } catch (error) {
      console.error('Error pausing campaign:', error);
      toast.error('Failed to pause campaign');
    }
  };

  const duplicateCampaign = async (campaign: EmailCampaign) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { id, created_at, updated_at, ...campaignData } = campaign;
      const { error } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaignData,
          name: `${campaign.name} (Copy)`,
          status: 'draft',
          created_at: new Date().toISOString(),
          created_by: user.id
        });

      if (error) throw error;

      toast.success('Campaign duplicated');
      fetchCampaigns();
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast.error('Failed to duplicate campaign');
    }
  };

  const useTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      subject: template.subject,
      content: template.content,
      template_id: template.id
    });
  };

  const addTag = () => {
    if (formData.tag_input && !formData.tags.includes(formData.tag_input)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tag_input],
        tag_input: ''
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const openDialog = (campaign?: EmailCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        subject: campaign.subject,
        content: campaign.content,
        template_id: campaign.template_id || '',
        segment_type: campaign.segment_criteria?.type || 'all',
        status: campaign.status,
        scheduled_at: campaign.scheduled_at || '',
        is_recurring: campaign.is_recurring,
        recurrence_frequency: campaign.recurrence_pattern?.frequency || 'weekly',
        recurrence_interval: campaign.recurrence_pattern?.interval || 1,
        tags: campaign.tags || [],
        tag_input: ''
      });
    } else {
      setEditingCampaign(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      template_id: '',
      segment_type: 'all',
      status: 'draft',
      scheduled_at: '',
      is_recurring: false,
      recurrence_frequency: 'weekly',
      recurrence_interval: 1,
      tags: [],
      tag_input: ''
    });
    setSelectedTemplate(null);
    setEditingCampaign(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'scheduled': return 'default';
      case 'sending': return 'default';
      case 'sent': return 'default';
      case 'paused': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!currentSalon) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          {isAdmin ? 'Please select a salon from the dropdown above' : 'No salon found'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Emails delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageOpenRate.toFixed(1)}%</div>
            <Progress value={stats.averageOpenRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageClickRate.toFixed(1)}%</div>
            <Progress value={stats.averageClickRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active contacts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                Create and manage email marketing campaigns
              </CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No email campaigns yet</p>
                  <p className="text-sm mt-2">Create your first campaign to engage customers</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {campaign.subject}
                            </div>
                            {campaign.tags && campaign.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {campaign.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{SEGMENT_TYPES.find(s => s.value === campaign.segment_criteria?.type)?.label}</div>
                            <div className="text-muted-foreground">
                              {campaign.total_recipients} recipients
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.status === 'sent' ? (
                            <div className="text-sm">
                              <div>Opens: {((campaign.opened_count / campaign.sent_count) * 100).toFixed(0)}%</div>
                              <div>Clicks: {((campaign.clicked_count / campaign.sent_count) * 100).toFixed(0)}%</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {campaign.scheduled_at ? (
                            <div className="text-sm">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {format(parseISO(campaign.scheduled_at), 'MMM dd, yyyy')}
                              {campaign.is_recurring && (
                                <Badge variant="outline" className="ml-1 text-xs">
                                  Recurring
                                </Badge>
                              )}
                            </div>
                          ) : campaign.sent_at ? (
                            <div className="text-sm text-muted-foreground">
                              Sent {format(parseISO(campaign.sent_at), 'MMM dd')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {campaign.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendCampaign(campaign)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {campaign.status === 'sending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => pauseCampaign(campaign)}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateCampaign(campaign)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog(campaign)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="templates">
              <div className="grid gap-4 md:grid-cols-2">
                {EMAIL_TEMPLATES.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {template.category}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            useTemplate(template);
                            setIsDialogOpen(true);
                          }}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Subject:</span> {template.subject}
                        </div>
                        <div className="text-muted-foreground">
                          {template.content.substring(0, 100)}...
                        </div>
                        {template.variables && (
                          <div className="flex gap-1 flex-wrap">
                            {template.variables.map(v => (
                              <Badge key={v} variant="secondary" className="text-xs">
                                {`{{${v}}}`}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Campaign analytics coming soon</p>
                <p className="text-sm mt-2">Track detailed performance metrics and insights</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Edit Campaign' : 'Create Email Campaign'}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign ? 'Update campaign details' : 'Set up a new email campaign'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Sale Campaign"
              />
            </div>
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Don't miss our summer specials!"
              />
            </div>
            <div>
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your email content here..."
                rows={8}
              />
              {selectedTemplate && (
                <p className="text-sm text-muted-foreground mt-2">
                  Using template: {selectedTemplate.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="segment">Target Segment</Label>
              <Select
                value={formData.segment_type}
                onValueChange={(value) => setFormData({ ...formData, segment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENT_TYPES.map((segment) => (
                    <SelectItem key={segment.value} value={segment.value}>
                      <div>
                        <div>{segment.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {segment.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as EmailCampaign['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="schedule">Schedule Date (Optional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                />
                <Label htmlFor="recurring">Recurring Campaign</Label>
              </div>
              {formData.is_recurring && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.recurrence_frequency}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        recurrence_frequency: value as 'daily' | 'weekly' | 'monthly'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="interval">Interval</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      value={formData.recurrence_interval}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        recurrence_interval: parseInt(e.target.value) || 1
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={formData.tag_input}
                  onChange={(e) => setFormData({ ...formData, tag_input: e.target.value })}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        className="ml-1 hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCampaign ? 'Update' : 'Create'} Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}