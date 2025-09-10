'use client'

import { PlatformMetrics } from './platform-metrics'
import { UsageAnalytics } from './usage-analytics'
import { RevenueAnalytics } from './revenue-analytics'
import { UserGrowth } from '../platform/user-growth/user-growth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download, Calendar } from 'lucide-react'
import { useState } from 'react'

export function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform-wide analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            This Month
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <PlatformMetrics />
        </TabsContent>
        
        <TabsContent value="usage" className="mt-6">
          <UsageAnalytics />
        </TabsContent>
        
        <TabsContent value="revenue" className="mt-6">
          <RevenueAnalytics />
        </TabsContent>
        
        <TabsContent value="growth" className="mt-6">
          <UserGrowth />
        </TabsContent>
      </Tabs>
    </div>
  )
}