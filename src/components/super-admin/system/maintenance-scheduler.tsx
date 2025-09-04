"use client"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// DatePicker needs to be implemented or use Calendar with Popover
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { useState } from "react"
import { Clock, AlertTriangle, Info, CheckCircle, XCircle, RefreshCw, Bell, Calendar } from "lucide-react"
interface MaintenanceWindow {
  id: string
  title: string
  description: string
  type: 'scheduled' | 'emergency' | 'routine'
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled'
  startTime: string
  endTime: string
  affectedServices: string[]
  notificationSent: boolean
  rollbackPlan: string
}
interface NotificationChannel {
  id: string
  name: string
  type: 'email' | 'sms' | 'webhook' | 'in-app'
  enabled: boolean
  recipients: number
}
interface MaintenanceHistory {
  id: string
  title: string
  date: string
  duration: string
  status: 'success' | 'failed' | 'partial'
  issues: string[]
  rollback: boolean
}
export function MaintenanceScheduler() {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [_selectedMaintenance, _setSelectedMaintenance] = useState<MaintenanceWindow | null>(null)
  const [maintenanceWindows, _setMaintenanceWindows] = useState<MaintenanceWindow[]>([
    {
      id: "MW-001",
      title: "Database Upgrade",
      description: "Upgrading PostgreSQL to version 15.3",
      type: 'scheduled',
      status: 'planned',
      startTime: "2024-06-20 02:00",
      endTime: "2024-06-20 04:00",
      affectedServices: ['Database', 'API', 'Analytics'],
      notificationSent: true,
      rollbackPlan: "Restore from snapshot taken at 01:45"
    },
    {
      id: "MW-002",
      title: "Security Patches",
      description: "Applying critical security updates",
      type: 'emergency',
      status: 'in-progress',
      startTime: "2024-06-15 23:00",
      endTime: "2024-06-16 01:00",
      affectedServices: ['All Services'],
      notificationSent: true,
      rollbackPlan: "Revert to previous version using blue-green deployment"
    }
  ])
  const [notificationChannels] = useState<NotificationChannel[]>([
    { id: "NC-001", name: "Customer Emails", type: 'email', enabled: true, recipients: 45678 },
    { id: "NC-002", name: "Admin SMS", type: 'sms', enabled: true, recipients: 12 },
    { id: "NC-003", name: "Status Page", type: 'webhook', enabled: true, recipients: 1 },
    { id: "NC-004", name: "In-App Banner", type: 'in-app', enabled: false, recipients: 45678 }
  ])
  const [maintenanceHistory] = useState<MaintenanceHistory[]>([
    { id: "MH-001", title: "SSL Certificate Renewal", date: "2024-06-01", duration: "30 min", status: 'success', issues: [], rollback: false },
    { id: "MH-002", title: "Redis Cache Update", date: "2024-05-15", duration: "1h 15min", status: 'partial', issues: ["Temporary cache invalidation"], rollback: false },
    { id: "MH-003", title: "API Gateway Migration", date: "2024-05-01", duration: "2h 30min", status: 'failed', issues: ["Connection timeout", "Config mismatch"], rollback: true }
  ])
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      planned: "secondary",
      'in-progress': "default",
      completed: "outline",
      cancelled: "destructive",
      success: "default",
      failed: "destructive",
      partial: "secondary"
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'routine':
        return <RefreshCw className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }
  const handleScheduleMaintenance = () => {
    // Handle scheduling maintenance
    setIsScheduleDialogOpen(false)
  }
  const handleCancelMaintenance = (_id: string) => {
    // Handle cancelling maintenance
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Scheduler</h1>
          <p className="text-muted-foreground">Plan and manage system maintenance windows</p>
        </div>
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Maintenance Window</DialogTitle>
              <DialogDescription>
                Plan a system maintenance window with notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input placeholder="e.g., Database Upgrade" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Detailed description of maintenance activities" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="routine">Routine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Affected Services</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="api">API Only</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="frontend">Frontend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date & Time</Label>
                  {/* TODO: Implement date and time picker for maintenance start */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Pick a date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>End Date & Time</Label>
                  {/* TODO: Implement date and time picker for maintenance end */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Pick a date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <Label>Rollback Plan</Label>
                <Textarea placeholder="Describe the rollback procedure if something goes wrong" rows={3} />
              </div>
              <div>
                <Label>Notification Settings</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">Send advance notification (24h before)</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">Send reminder (1h before)</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">Send completion notification</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleMaintenance}>
                Schedule Maintenance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Active Maintenance Alert */}
      <Alert className="border-yellow-600 bg-yellow-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Maintenance In Progress</AlertTitle>
        <AlertDescription>
          Security patches are currently being applied. Expected completion: 01:00 UTC. Some services may experience brief interruptions.
        </AlertDescription>
      </Alert>
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Maintenance Windows</CardTitle>
              <CardDescription>Upcoming and active maintenance periods</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Affected Services</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceWindows.map((window) => (
                    <TableRow key={window.id}>
                      <TableCell>{getTypeIcon(window.type)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{window.title}</p>
                          <p className="text-sm text-muted-foreground">{window.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{window.startTime}</p>
                          <p className="text-muted-foreground">to {window.endTime}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {window.affectedServices.map((service) => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(window.status)}</TableCell>
                      <TableCell>
                        {window.notificationSent ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          {window.status === 'planned' && (
                            <>
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleCancelMaintenance(window.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {window.status === 'in-progress' && (
                            <Button size="sm" variant="destructive">
                              Rollback
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Configure how maintenance notifications are sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${channel.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Bell className={`h-4 w-4 ${channel.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {channel.type} • {channel.recipients.toLocaleString()} recipients
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={channel.enabled} />
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Notification Templates</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Info className="h-4 w-4 mr-2" />
                    24-Hour Advance Notice Template
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    1-Hour Reminder Template
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completion Notification Template
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Maintenance Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>Past maintenance windows and their outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Rollback</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{history.date}</TableCell>
                      <TableCell className="font-medium">{history.title}</TableCell>
                      <TableCell>{history.duration}</TableCell>
                      <TableCell>{getStatusBadge(history.status)}</TableCell>
                      <TableCell>
                        {history.issues.length > 0 ? (
                          <div className="space-y-1">
                            {history.issues.map((issue, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {history.rollback ? (
                          <Badge variant="destructive">Yes</Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Report</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="procedures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Procedures</CardTitle>
              <CardDescription>Standard operating procedures for common maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Database Upgrade Procedure</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Create full database backup</li>
                    <li>Notify all connected services</li>
                    <li>Enable maintenance mode</li>
                    <li>Perform upgrade on replica first</li>
                    <li>Verify replica functionality</li>
                    <li>Failover to upgraded replica</li>
                    <li>Upgrade primary database</li>
                    <li>Verify both instances</li>
                    <li>Disable maintenance mode</li>
                    <li>Monitor for 30 minutes post-upgrade</li>
                  </ol>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Emergency Rollback Procedure</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Identify failure point</li>
                    <li>Initiate rollback sequence</li>
                    <li>Restore from last known good configuration</li>
                    <li>Verify service restoration</li>
                    <li>Document incident details</li>
                    <li>Send notification to stakeholders</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}