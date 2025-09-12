'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { DollarSign, TrendingUp, TrendingDown, Clock, Calculator, RefreshCw, AlertCircle, BarChart3, Package } from 'lucide-react';
import { useSalon } from '@/hooks/use-salon';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ServiceCost {
  id: string;
  service_id: string;
  salon_id: string;
  product_cost?: number;
  supply_cost?: number;
  equipment_cost?: number;
  overhead_allocation?: number;
  total_cost?: number;
  average_duration_minutes?: number;
  setup_time_minutes?: number;
  cleanup_time_minutes?: number;
  average_price?: number;
  gross_margin?: number;
  margin_percentage?: number;
  last_calculated_at?: string;
  created_at: string;
  updated_at: string;
  service?: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    category?: {
      name: string;
    };
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ServiceCostsManager() {
  const { salon } = useSalon();
  const [serviceCosts, setServiceCosts] = useState<ServiceCost[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceCost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [stats, setStats] = useState({
    avgMargin: 0,
    highestMargin: 0,
    lowestMargin: 0,
    totalRevenue: 0,
    totalCosts: 0,
    totalProfit: 0
  });
  const [costForm, setCostForm] = useState({
    product_cost: 0,
    supply_cost: 0,
    equipment_cost: 0,
    overhead_allocation: 0,
    average_duration_minutes: 0,
    setup_time_minutes: 0,
    cleanup_time_minutes: 0
  });

  useEffect(() => {
    if (salon?.id) {
      loadServiceCosts();
      loadServices();
    }
  }, [salon?.id]);

  const loadServiceCosts = async () => {
    if (!salon?.id) return;
    
    setLoading(true);
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('service_costs')
        .select(`
          *,
          service:services(
            name,
            description,
            price,
            duration,
            category:service_categories(name)
          )
        `)
        .eq('salon_id', salon.id)
        .order('margin_percentage', { ascending: true });

      if (error) throw error;
      
      const costs = data || [];
      setServiceCosts(costs);
      
      // Calculate stats
      if (costs.length > 0) {
        const margins = costs.map(c => c.margin_percentage || 0).filter(m => m > 0);
        const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
        const highestMargin = Math.max(...margins);
        const lowestMargin = Math.min(...margins);
        
        const totalRevenue = costs.reduce((sum, c) => sum + (c.average_price || 0), 0);
        const totalCosts = costs.reduce((sum, c) => sum + (c.total_cost || 0), 0);
        const totalProfit = costs.reduce((sum, c) => sum + (c.gross_margin || 0), 0);
        
        setStats({
          avgMargin,
          highestMargin,
          lowestMargin,
          totalRevenue,
          totalCosts,
          totalProfit
        });
      }
    } catch (error) {
      console.error('Error loading service costs:', error);
      toast.error('Failed to load service costs');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    if (!salon?.id) return;
    
    const supabase = createClient();
    
    try {
      const { data } = await supabase
        .from('services')
        .select('id, name, price, duration')
        .eq('salon_id', salon.id)
        .eq('is_active', true);
      
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleUpdateCosts = async () => {
    if (!selectedService || !salon?.id) return;
    
    const supabase = createClient();
    
    try {
      const totalCost = (costForm.product_cost || 0) + 
                       (costForm.supply_cost || 0) + 
                       (costForm.equipment_cost || 0) + 
                       (costForm.overhead_allocation || 0);
      
      const averagePrice = selectedService.service?.price || 0;
      const grossMargin = averagePrice - totalCost;
      const marginPercentage = averagePrice > 0 ? (grossMargin / averagePrice) * 100 : 0;
      
      const { error } = await supabase
        .from('service_costs')
        .update({
          ...costForm,
          total_cost: totalCost,
          average_price: averagePrice,
          gross_margin: grossMargin,
          margin_percentage: marginPercentage,
          last_calculated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedService.id);
      
      if (error) throw error;
      
      toast.success('Service costs updated successfully');
      setIsEditDialogOpen(false);
      loadServiceCosts();
    } catch (error) {
      console.error('Error updating costs:', error);
      toast.error('Failed to update service costs');
    }
  };

  const handleRecalculateAll = async () => {
    if (!salon?.id) return;
    
    setIsCalculating(true);
    const supabase = createClient();
    
    try {
      // Get all services without costs
      const { data: servicesData } = await supabase
        .from('services')
        .select('id, price')
        .eq('salon_id', salon.id)
        .eq('is_active', true);
      
      if (!servicesData) return;
      
      // Check which services don't have cost records
      const { data: existingCosts } = await supabase
        .from('service_costs')
        .select('service_id')
        .eq('salon_id', salon.id);
      
      const existingServiceIds = new Set(existingCosts?.map(c => c.service_id) || []);
      const newServices = servicesData.filter(s => !existingServiceIds.has(s.id));
      
      // Create cost records for new services
      if (newServices.length > 0) {
        const newCostRecords = newServices.map(service => ({
          service_id: service.id,
          salon_id: salon.id,
          product_cost: 0,
          supply_cost: 0,
          equipment_cost: 0,
          overhead_allocation: 0,
          total_cost: 0,
          average_price: service.price,
          gross_margin: service.price,
          margin_percentage: 100,
          last_calculated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error } = await supabase
          .from('service_costs')
          .insert(newCostRecords);
        
        if (error) throw error;
      }
      
      // Recalculate all existing costs
      for (const cost of serviceCosts) {
        const totalCost = (cost.product_cost || 0) + 
                         (cost.supply_cost || 0) + 
                         (cost.equipment_cost || 0) + 
                         (cost.overhead_allocation || 0);
        
        const averagePrice = cost.service?.price || 0;
        const grossMargin = averagePrice - totalCost;
        const marginPercentage = averagePrice > 0 ? (grossMargin / averagePrice) * 100 : 0;
        
        await supabase
          .from('service_costs')
          .update({
            total_cost: totalCost,
            average_price: averagePrice,
            gross_margin: grossMargin,
            margin_percentage: marginPercentage,
            last_calculated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', cost.id);
      }
      
      toast.success('All service costs recalculated');
      loadServiceCosts();
    } catch (error) {
      console.error('Error recalculating costs:', error);
      toast.error('Failed to recalculate costs');
    } finally {
      setIsCalculating(false);
    }
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 70) return 'text-green-600';
    if (margin >= 50) return 'text-blue-600';
    if (margin >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarginBadge = (margin: number) => {
    if (margin >= 70) return { variant: 'default' as const, label: 'Excellent' };
    if (margin >= 50) return { variant: 'secondary' as const, label: 'Good' };
    if (margin >= 30) return { variant: 'outline' as const, label: 'Fair' };
    return { variant: 'destructive' as const, label: 'Low' };
  };

  // Prepare chart data
  const marginDistribution = [
    { range: '0-30%', count: serviceCosts.filter(c => (c.margin_percentage || 0) < 30).length },
    { range: '30-50%', count: serviceCosts.filter(c => (c.margin_percentage || 0) >= 30 && (c.margin_percentage || 0) < 50).length },
    { range: '50-70%', count: serviceCosts.filter(c => (c.margin_percentage || 0) >= 50 && (c.margin_percentage || 0) < 70).length },
    { range: '70%+', count: serviceCosts.filter(c => (c.margin_percentage || 0) >= 70).length }
  ];

  const costBreakdown = selectedService ? [
    { name: 'Product', value: selectedService.product_cost || 0 },
    { name: 'Supply', value: selectedService.supply_cost || 0 },
    { name: 'Equipment', value: selectedService.equipment_cost || 0 },
    { name: 'Overhead', value: selectedService.overhead_allocation || 0 }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Service Costs</h1>
          <p className="text-muted-foreground">Analyze service profitability and cost structure</p>
        </div>
        <Button onClick={handleRecalculateAll} disabled={isCalculating}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isCalculating && "animate-spin")} />
          Recalculate All
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getMarginColor(stats.avgMargin))}>
              {stats.avgMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.highestMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lowest Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowestMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCosts.toFixed(0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalProfit.toFixed(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Margin Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Margin Distribution</CardTitle>
            <CardDescription>Services by profit margin range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={marginDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown (if service selected) */}
        {selectedService && (
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>{selectedService.service?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Low Margin Alert */}
        <Card>
          <CardHeader>
            <CardTitle>Margin Alerts</CardTitle>
            <CardDescription>Services needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            {serviceCosts.filter(c => (c.margin_percentage || 0) < 30).length > 0 ? (
              <div className="space-y-2">
                {serviceCosts
                  .filter(c => (c.margin_percentage || 0) < 30)
                  .slice(0, 3)
                  .map(cost => (
                    <Alert key={cost.id}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{cost.service?.name}</strong> has only {cost.margin_percentage?.toFixed(1)}% margin
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">All services have healthy margins</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Cost Analysis</CardTitle>
          <CardDescription>Detailed breakdown of costs and margins for each service</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">Gross Margin</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceCosts.map((cost) => {
                const marginBadge = getMarginBadge(cost.margin_percentage || 0);
                
                return (
                  <TableRow key={cost.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cost.service?.name}</div>
                        {cost.service?.description && (
                          <div className="text-sm text-muted-foreground">
                            {cost.service.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cost.service?.category?.name || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${cost.average_price?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      ${cost.total_cost?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(cost.gross_margin || 0) > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={cn(
                          "font-medium",
                          (cost.gross_margin || 0) > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          ${cost.gross_margin?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={cn("font-bold", getMarginColor(cost.margin_percentage || 0))}>
                        {cost.margin_percentage?.toFixed(1) || '0.0'}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={marginBadge.variant}>
                        {marginBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedService(cost);
                          setCostForm({
                            product_cost: cost.product_cost || 0,
                            supply_cost: cost.supply_cost || 0,
                            equipment_cost: cost.equipment_cost || 0,
                            overhead_allocation: cost.overhead_allocation || 0,
                            average_duration_minutes: cost.average_duration_minutes || 0,
                            setup_time_minutes: cost.setup_time_minutes || 0,
                            cleanup_time_minutes: cost.cleanup_time_minutes || 0
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Costs Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service Costs</DialogTitle>
            <DialogDescription>
              Update cost breakdown for {selectedService?.service?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={costForm.product_cost}
                onChange={(e) => setCostForm({ ...costForm, product_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Supply Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={costForm.supply_cost}
                onChange={(e) => setCostForm({ ...costForm, supply_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Equipment Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={costForm.equipment_cost}
                onChange={(e) => setCostForm({ ...costForm, equipment_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Overhead Allocation</Label>
              <Input
                type="number"
                step="0.01"
                value={costForm.overhead_allocation}
                onChange={(e) => setCostForm({ ...costForm, overhead_allocation: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <Label>Service Duration (min)</Label>
              <Input
                type="number"
                value={costForm.average_duration_minutes}
                onChange={(e) => setCostForm({ ...costForm, average_duration_minutes: parseInt(e.target.value) || 0 })}
                placeholder="60"
              />
            </div>
            <div>
              <Label>Setup Time (min)</Label>
              <Input
                type="number"
                value={costForm.setup_time_minutes}
                onChange={(e) => setCostForm({ ...costForm, setup_time_minutes: parseInt(e.target.value) || 0 })}
                placeholder="5"
              />
            </div>
            <div>
              <Label>Cleanup Time (min)</Label>
              <Input
                type="number"
                value={costForm.cleanup_time_minutes}
                onChange={(e) => setCostForm({ ...costForm, cleanup_time_minutes: parseInt(e.target.value) || 0 })}
                placeholder="5"
              />
            </div>
          </div>

          {/* Cost Summary */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Cost:</span>
                <span className="font-bold">
                  ${((costForm.product_cost || 0) + 
                     (costForm.supply_cost || 0) + 
                     (costForm.equipment_cost || 0) + 
                     (costForm.overhead_allocation || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Price:</span>
                <span className="font-bold">${selectedService?.service?.price?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Gross Margin:</span>
                <span className="font-bold text-green-600">
                  ${((selectedService?.service?.price || 0) - 
                     ((costForm.product_cost || 0) + 
                      (costForm.supply_cost || 0) + 
                      (costForm.equipment_cost || 0) + 
                      (costForm.overhead_allocation || 0))).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCosts}>
              Update Costs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}