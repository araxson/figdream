'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Badge, Button, Progress } from '@/components/ui'
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  DollarSign,
  Calendar,
  UserMinus,
  Target,
  Brain,
  Sparkles
} from 'lucide-react'
import DemandForecastChart from './demand-forecast-chart'
import ChurnRiskList from './churn-risk-list'
import RevenueProjectionChart from './revenue-projection-chart'
import StaffingOptimizationTable from './staffing-optimization-table'
import type { Database } from '@/types/database.types'

// Define proper types based on database schema
type AnalyticsPrediction = Database['public']['Tables']['analytics_predictions']['Row']
type AnalyticsPattern = Database['public']['Tables']['analytics_patterns']['Row']

interface DemandForecast {
  forecast: Array<{
    date: string
    dayOfWeek: string
    predicted: number
    confidence: number
    peakHours: string[]
  }>
  confidence: number
  accuracy: number
}

interface ChurnPrediction {
  customers: Array<{
    id: string
    name: string
    email: string
    riskScore: number
    riskLevel: 'high' | 'medium' | 'low'
    lastVisit: string
    totalSpent: number
    visitFrequency: number
    factors: string[]
  }>
  statistics: {
    highRisk: number
    mediumRisk: number
    lowRisk: number
    averageRisk: number
  }
}

interface RevenueProjection {
  projections: Array<{
    month: string
    projected: number
    optimistic: number
    pessimistic: number
    confidence: number
  }>
  yearTotal: number
  growthRate: number
}

interface StaffingOptimization {
  recommendations: Array<{
    day: string
    date: string
    currentStaff: number
    recommendedStaff: number
    expectedDemand: number
    efficiency: number
    shifts: Array<{
      startTime: string
      endTime: string
      staffCount: number
    }>
  }>
  efficiency: number
}

interface PredictiveDashboardProps {
  demandForecast: DemandForecast
  churnPrediction: ChurnPrediction
  revenueProjection: RevenueProjection
  staffingOptimization: StaffingOptimization
}

export default function PredictiveDashboard({
  demandForecast,
  churnPrediction,
  revenueProjection,
  staffingOptimization
}: PredictiveDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Predictive Analytics</h2>
          <p className="text-muted-foreground">AI-powered insights and forecasts</p>
        </div>
      </div>

      {/* Key Predictions Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Next 7 Days Demand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {demandForecast.forecast.slice(0, 7).reduce((sum, day) => sum + day.predicted, 0)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expected bookings
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              {demandForecast.confidence}% confidence
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Churn Risk Customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserMinus className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">
                {churnPrediction.statistics.highRisk}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Need immediate attention
            </p>
            <div className="flex gap-1 mt-2">
              <Badge variant="destructive" className="text-xs">
                High: {churnPrediction.statistics.highRisk}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Med: {churnPrediction.statistics.mediumRisk}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>3-Month Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">
                {formatCurrency(
                  revenueProjection.projections.reduce((sum, month) => sum + month.projected, 0)
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Projected revenue
            </p>
            {revenueProjection.currentTrend.trend === 'up' ? (
              <Badge variant="default" className="mt-2 text-xs gap-1">
                <TrendingUp className="h-3 w-3" />
                Growing {(revenueProjection.currentTrend.growthRate * 100).toFixed(1)}%
              </Badge>
            ) : (
              <Badge variant="secondary" className="mt-2 text-xs gap-1">
                <TrendingDown className="h-3 w-3" />
                Declining {Math.abs(revenueProjection.currentTrend.growthRate * 100).toFixed(1)}%
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Staffing Efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">
                {staffingOptimization.efficiency.toFixed(0)}%
              </span>
            </div>
            <Progress value={staffingOptimization.efficiency} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Optimal staff coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Predictions */}
      <Tabs defaultValue="demand" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="churn">Churn Prevention</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Projection</TabsTrigger>
          <TabsTrigger value="staffing">Staff Optimization</TabsTrigger>
        </TabsList>

        {/* Demand Forecast Tab */}
        <TabsContent value="demand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Demand Forecast</CardTitle>
              <CardDescription>
                Predicted booking volume based on historical patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemandForecastChart forecast={demandForecast.forecast} />
              
              {/* Insights */}
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {demandForecast.insights.map((insight: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Peak Hours Preview */}
              <div className="mt-6 grid gap-4 md:grid-cols-7">
                {demandForecast.forecast.slice(0, 7).map((day) => (
                  <div key={day.date} className="text-center space-y-1">
                    <p className="text-xs font-medium">{day.dayOfWeek}</p>
                    <Badge variant="outline">{day.predicted}</Badge>
                    <div className="text-xs text-muted-foreground">
                      {day.peakHours.slice(0, 2).map((hour: number) => `${hour}:00`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Churn Prevention Tab */}
        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Churn Risk Analysis</CardTitle>
                  <CardDescription>
                    Customers at risk of leaving - immediate action recommended
                  </CardDescription>
                </div>
                <Button>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Launch Win-Back Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChurnRiskList customers={churnPrediction.atRisk} />
              
              {/* Churn Statistics */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Customers</span>
                      <span className="font-semibold">{churnPrediction.statistics.totalCustomers}</span>
                    </div>
                    <Progress 
                      value={100} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">At Risk</span>
                      <span className="font-semibold text-orange-600">
                        {churnPrediction.statistics.highRisk + churnPrediction.statistics.mediumRisk}
                      </span>
                    </div>
                    <Progress 
                      value={(churnPrediction.statistics.highRisk + churnPrediction.statistics.mediumRisk) / churnPrediction.statistics.totalCustomers * 100} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Safe</span>
                      <span className="font-semibold text-green-600">
                        {churnPrediction.statistics.lowRisk}
                      </span>
                    </div>
                    <Progress 
                      value={churnPrediction.statistics.lowRisk / churnPrediction.statistics.totalCustomers * 100} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Action Recommendations */}
              <div className="mt-6 bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium">Recommended Actions</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    Send personalized offers to high-risk customers
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Schedule follow-up calls for inactive customers
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Create loyalty rewards for returning customers
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Analyze service feedback from at-risk segment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Projection Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Projections</CardTitle>
              <CardDescription>
                Expected revenue for the next 3 months with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueProjectionChart projections={revenueProjection.projections} />
              
              {/* Projection Details */}
              <div className="mt-6 space-y-3">
                {revenueProjection.projections.map((month) => (
                  <Card key={month.month}>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{month.month}</span>
                        <Badge variant="outline" className="text-xs">
                          {month.confidence}% confidence
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Pessimistic</p>
                          <p className="font-semibold">{formatCurrency(month.pessimistic)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected</p>
                          <p className="font-semibold text-primary">{formatCurrency(month.projected)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Optimistic</p>
                          <p className="font-semibold text-green-600">{formatCurrency(month.optimistic)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Revenue Insights */}
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Revenue Insights
                </h4>
                <ul className="space-y-2">
                  {revenueProjection.insights.map((insight: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staffing Optimization Tab */}
        <TabsContent value="staffing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Scheduling Optimization</CardTitle>
              <CardDescription>
                Optimal staffing recommendations based on predicted demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffingOptimizationTable recommendations={staffingOptimization.recommendations} />
              
              {/* Staffing Insights */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="space-y-3">
                    <h4 className="text-sm font-medium">Staffing Insights</h4>
                    <ul className="space-y-2">
                      {staffingOptimization.insights.map((insight: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="space-y-3">
                    <h4 className="text-sm font-medium">Optimization Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Adjust staff schedules for peak days
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Request overtime for understaffed periods
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Cross-train staff for flexibility
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}