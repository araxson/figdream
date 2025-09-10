'use client'

import { RevenueReport } from './revenue-report'
import { AppointmentReport } from './appointments-report'
import { CustomerReport } from './customers-report'
import { StaffReport } from './staff-report'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download, Calendar } from 'lucide-react'
import { useState } from 'react'

export function OwnerReports() {
  const [activeTab, setActiveTab] = useState('revenue')
  const [dateRange] = useState('month')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for your salon</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            {dateRange === 'month' ? 'This Month' : 'Custom Range'}
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="mt-6">
          <RevenueReport dateRange={dateRange} />
        </TabsContent>
        
        <TabsContent value="appointments" className="mt-6">
          <AppointmentReport dateRange={dateRange} />
        </TabsContent>
        
        <TabsContent value="customers" className="mt-6">
          <CustomerReport dateRange={dateRange} />
        </TabsContent>
        
        <TabsContent value="staff" className="mt-6">
          <StaffReport dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}