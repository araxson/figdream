'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Plus, Edit2, Trash2, Copy, Users, Calendar, BarChart3, Play, Pause, Smartphone } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface SmsCampaign {
  id: string;
  salon_id: string;
  name: string;
  message: string;
  template_id?: string;
  segment_criteria?: {
    type: 'all' | 'new' | 'returning' | 'inactive' | 'birthday' | 'custom';
    filters?: any;
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  opted_out_count: number;
  is_recurring: boolean;
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    end_date?: string;
  };
  compliance_check: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface SmsTemplate {
  id: string;
  name: string;
  message: string;
  category: string;
  variables?: string[];
  character_count: number;
}

const SMS_TEMPLATES: SmsTemplate[] = [
  {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    message: 'Hi {{customer_name}}, reminder: Your appointment at {{salon_name}} is tomorrow at {{time}}. Reply STOP to opt out.',
    category: 'Transactional',
    variables: ['customer_name', 'salon_name', 'time'],
    character_count: 110
  },
  {
    id: 'promotion',
    name: 'Promotional Offer',
    message: '{{salon_name}}: Flash Sale! Get {{discount}}% off all services this weekend. Book now: {{booking_link}}. Reply STOP to opt out.',
    category: 'Promotional',
    variables: ['salon_name', 'discount', 'booking_link'],
    character_count: 130
  },
  {
    id: 'birthday',
    name: 'Birthday Wishes',
    message: 'Happy Birthday {{customer_name}}! 🎉 Enjoy a special 20% off at {{salon_name}} this month. Reply STOP to opt out.',
    category: 'Promotional',
    variables: ['customer_name', 'salon_name'],
    character_count: 115
  },
  {
    id: 'feedback',
    name: 'Feedback Request',
    message: 'Hi {{customer_name}}, how was your recent visit to {{salon_name}}? Rate us 1-5 stars by replying. Reply STOP to opt out.',
    category: 'Engagement',
    variables: ['customer_name', 'salon_name'],
    character_count: 120
  }
];

const SEGMENT_TYPES = [
  { value: 'all', label: 'All Customers', description: 'Send to all opted-in customers' },
  { value: 'new', label: 'New Customers', description: 'Customers who joined in the last 30 days' },
  { value: 'returning', label: 'Returning Customers', description: 'Customers with 2+ appointments' },
  { value: 'inactive', label: 'Inactive Customers', description: 'No appointments in last 60 days' },
  { value: 'birthday', label: 'Birthday Month', description: 'Customers with birthdays this month' },
  { value: 'custom', label: 'Custom Segment', description: 'Define custom criteria' }
];

export function SmsCampaignsManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<SmsCampaign | null>(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    template_id: '',
    segment_type: 'all',
    status: 'draft' as SmsCampaign['status'],
    scheduled_at: '',
    is_recurring: false,
    recurrence_frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    recurrence_interval: 1,
    compliance_check: false,
    tags: [] as string[],
    tag_input: ''
  });
  const [characterCount, setCharacterCount] = useState(0);
  const [stats, setStats] = useState({
    totalSent: 0,
    deliveryRate: 0,
    optOutRate: 0,
    activeSubscribers: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchCampaigns();
      fetchStats();
    }
  }, [salonId]);

  useEffect(() => {
    setCharacterCount(formData.message.length);
  }, [formData.message]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching SMS campaigns:', error);
      toast.error('Failed to load SMS campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .eq('salon_id', salonId)
        .eq('status', 'sent');

      if (error) throw error;

      if (data && data.length > 0) {
        const totalSent = data.reduce((sum, c) => sum + c.sent_count, 0);
        const totalDelivered = data.reduce((sum, c) => sum + c.delivered_count, 0);
        const totalOptedOut = data.reduce((sum, c) => sum + c.opted_out_count, 0);
        
        setStats({
          totalSent,
          deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
          optOutRate: totalSent > 0 ? (totalOptedOut / totalSent) * 100 : 0,
          activeSubscribers: 850 // This would come from actual subscriber count
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.compliance_check) {
      toast.error('Please confirm compliance with SMS regulations');
      return;
    }

    if (characterCount > 160) {
      toast.warning('Message exceeds 160 characters and will be sent as multiple SMS');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const campaignData = {
        salon_id: salonId,
        name: formData.name,
        message: formData.message,
        template_id: formData.template_id || null,
        segment_criteria: {
          type: formData.segment_type as any,
          filters: {}
        },
        status: formData.status,
        scheduled_at: formData.scheduled_at || null,
        total_recipients: 0, // Would be calculated based on segment
        sent_count: 0,
        delivered_count: 0,
        failed_count: 0,
        opted_out_count: 0,
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? {
          frequency: formData.recurrence_frequency,
          interval: formData.recurrence_interval
        } : null,
        compliance_check: formData.compliance_check,
        tags: formData.tags.length > 0 ? formData.tags : null,
        updated_at: new Date().toISOString(),
        created_by: user.id
      };

      if (editingCampaign) {
        const { error } = await supabase
          .from('sms_campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id);

        if (error) throw error;
        toast.success('SMS campaign updated successfully');
      } else {
        const { error } = await supabase
          .from('sms_campaigns')
          .insert({
            ...campaignData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('SMS campaign created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error saving SMS campaign:', error);
      toast.error('Failed to save SMS campaign');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SMS campaign?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sms_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('SMS campaign deleted successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting SMS campaign:', error);
      toast.error('Failed to delete SMS campaign');
    }
  };

  const sendCampaign = async (campaign: SmsCampaign) => {
    try {
      // This would trigger the actual SMS sending process
      const { error } = await supabase
        .from('sms_campaigns')
        .update({
          status: 'sending',
          sent_at: new Date().toISOString()
        })
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success('SMS campaign is being sent');
      fetchCampaigns();
    } catch (error) {
      console.error('Error sending SMS campaign:', error);
      toast.error('Failed to send SMS campaign');
    }
  };

  const pauseCampaign = async (campaign: SmsCampaign) => {
    try {
      const { error } = await supabase
        .from('sms_campaigns')
        .update({ status: 'paused' })
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success('SMS campaign paused');
      fetchCampaigns();
    } catch (error) {
      console.error('Error pausing SMS campaign:', error);
      toast.error('Failed to pause SMS campaign');
    }
  };

  const duplicateCampaign = async (campaign: SmsCampaign) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { id, created_at, updated_at, ...campaignData } = campaign;
      const { error } = await supabase
        .from('sms_campaigns')
        .insert({
          ...campaignData,
          name: `${campaign.name} (Copy)`,
          status: 'draft',
          created_at: new Date().toISOString(),
          created_by: user.id
        });

      if (error) throw error;

      toast.success('SMS campaign duplicated');
      fetchCampaigns();
    } catch (error) {
      console.error('Error duplicating SMS campaign:', error);
      toast.error('Failed to duplicate SMS campaign');
    }
  };

  const useTemplate = (template: SmsTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      message: template.message,
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

  const openDialog = (campaign?: SmsCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        message: campaign.message,
        template_id: campaign.template_id || '',
        segment_type: campaign.segment_criteria?.type || 'all',
        status: campaign.status,
        scheduled_at: campaign.scheduled_at || '',
        is_recurring: campaign.is_recurring,
        recurrence_frequency: campaign.recurrence_pattern?.frequency || 'weekly',
        recurrence_interval: campaign.recurrence_pattern?.interval || 1,
        compliance_check: campaign.compliance_check,
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
      message: '',
      template_id: '',
      segment_type: 'all',
      status: 'draft',
      scheduled_at: '',
      is_recurring: false,
      recurrence_frequency: 'weekly',
      recurrence_interval: 1,
      compliance_check: false,
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

  const getSmsSegments = (length: number) => {
    if (length <= 160) return 1;
    return Math.ceil(length / 153); // Multi-part SMS uses 153 chars per segment
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
            <p className="text-xs text-muted-foreground">SMS messages sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</div>
            <Progress value={stats.deliveryRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opt-out Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.optOutRate.toFixed(1)}%</div>
            <Progress value={stats.optOutRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Opted-in contacts</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alert */}
      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertDescription>
          <strong>SMS Compliance:</strong> All messages must include opt-out instructions (e.g., "Reply STOP to opt out"). 
          Ensure you have explicit consent before sending marketing messages.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SMS Campaigns</CardTitle>
              <CardDescription>
                Create and manage SMS marketing campaigns
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
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No SMS campaigns yet</p>
                  <p className="text-sm mt-2">Create your first SMS campaign to engage customers</p>
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
                              {campaign.message.substring(0, 50)}...
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
                              <div>Delivered: {((campaign.delivered_count / campaign.sent_count) * 100).toFixed(0)}%</div>
                              <div>Opt-outs: {campaign.opted_out_count}</div>
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
                {SMS_TEMPLATES.map((template) => (
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
                        <div className="text-muted-foreground">
                          {template.message}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {template.character_count} chars • {getSmsSegments(template.character_count)} SMS
                          </span>
                          {template.variables && (
                            <div className="flex gap-1">
                              {template.variables.map(v => (
                                <Badge key={v} variant="secondary" className="text-xs">
                                  {`{{${v}}}`}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="compliance">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">SMS Compliance Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <div className="font-medium">Obtain Explicit Consent</div>
                        <div className="text-sm text-muted-foreground">
                          Always get written consent before sending marketing SMS messages
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <div className="font-medium">Include Opt-out Instructions</div>
                        <div className="text-sm text-muted-foreground">
                          Every message must include "Reply STOP to opt out" or similar
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <div className="font-medium">Identify Your Business</div>
                        <div className="text-sm text-muted-foreground">
                          Always include your salon name in the message
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <div className="font-medium">Respect Timing</div>
                        <div className="text-sm text-muted-foreground">
                          Send messages only during reasonable hours (8 AM - 9 PM local time)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <div className="font-medium">Honor Opt-outs Immediately</div>
                        <div className="text-sm text-muted-foreground">
                          Process opt-out requests within 24 hours
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Edit SMS Campaign' : 'Create SMS Campaign'}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign ? 'Update SMS campaign details' : 'Set up a new SMS campaign'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Weekend Promotion"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Type your SMS message here..."
                rows={4}
              />
              <div className="flex justify-between mt-2">
                <span className={`text-sm ${characterCount > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {characterCount}/160 characters
                </span>
                <span className="text-sm text-muted-foreground">
                  {getSmsSegments(characterCount)} SMS segment(s)
                </span>
              </div>
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
                  onValueChange={(value) => setFormData({ ...formData, status: value as SmsCampaign['status'] })}
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
            <Alert>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="compliance"
                  checked={formData.compliance_check}
                  onChange={(e) => setFormData({ ...formData, compliance_check: e.target.checked })}
                  className="mt-1"
                />
                <Label htmlFor="compliance" className="text-sm font-normal">
                  I confirm this campaign complies with SMS regulations, includes opt-out instructions, 
                  and will only be sent to customers who have provided explicit consent.
                </Label>
              </div>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.compliance_check}>
              {editingCampaign ? 'Update' : 'Create'} Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}