'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  History,
  Calendar,
  Download,
  Search
} from 'lucide-react'
import { useState } from 'react'

type NotificationHistory = {
  id: string
  type: 'email' | 'sms' | 'push'
  recipient: string
  subject?: string
  message: string
  status: 'sent' | 'delivered' | 'failed' | 'bounced'
  sent_at: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
}

export function NotificationHistory() {
  const [history] = useState<NotificationHistory[]>([
    {
      id: '1',
      type: 'email',
      recipient: 'sarah.johnson@example.com',
      subject: 'Appointment Reminder',
      message: 'Your appointment is tomorrow at 2:00 PM',
      status: 'delivered',
      sent_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      delivered_at: new Date(Date.now() - 59 * 60 * 1000).toISOString(),
      opened_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'sms',
      recipient: '+1 555-0123',
      message: 'Reminder: Your appointment at Glamour Studio is tomorrow at 2PM',
      status: 'delivered',
      sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      delivered_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000).toISOString()
    },
    {
      id: '3',
      type: 'email',
      recipient: 'michael.chen@example.com',
      subject: 'Thank you for your visit',
      message: 'We hope you enjoyed your service. Please leave a review!',
      status: 'sent',
      sent_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      type: 'push',
      recipient: 'User #12345',
      message: 'Special offer: 20% off your next visit!',
      status: 'delivered',
      sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      delivered_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2000).toISOString()
    },
    {
      id: '5',
      type: 'email',
      recipient: 'emma.wilson@example.com',
      subject: 'Booking Confirmation',
      message: 'Your booking has been confirmed for Jan 25 at 3:00 PM',
      status: 'failed',
      sent_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    }
  ])

  const [filter, setFilter] = useState('all')

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(h => h.type === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default'
      case 'sent': return 'secondary'
      case 'failed': return 'destructive'
      case 'bounced': return 'outline'
      default: return 'outline'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>Notification History</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={setFilter}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
              <TabsTrigger value="push">Push</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <TabsContent value={filter} className="mt-0">
            <div className="space-y-3">
              {filteredHistory.map(item => (
                <div key={item.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">
                        {item.subject || item.message}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        To: {item.recipient}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                  
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Sent: {formatDate(item.sent_at)}</span>
                    {item.delivered_at && (
                      <span>Delivered: {formatDate(item.delivered_at)}</span>
                    )}
                    {item.opened_at && (
                      <span>Opened: {formatDate(item.opened_at)}</span>
                    )}
                    {item.clicked_at && (
                      <span>Clicked: {formatDate(item.clicked_at)}</span>
                    )}
                  </div>
                </div>
              ))}

              {filteredHistory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No notifications found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}