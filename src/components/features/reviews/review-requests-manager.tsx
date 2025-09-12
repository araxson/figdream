'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import { Send, Clock, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReviewRequestsManagerProps {
  salonId: string;
}

interface ReviewRequest {
  id: string;
  appointment_id: string;
  customer_id: string;
  request_status: 'pending' | 'sent' | 'responded' | 'failed';
  sent_at?: string;
  responded_at?: string;
  follow_up_count: number;
  last_follow_up_at?: string;
  review_platform?: string;
  created_at: string;
  appointments?: {
    id: string;
    start_time: string;
    services?: string[];
  };
  customers?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export function ReviewRequestsManager({ salonId }: ReviewRequestsManagerProps) {
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null);
  const [stats, setStats] = useState({
    totalSent: 0,
    responded: 0,
    responseRate: 0,
    pendingRequests: 0
  });
  const [template, setTemplate] = useState({
    subject: 'We\'d love your feedback!',
    message: 'Hi {customer_name},\n\nThank you for visiting us on {appointment_date}. We hope you enjoyed your {service_name} service.\n\nWe\'d appreciate if you could take a moment to share your experience.',
    delay_days: 1,
    enable_follow_up: true,
    follow_up_delay: 3,
    max_follow_ups: 2
  });

  const supabase = createClient();

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [salonId, activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('review_requests')
        .select(`
          *,
          appointments (
            id,
            start_time,
            appointment_services (
              services (
                name
              )
            )
          ),
          customers (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('request_status', activeTab);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching review requests:', error);
      toast.error('Failed to load review requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('review_requests')
        .select('request_status')
        .eq('salon_id', salonId);

      if (error) throw error;

      const total = data?.length || 0;
      const sent = data?.filter(r => r.request_status === 'sent').length || 0;
      const responded = data?.filter(r => r.request_status === 'responded').length || 0;
      const pending = data?.filter(r => r.request_status === 'pending').length || 0;

      setStats({
        totalSent: sent,
        responded: responded,
        responseRate: sent > 0 ? Math.round((responded / sent) * 100) : 0,
        pendingRequests: pending
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const createAutomaticRequests = async () => {
    try {
      // Find recent completed appointments without review requests
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - template.delay_days);
      
      const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('id, customer_id, start_time')
        .eq('salon_id', salonId)
        .eq('status', 'completed')
        .gte('start_time', yesterday.toISOString())
        .lte('start_time', new Date().toISOString());

      if (apptError) throw apptError;

      // Filter out appointments that already have requests
      const { data: existingRequests } = await supabase
        .from('review_requests')
        .select('appointment_id')
        .in('appointment_id', appointments?.map(a => a.id) || []);

      const existingIds = new Set(existingRequests?.map(r => r.appointment_id));
      const newAppointments = appointments?.filter(a => !existingIds.has(a.id)) || [];

      if (newAppointments.length === 0) {
        toast.info('No new appointments to request reviews for');
        return;
      }

      // Create review requests
      const { data: { user } } = await supabase.auth.getUser();
      const requests = newAppointments.map(apt => ({
        salon_id: salonId,
        appointment_id: apt.id,
        customer_id: apt.customer_id,
        request_status: 'pending',
        follow_up_count: 0,
        created_by: user?.id
      }));

      const { error: insertError } = await supabase
        .from('review_requests')
        .insert(requests);

      if (insertError) throw insertError;

      toast.success(`Created ${newAppointments.length} review requests`);
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error creating review requests:', error);
      toast.error('Failed to create review requests');
    }
  };

  const sendRequest = async (requestId: string) => {
    try {
      // In a real app, this would trigger an email/SMS service
      const { error } = await supabase
        .from('review_requests')
        .update({
          request_status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Review request sent successfully');
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error sending review request:', error);
      toast.error('Failed to send review request');
    }
  };

  const sendBulkRequests = async () => {
    const pendingRequests = requests.filter(r => r.request_status === 'pending');
    
    if (pendingRequests.length === 0) {
      toast.info('No pending requests to send');
      return;
    }

    try {
      const { error } = await supabase
        .from('review_requests')
        .update({
          request_status: 'sent',
          sent_at: new Date().toISOString()
        })
        .in('id', pendingRequests.map(r => r.id));

      if (error) throw error;

      toast.success(`Sent ${pendingRequests.length} review requests`);
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error sending bulk requests:', error);
      toast.error('Failed to send review requests');
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this review request?')) return;

    try {
      const { error } = await supabase
        .from('review_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Review request deleted');
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error deleting review request:', error);
      toast.error('Failed to delete review request');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'responded':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'sent':
        return 'default';
      case 'responded':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responses</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Review Requests</CardTitle>
              <CardDescription>
                Manage automated review requests to customers
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsTemplateOpen(true)}>
                Template Settings
              </Button>
              <Button variant="outline" onClick={createAutomaticRequests}>
                <Plus className="mr-2 h-4 w-4" />
                Auto-Create Requests
              </Button>
              <Button onClick={sendBulkRequests}>
                <Send className="mr-2 h-4 w-4" />
                Send All Pending
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="responded">Responded</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Appointment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Follow-ups</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No review requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.customers?.full_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.customers?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.appointments?.start_time ? 
                            format(parseISO(request.appointments.start_time), 'MMM dd, yyyy') : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(request.request_status) as any}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.request_status)}
                              {request.request_status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.sent_at ? 
                            format(parseISO(request.sent_at), 'MMM dd, HH:mm') : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          {request.follow_up_count > 0 && (
                            <Badge variant="outline">
                              {request.follow_up_count} sent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {request.request_status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendRequest(request.id)}
                              className="mr-2"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRequest(request.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Template Settings Dialog */}
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Request Template</DialogTitle>
            <DialogDescription>
              Configure automated review request settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={template.subject}
                onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="message">Message Template</Label>
              <Textarea
                id="message"
                rows={6}
                value={template.message}
                onChange={(e) => setTemplate({ ...template, message: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Available variables: {'{customer_name}'}, {'{appointment_date}'}, {'{service_name}'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delay">Send After (days)</Label>
                <Input
                  id="delay"
                  type="number"
                  min="0"
                  max="30"
                  value={template.delay_days}
                  onChange={(e) => setTemplate({ ...template, delay_days: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="follow-delay">Follow-up After (days)</Label>
                <Input
                  id="follow-delay"
                  type="number"
                  min="1"
                  max="30"
                  value={template.follow_up_delay}
                  onChange={(e) => setTemplate({ ...template, follow_up_delay: parseInt(e.target.value) })}
                  disabled={!template.enable_follow_up}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="follow-up"
                checked={template.enable_follow_up}
                onCheckedChange={(checked) => setTemplate({ ...template, enable_follow_up: checked })}
              />
              <Label htmlFor="follow-up">Enable automatic follow-ups</Label>
            </div>
            {template.enable_follow_up && (
              <div>
                <Label htmlFor="max-follow">Maximum Follow-ups</Label>
                <Select
                  value={template.max_follow_ups.toString()}
                  onValueChange={(value) => setTemplate({ ...template, max_follow_ups: parseInt(value) })}
                >
                  <SelectTrigger id="max-follow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Template settings saved');
              setIsTemplateOpen(false);
            }}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}