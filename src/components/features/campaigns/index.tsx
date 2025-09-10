'use client'

import { CampaignsList } from './campaigns-list'
import { CampaignBuilder } from './builder'
import { CampaignMetrics } from './campaigns-metrics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export function OwnerCampaigns() {
  const [activeTab, setActiveTab] = useState('campaigns')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
          <p className="text-muted-foreground">Create and manage marketing campaigns</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="campaigns" className="mt-6">
          <CampaignsList />
        </TabsContent>
        
        <TabsContent value="builder" className="mt-6">
          <CampaignBuilder />
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-6">
          <CampaignMetrics />
        </TabsContent>
      </Tabs>
    </div>
  )
}