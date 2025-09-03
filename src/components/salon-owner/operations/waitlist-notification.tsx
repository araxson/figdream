"use client"
import { useState } from "react"

import { Bell, Mail, MessageSquare, Phone, Send, Clock } from "lucide-react"
import { toast } from "sonner"
interface WaitlistNotificationProps {
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceRequested: string
}
export function WaitlistNotification({
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  serviceRequested
}: WaitlistNotificationProps) {
  const [sending, setSending] = useState(false)
  const [notificationMethod, setNotificationMethod] = useState<'email' | 'sms' | 'call'>('email')
  const handleSendNotification = async () => {
    setSending(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success(`Notification sent to ${customerName} via ${notificationMethod}`)
    } catch (error) {
      toast.error("Failed to send notification")
    } finally {
      setSending(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notify Customer
        </CardTitle>
        <CardDescription>
          Send availability notification to {customerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Service: {serviceRequested}</p>
          <div className="flex gap-2">
            <Button
              variant={notificationMethod === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNotificationMethod('email')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              variant={notificationMethod === 'sms' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNotificationMethod('sms')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS
            </Button>
            <Button
              variant={notificationMethod === 'call' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNotificationMethod('call')}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
        <Button onClick={handleSendNotification} disabled={sending} className="w-full">
          <Send className="h-4 w-4 mr-2" />
          {sending ? 'Sending...' : 'Send Notification'}
        </Button>
      </CardContent>
    </Card>
  )
}
