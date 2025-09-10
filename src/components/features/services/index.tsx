'use client'

import { ServicesList } from './services-list'
import { ServiceCategories } from './service-categories'
import { ServicePricing } from './service-pricing'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export function OwnerServices() {
  const [activeTab, setActiveTab] = useState('services')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your service catalog</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">All Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="mt-6">
          <ServicesList />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <ServiceCategories />
        </TabsContent>
        
        <TabsContent value="pricing" className="mt-6">
          <ServicePricing />
        </TabsContent>
      </Tabs>
    </div>
  )
}