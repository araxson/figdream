import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RevenueAreaChart } from '@/components/features/analytics/charts/revenue-area-chart'
import { RevenueBarChart } from '@/components/features/analytics/charts/revenue-bar-chart'
import { ChartDataItem } from '@/types/features/revenue-types'

interface AnalyticsPageContentProps {
  revenueData: ChartDataItem[]
}

export function AnalyticsPageContent({ revenueData }: AnalyticsPageContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your business performance and revenue</p>
      </div>

      <Tabs defaultValue="area" className="space-y-4">
        <TabsList>
          <TabsTrigger value="area">Area Chart</TabsTrigger>
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
        </TabsList>
        
        <TabsContent value="area">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Daily revenue breakdown for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueAreaChart data={revenueData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bar">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Comparison</CardTitle>
              <CardDescription>Compare revenue across different periods</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueBarChart data={revenueData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}