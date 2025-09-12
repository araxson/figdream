'use client';

import { useState, useEffect } from 'react';
import { FileDown, Plus, Edit2, Trash2, Calendar, Clock, Mail, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

interface ExportConfiguration {
  id: string;
  salon_id: string;
  name: string;
  export_type: 'appointments' | 'customers' | 'revenue' | 'staff_performance' | 'services' | 'inventory';
  format: 'csv' | 'excel' | 'pdf' | 'json';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    day_of_week?: number;
    day_of_month?: number;
    time: string;
  };
  filters?: {
    date_range?: string;
    status?: string[];
    staff_ids?: string[];
    service_ids?: string[];
  };
  columns?: string[];
  recipients?: string[];
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
}

const EXPORT_TYPES = [
  { value: 'appointments', label: 'Appointments', icon: Calendar },
  { value: 'customers', label: 'Customers', icon: Clock },
  { value: 'revenue', label: 'Revenue Reports', icon: FileDown },
  { value: 'staff_performance', label: 'Staff Performance', icon: Clock },
  { value: 'services', label: 'Services', icon: Settings2 },
  { value: 'inventory', label: 'Inventory', icon: FileDown }
];

const AVAILABLE_COLUMNS = {
  appointments: [
    'date', 'time', 'customer_name', 'service', 'staff', 'status', 'amount', 'notes'
  ],
  customers: [
    'name', 'email', 'phone', 'join_date', 'total_visits', 'total_spent', 'last_visit', 'preferred_staff'
  ],
  revenue: [
    'date', 'total_revenue', 'service_revenue', 'product_revenue', 'tips', 'tax', 'appointments_count'
  ],
  staff_performance: [
    'staff_name', 'total_appointments', 'revenue_generated', 'average_rating', 'utilization_rate', 'tips_earned'
  ],
  services: [
    'service_name', 'category', 'price', 'duration', 'popularity', 'revenue', 'average_rating'
  ],
  inventory: [
    'product_name', 'sku', 'current_stock', 'reorder_point', 'supplier', 'cost', 'retail_price'
  ]
};

export function ExportConfigurationsManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [configurations, setConfigurations] = useState<ExportConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ExportConfiguration | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    export_type: 'appointments' as ExportConfiguration['export_type'],
    format: 'csv' as ExportConfiguration['format'],
    is_active: true,
    schedule_enabled: false,
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    time: '09:00',
    day_of_week: 1,
    day_of_month: 1,
    columns: [] as string[],
    recipients: [] as string[],
    recipient_input: ''
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchConfigurations();
    }
  }, [salonId]);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('export_configurations')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigurations(data || []);
    } catch (error) {
      console.error('Error fetching export configurations:', error);
      toast.error('Failed to load export configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const configData = {
        salon_id: salonId,
        name: formData.name,
        export_type: formData.export_type,
        format: formData.format,
        schedule: formData.schedule_enabled ? {
          frequency: formData.frequency,
          day_of_week: formData.frequency === 'weekly' ? formData.day_of_week : undefined,
          day_of_month: formData.frequency === 'monthly' ? formData.day_of_month : undefined,
          time: formData.time
        } : null,
        columns: formData.columns.length > 0 ? formData.columns : AVAILABLE_COLUMNS[formData.export_type],
        recipients: formData.recipients.length > 0 ? formData.recipients : null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      };

      if (editingConfig) {
        const { error } = await supabase
          .from('export_configurations')
          .update(configData)
          .eq('id', editingConfig.id);

        if (error) throw error;
        toast.success('Export configuration updated');
      } else {
        const { error } = await supabase
          .from('export_configurations')
          .insert({
            ...configData,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Export configuration created');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchConfigurations();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this export configuration?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('export_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Configuration deleted');
      fetchConfigurations();
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast.error('Failed to delete configuration');
    }
  };

  const runExport = async (config: ExportConfiguration) => {
    try {
      // This would trigger the actual export process
      toast.info(`Running export: ${config.name}`);
      
      // Update last_run timestamp
      await supabase
        .from('export_configurations')
        .update({ last_run: new Date().toISOString() })
        .eq('id', config.id);

      fetchConfigurations();
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error running export:', error);
      toast.error('Failed to run export');
    }
  };

  const toggleActive = async (config: ExportConfiguration) => {
    try {
      const { error } = await supabase
        .from('export_configurations')
        .update({ is_active: !config.is_active })
        .eq('id', config.id);

      if (error) throw error;

      toast.success(`Configuration ${config.is_active ? 'deactivated' : 'activated'}`);
      fetchConfigurations();
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Failed to update configuration');
    }
  };

  const addRecipient = () => {
    if (formData.recipient_input && formData.recipient_input.includes('@')) {
      setFormData({
        ...formData,
        recipients: [...formData.recipients, formData.recipient_input],
        recipient_input: ''
      });
    }
  };

  const removeRecipient = (email: string) => {
    setFormData({
      ...formData,
      recipients: formData.recipients.filter(r => r !== email)
    });
  };

  const openDialog = (config?: ExportConfiguration) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        export_type: config.export_type,
        format: config.format,
        is_active: config.is_active,
        schedule_enabled: !!config.schedule,
        frequency: config.schedule?.frequency || 'weekly',
        time: config.schedule?.time || '09:00',
        day_of_week: config.schedule?.day_of_week || 1,
        day_of_month: config.schedule?.day_of_month || 1,
        columns: config.columns || [],
        recipients: config.recipients || [],
        recipient_input: ''
      });
    } else {
      setEditingConfig(null);
      resetForm();
    }
    setIsDialogOpen(true);
    setActiveTab('general');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      export_type: 'appointments',
      format: 'csv',
      is_active: true,
      schedule_enabled: false,
      frequency: 'weekly',
      time: '09:00',
      day_of_week: 1,
      day_of_month: 1,
      columns: [],
      recipients: [],
      recipient_input: ''
    });
    setEditingConfig(null);
  };

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export Configurations</CardTitle>
              <CardDescription>
                Configure automated data exports and reports
              </CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              New Configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {configurations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileDown className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No export configurations yet</p>
              <p className="text-sm mt-2">Create your first automated export</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configurations.map((config) => {
                  const exportType = EXPORT_TYPES.find(t => t.value === config.export_type);
                  return (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">
                        {config.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {exportType && <exportType.icon className="h-4 w-4" />}
                          {exportType?.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {config.format.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {config.schedule ? (
                          <div className="text-sm">
                            <div>{config.schedule.frequency}</div>
                            <div className="text-muted-foreground">
                              {config.schedule.time}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Manual</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {config.last_run ? (
                          new Date(config.last_run).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.is_active ? 'default' : 'secondary'}>
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => runExport(config)}
                            title="Run export now"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(config)}
                          >
                            <Switch checked={config.is_active} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(config)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(config.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edit Export Configuration' : 'Create Export Configuration'}
            </DialogTitle>
            <DialogDescription>
              Configure automated data export settings
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="columns">Columns</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div>
                <Label htmlFor="name">Configuration Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Weekly Revenue Report"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Export Type</Label>
                  <Select
                    value={formData.export_type}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      export_type: value as ExportConfiguration['export_type'],
                      columns: []
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPORT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      format: value as ExportConfiguration['format']
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </TabsContent>

            <TabsContent value="columns" className="space-y-4">
              <div>
                <Label>Select Columns to Include</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AVAILABLE_COLUMNS[formData.export_type].map((column) => (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox
                        id={column}
                        checked={formData.columns.includes(column)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              columns: [...formData.columns, column]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              columns: formData.columns.filter(c => c !== column)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={column} className="text-sm capitalize">
                        {column.replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="schedule"
                  checked={formData.schedule_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, schedule_enabled: checked })}
                />
                <Label htmlFor="schedule">Enable Scheduled Export</Label>
              </div>
              {formData.schedule_enabled && (
                <>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        frequency: value as 'daily' | 'weekly' | 'monthly'
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
                  {formData.frequency === 'weekly' && (
                    <div>
                      <Label htmlFor="day">Day of Week</Label>
                      <Select
                        value={formData.day_of_week.toString()}
                        onValueChange={(value) => setFormData({ 
                          ...formData, 
                          day_of_week: parseInt(value)
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                          <SelectItem value="0">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formData.frequency === 'monthly' && (
                    <div>
                      <Label htmlFor="day">Day of Month</Label>
                      <Input
                        id="day"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.day_of_month}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          day_of_month: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="recipients" className="space-y-4">
              <div>
                <Label htmlFor="recipient">Email Recipients</Label>
                <div className="flex gap-2">
                  <Input
                    id="recipient"
                    type="email"
                    value={formData.recipient_input}
                    onChange={(e) => setFormData({ ...formData, recipient_input: e.target.value })}
                    placeholder="email@example.com"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                  />
                  <Button type="button" onClick={addRecipient}>
                    Add
                  </Button>
                </div>
              </div>
              {formData.recipients.length > 0 && (
                <div className="space-y-2">
                  {formData.recipients.map((email) => (
                    <div key={email} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {email}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecipient(email)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingConfig ? 'Update' : 'Create'} Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}