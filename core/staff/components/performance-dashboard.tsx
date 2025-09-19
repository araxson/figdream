'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Users,
  Clock,
  DollarSign,
  Star,
  Calendar,
  BarChart3,
  Activity,
  ChevronUp,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { StaffPerformance, PerformanceGoal, StaffPerformanceSummary } from '../types';

interface PerformanceDashboardProps {
  staffId: string;
  performance?: StaffPerformance;
  goals?: PerformanceGoal[];
  summary?: StaffPerformanceSummary;
  onGoalUpdate?: (goal: PerformanceGoal) => void;
  onReviewRequest?: () => void;
}

export function PerformanceDashboard({
  staffId,
  performance,
  goals = [],
  summary,
  onGoalUpdate,
  onReviewRequest
}: PerformanceDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  const getMetricChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, trend: 'neutral' as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
    };
  };

  const getGoalProgress = (goal: PerformanceGoal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getGoalStatus = (goal: PerformanceGoal) => {
    const progress = getGoalProgress(goal);
    const today = new Date();
    const endDate = new Date(goal.period_end);
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (progress >= 100) return { color: 'default' as const, text: 'Achieved' };
    if (daysRemaining < 7 && progress < 50) return { color: 'destructive' as const, text: 'At Risk' };
    if (progress >= 75) return { color: 'secondary' as const, text: 'On Track' };
    return { color: 'outline' as const, text: 'In Progress' };
  };

  const MetricCard = ({
    title,
    value,
    previousValue,
    format = 'number',
    icon: Icon,
    color = 'blue'
  }: {
    title: string;
    value: number;
    previousValue?: number;
    format?: 'number' | 'percentage' | 'currency' | 'duration';
    icon: any;
    color?: string;
  }) => {
    const change = previousValue ? getMetricChange(value, previousValue) : null;

    const formatValue = (val: number) => {
      switch (format) {
        case 'percentage':
          return `${val}%`;
        case 'currency':
          return `$${val.toLocaleString()}`;
        case 'duration':
          return `${Math.floor(val / 60)}h ${val % 60}m`;
        default:
          return val.toLocaleString();
      }
    };

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={`h-4 w-4 text-${color}-500`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          {change && (
            <div className="flex items-center gap-1 mt-1">
              {change.trend === 'up' ? (
                <ChevronUp className="h-4 w-4 text-green-500" />
              ) : change.trend === 'down' ? (
                <ChevronDown className="h-4 w-4 text-red-500" />
              ) : null}
              <span className={`text-xs ${
                change.trend === 'up' ? 'text-green-500' :
                change.trend === 'down' ? 'text-red-500' :
                'text-muted-foreground'
              }`}>
                {change.value.toFixed(1)}% from last period
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Track your performance metrics and goals</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          {onReviewRequest && (
            <Button variant="outline" onClick={onReviewRequest}>
              Request Review
            </Button>
          )}
        </div>
      </div>

      {summary && (
        <Alert>
          <Award className="h-4 w-4" />
          <AlertDescription>
            You're currently ranked #{summary.rank} among all staff members with a {summary.average_rating.toFixed(1)} star rating!
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Appointments"
              value={performance?.total_appointments || 0}
              previousValue={50}
              icon={Calendar}
              color="blue"
            />
            <MetricCard
              title="Completion Rate"
              value={performance?.completed_appointments ?
                (performance.completed_appointments / performance.total_appointments) * 100 : 0}
              format="percentage"
              icon={Activity}
              color="green"
            />
            <MetricCard
              title="Average Rating"
              value={performance?.average_rating || 0}
              previousValue={4.2}
              icon={Star}
              color="yellow"
            />
            <MetricCard
              title="Revenue Generated"
              value={summary?.revenue_generated || 0}
              previousValue={8500}
              format="currency"
              icon={DollarSign}
              color="purple"
            />
          </div>

          {performance && (
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>Your top performing services this period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performance.top_services && (performance.top_services as any[]).map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.count} appointments
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${service.revenue}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg: ${(service.revenue / service.count).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Utilization Rate"
              value={performance?.utilization_rate || 0}
              previousValue={72}
              format="percentage"
              icon={Clock}
              color="blue"
            />
            <MetricCard
              title="Service Time"
              value={performance?.total_service_minutes || 0}
              previousValue={2400}
              format="duration"
              icon={Activity}
              color="green"
            />
            <MetricCard
              title="Services Per Day"
              value={performance?.services_per_day || 0}
              previousValue={5.2}
              icon={BarChart3}
              color="purple"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Time Management</CardTitle>
              <CardDescription>How you're spending your working hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Productive Time</span>
                  <span className="text-sm font-medium">
                    {performance?.utilization_rate || 0}%
                  </span>
                </div>
                <Progress value={performance?.utilization_rate || 0} />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Gap Time</span>
                  <span className="text-sm font-medium">
                    {performance?.gap_time_minutes ?
                      `${Math.floor(performance.gap_time_minutes / 60)}h ${performance.gap_time_minutes % 60}m` :
                      '0h 0m'}
                  </span>
                </div>
                <Progress
                  value={performance?.gap_time_minutes ?
                    (performance.gap_time_minutes / performance.total_available_minutes) * 100 : 0}
                  className="bg-yellow-100"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Overtime</span>
                  <span className="text-sm font-medium">
                    {performance?.overtime_minutes ?
                      `${Math.floor(performance.overtime_minutes / 60)}h ${performance.overtime_minutes % 60}m` :
                      '0h 0m'}
                  </span>
                </div>
                <Progress
                  value={performance?.overtime_minutes ?
                    Math.min((performance.overtime_minutes / 120) * 100, 100) : 0}
                  className="bg-red-100"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Customers"
              value={performance?.unique_customers || 0}
              previousValue={45}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="New Customers"
              value={performance?.new_customers || 0}
              previousValue={8}
              icon={TrendingUp}
              color="green"
            />
            <MetricCard
              title="Retention Rate"
              value={performance?.customer_retention_rate || 0}
              previousValue={82}
              format="percentage"
              icon={Target}
              color="purple"
            />
            <MetricCard
              title="Rebook Rate"
              value={performance?.rebook_rate || 0}
              previousValue={65}
              format="percentage"
              icon={Calendar}
              color="orange"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
              <CardDescription>Recent reviews and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold">
                      {performance?.average_rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-muted-foreground">
                      ({performance?.total_reviews || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        className={`h-4 w-4 ${
                          rating <= (performance?.average_rating || 0)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-12">5 ★</span>
                    <Progress
                      value={performance?.five_star_reviews && performance?.total_reviews ?
                        (performance.five_star_reviews / performance.total_reviews) * 100 : 0}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12">
                      {performance?.five_star_reviews || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No goals set for this period</p>
                <Button variant="outline" className="mt-4">Set New Goal</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal);
                const status = getGoalStatus(goal);

                return (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <CardDescription>{goal.description}</CardDescription>
                        </div>
                        <Badge variant={status.color}>{status.text}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm font-medium">
                            {goal.current_value} / {goal.target_value}
                          </span>
                        </div>
                        <Progress value={progress} />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Period: {goal.period_start} - {goal.period_end}
                        </span>
                        {goal.reward && (
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span>{goal.reward}</span>
                          </div>
                        )}
                      </div>

                      {onGoalUpdate && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => onGoalUpdate(goal)}
                        >
                          Update Progress
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}