'use client'

import { SalonsList } from './list'
import { SalonMetrics } from './metrics'
import { SalonVerification } from './verification'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export function AdminSalons() {
  const [activeTab, setActiveTab] = useState('salons')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salon Management</h1>
          <p className="text-muted-foreground">Manage all salons on the platform</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Salon
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="salons">All Salons</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="salons" className="mt-6">
          <SalonsList />
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-6">
          <SalonMetrics />
        </TabsContent>
        
        <TabsContent value="verification" className="mt-6">
          <SalonVerification />
        </TabsContent>
      </Tabs>
    </div>
  )
}