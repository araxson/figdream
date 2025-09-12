'use client'

import { SalonSettings } from './salon-settings'
import { EmailSettings as NotificationSettings } from './email'
import { SettingsPayment as PaymentSettings } from './business/payment-settings'
import { IntegrationSettings } from './business/integrations'
import { SettingsSecurity as SecuritySettings } from './security/security-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

export function OwnerSettings() {
  const [activeTab, setActiveTab] = useState('salon')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your salon settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="salon">Salon</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="salon" className="mt-6">
          <SalonSettings />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="payment" className="mt-6">
          <PaymentSettings />
        </TabsContent>
        
        <TabsContent value="integrations" className="mt-6">
          <IntegrationSettings />
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}