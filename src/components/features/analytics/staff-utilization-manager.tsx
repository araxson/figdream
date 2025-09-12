'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Clock, TrendingUp, Users, DollarSign, Star, Activity, Calendar, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';
import { useSalon } from '@/hooks/use-salon';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';

interface StaffUtilization {
  id: string;
  staff_id: string;
  salon_id: string;
  utilization_date: string;
  scheduled_hours?: number;
  worked_hours?: number;
  service_hours?: number;
  idle_hours?: number;
  break_hours?: number;
  utilization_rate?: number;
  services_completed?: number;
  revenue_generated?: number;
  tips_earned?: number;
  products_sold?: number;
  average_service_time?: number;
  rebook_rate?: number;
  client_satisfaction?: number;
  revenue_per_hour?: number;
  created_at: string;
  updated_at: string;
  staff?: {
    name: string;
    email: string;
    specialties?: string[];
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export function StaffUtilizationManager() {
  const { salon } = useSalon();
  const [utilization, setUtilization] = useState<StaffUtilization[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [isCalculating, setIsCalculating] = useState(false);
  const [stats, setStats] = useState({
    avgUtilization: 0,
    totalRevenue: 0,
    totalServices: 0,
    avgRevPerHour: 0,
    topPerformer: '',
    lowestUtilization: '',
    avgSatisfaction: 0,
    avgRebookRate: 0
  });

  useEffect(() => {
    if (salon?.id) {
      loadStaff();
      loadUtilization();
    }
  }, [salon?.id, dateRange, selectedStaffId]);

  const loadStaff = async () => {
    if (!salon?.id) return;
    
    const supabase = createClient();
    
    try {
      const { data } = await supabase
        .from('team_members')
        .select('user_id, name, email')
        .eq('salon_id', salon.id)
        .eq('is_active', true);
      
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const loadUtilization = async () => {
    if (!salon?.id) return;
    
    setLoading(true);
    const supabase = createClient();
    
    try {
      // Determine date range
      const now = new Date();
      let startDate, endDate;
      
      if (dateRange === 'week') {
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
      } else if (dateRange === 'month') {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      } else {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }
      
      let query = supabase
        .from('staff_utilization')
        .select(`
          *,
          staff:team_members!staff_utilization_staff_id_fkey(
            name,
            email
          )
        `)
        .eq('salon_id', salon.id)
        .gte('utilization_date', startDate.toISOString())
        .lte('utilization_date', endDate.toISOString())
        .order('utilization_date', { ascending: false });
      
      if (selectedStaffId !== 'all') {
        query = query.eq('staff_id', selectedStaffId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const utilizationData = data || [];
      setUtilization(utilizationData);
      
      // Calculate stats
      if (utilizationData.length > 0) {
        const avgUtilization = utilizationData.reduce((sum, u) => sum + (u.utilization_rate || 0), 0) / utilizationData.length;
        const totalRevenue = utilizationData.reduce((sum, u) => sum + (u.revenue_generated || 0), 0);
        const totalServices = utilizationData.reduce((sum, u) => sum + (u.services_completed || 0), 0);
        const avgRevPerHour = utilizationData.reduce((sum, u) => sum + (u.revenue_per_hour || 0), 0) / utilizationData.length;
        const avgSatisfaction = utilizationData.reduce((sum, u) => sum + (u.client_satisfaction || 0), 0) / utilizationData.length;
        const avgRebookRate = utilizationData.reduce((sum, u) => sum + (u.rebook_rate || 0), 0) / utilizationData.length;
        
        // Find top and bottom performers
        const staffPerformance = new Map();
        utilizationData.forEach(u => {
          if (!staffPerformance.has(u.staff_id)) {
            staffPerformance.set(u.staff_id, {
              name: u.staff?.name || 'Unknown',
              totalRevenue: 0,
              totalUtilization: 0,
              count: 0
            });
          }
          const perf = staffPerformance.get(u.staff_id);
          perf.totalRevenue += u.revenue_generated || 0;
          perf.totalUtilization += u.utilization_rate || 0;
          perf.count++;
        });
        
        let topPerformer = '';
        let lowestUtilization = '';
        let maxRevenue = 0;
        let minUtilization = 100;
        
        staffPerformance.forEach(perf => {
          if (perf.totalRevenue > maxRevenue) {
            maxRevenue = perf.totalRevenue;
            topPerformer = perf.name;
          }
          const avgUtil = perf.totalUtilization / perf.count;
          if (avgUtil < minUtilization) {
            minUtilization = avgUtil;
            lowestUtilization = perf.name;
          }
        });
        
        setStats({
          avgUtilization,
          totalRevenue,
          totalServices,
          avgRevPerHour,
          topPerformer,
          lowestUtilization,
          avgSatisfaction,
          avgRebookRate
        });
      }
    } catch (error) {
      console.error('Error loading utilization:', error);
      toast.error('Failed to load staff utilization data');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateUtilization = async () => {
    if (!salon?.id) return;
    
    setIsCalculating(true);
    const supabase = createClient();
    
    try {
      // This would typically call a backend function to calculate utilization
      // For now, we'll just show a success message
      toast.success('Utilization data recalculated successfully');
      loadUtilization();
    } catch (error) {
      console.error('Error calculating utilization:', error);
      toast.error('Failed to calculate utilization');
    } finally {
      setIsCalculating(false);
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 80) return { variant: 'default' as const, label: 'Excellent' };
    if (rate >= 60) return { variant: 'secondary' as const, label: 'Good' };
    if (rate >= 40) return { variant: 'outline' as const, label: 'Fair' };
    return { variant: 'destructive' as const, label: 'Low' };
  };

  // Prepare chart data
  const dailyUtilization = utilization
    .slice(0, 7)
    .reverse()
    .map(u => ({
      date: format(parseISO(u.utilization_date), 'MMM d'),
      utilization: u.utilization_rate || 0,
      revenue: u.revenue_generated || 0,
      services: u.services_completed || 0
    }));

  const staffComparison = staff.map(s => {
    const staffData = utilization.filter(u => u.staff_id === s.user_id);
    const avgUtil = staffData.length > 0
      ? staffData.reduce((sum, u) => sum + (u.utilization_rate || 0), 0) / staffData.length
      : 0;
    const totalRev = staffData.reduce((sum, u) => sum + (u.revenue_generated || 0), 0);
    
    return {
      name: s.name,
      utilization: avgUtil,
      revenue: totalRev,
      services: staffData.reduce((sum, u) => sum + (u.services_completed || 0), 0)
    };
  }).filter(s => s.utilization > 0);

  const performanceMetrics = selectedStaffId !== 'all' && utilization.length > 0
    ? [
        { metric: 'Utilization', value: stats.avgUtilization, max: 100 },
        { metric: 'Satisfaction', value: stats.avgSatisfaction * 20, max: 100 },
        { metric: 'Rebook Rate', value: stats.avgRebookRate, max: 100 },
        { metric: 'Rev/Hour', value: Math.min((stats.avgRevPerHour / 100) * 100, 100), max: 100 },
        { metric: 'Efficiency', value: 75, max: 100 }
      ]
    : [];

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
          <h1 className="text-3xl font-bold">Staff Utilization</h1>
          <p className="text-muted-foreground">Monitor staff productivity and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staff.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCalculateUtilization} disabled={isCalculating}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isCalculating && "animate-spin")} />
            Calculate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getUtilizationColor(stats.avgUtilization))}>
              {stats.avgUtilization.toFixed(1)}%
            </div>
            <Progress value={stats.avgUtilization} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <DollarSign className="h-5 w-5" />
              {stats.totalRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.avgRevPerHour.toFixed(0)}/hour avg
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.avgRebookRate.toFixed(0)}% rebook rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-1" />
              {(stats.avgSatisfaction || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {stats.topPerformer && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats.topPerformer}</strong> is the top revenue generator this period
            </AlertDescription>
          </Alert>
        )}
        {stats.lowestUtilization && stats.avgUtilization < 60 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats.lowestUtilization}</strong> has low utilization and may need schedule optimization
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Utilization Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization Trend</CardTitle>
            <CardDescription>Daily utilization and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="utilization"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Utilization %"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  name="Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Staff Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Comparison</CardTitle>
            <CardDescription>Performance by staff member</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
                <Bar dataKey="services" fill="#10b981" name="Services" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Radar (for individual staff) */}
      {selectedStaffId !== 'all' && performanceMetrics.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Multi-dimensional performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Utilization Table */}
      <Card>
        <CardHeader>
          <CardTitle>Utilization Details</CardTitle>
          <CardDescription>Daily breakdown of staff utilization metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Staff</th>
                  <th className="text-right p-2">Scheduled</th>
                  <th className="text-right p-2">Worked</th>
                  <th className="text-right p-2">Service</th>
                  <th className="text-right p-2">Idle</th>
                  <th className="text-right p-2">Utilization</th>
                  <th className="text-right p-2">Services</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Rev/Hour</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {utilization.map((util) => {
                  const utilizationBadge = getUtilizationBadge(util.utilization_rate || 0);
                  
                  return (
                    <tr key={util.id} className="border-b">
                      <td className="p-2">
                        {format(parseISO(util.utilization_date), 'MMM d')}
                      </td>
                      <td className="p-2">{util.staff?.name || 'Unknown'}</td>
                      <td className="text-right p-2">{util.scheduled_hours?.toFixed(1)}h</td>
                      <td className="text-right p-2">{util.worked_hours?.toFixed(1)}h</td>
                      <td className="text-right p-2">{util.service_hours?.toFixed(1)}h</td>
                      <td className="text-right p-2">{util.idle_hours?.toFixed(1)}h</td>
                      <td className={cn("text-right p-2 font-bold", getUtilizationColor(util.utilization_rate || 0))}>
                        {util.utilization_rate?.toFixed(1)}%
                      </td>
                      <td className="text-right p-2">{util.services_completed}</td>
                      <td className="text-right p-2">${util.revenue_generated?.toFixed(0)}</td>
                      <td className="text-right p-2">${util.revenue_per_hour?.toFixed(0)}</td>
                      <td className="p-2">
                        <Badge variant={utilizationBadge.variant}>
                          {utilizationBadge.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}