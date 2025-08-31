'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Calendar, FileText, BarChart3, PieChart, TrendingUp, Users, DollarSign, Clock, Filter, Eye, Share2, Printer, Mail, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Report {
  id: string
  name: string
  type: 'revenue' | 'bookings' | 'customers' | 'staff' | 'services' | 'marketing' | 'custom'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'one-time'
  lastGenerated: string
  nextScheduled?: string
  status: 'ready' | 'generating' | 'scheduled' | 'failed'
  size?: string
  recipients?: string[]
  createdBy: string
  createdDate: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: React.ReactNode
  fields: string[]
}

export default function ReportsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [frequencyFilter, setFrequencyFilter] = useState('all')
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newReportType, setNewReportType] = useState('revenue')
  const [newReportFrequency, setNewReportFrequency] = useState('monthly')

  // Mock data
  const reports: Report[] = [
    {
      id: '1',
      name: 'Monthly Revenue Report',
      type: 'revenue',
      frequency: 'monthly',
      lastGenerated: '2024-01-01',
      nextScheduled: '2024-02-01',
      status: 'ready',
      size: '2.4 MB',
      recipients: ['owner@salon.com', 'manager@salon.com'],
      createdBy: 'Sarah Johnson',
      createdDate: '2023-12-15'
    },
    {
      id: '2',
      name: 'Weekly Booking Summary',
      type: 'bookings',
      frequency: 'weekly',
      lastGenerated: '2024-01-08',
      nextScheduled: '2024-01-15',
      status: 'ready',
      size: '1.2 MB',
      recipients: ['manager@salon.com'],
      createdBy: 'Mike Chen',
      createdDate: '2023-11-20'
    },
    {
      id: '3',
      name: 'Customer Analytics Q4 2023',
      type: 'customers',
      frequency: 'quarterly',
      lastGenerated: '2024-01-01',
      nextScheduled: '2024-04-01',
      status: 'ready',
      size: '5.8 MB',
      recipients: ['owner@salon.com'],
      createdBy: 'Emily Davis',
      createdDate: '2023-10-01'
    },
    {
      id: '4',
      name: 'Staff Performance Report',
      type: 'staff',
      frequency: 'monthly',
      lastGenerated: '2024-01-01',
      nextScheduled: '2024-02-01',
      status: 'ready',
      size: '3.1 MB',
      createdBy: 'Sarah Johnson',
      createdDate: '2023-12-01'
    },
    {
      id: '5',
      name: 'Service Utilization Analysis',
      type: 'services',
      frequency: 'monthly',
      lastGenerated: '2024-01-05',
      status: 'generating',
      createdBy: 'James Wilson',
      createdDate: '2024-01-05'
    },
    {
      id: '6',
      name: 'Marketing Campaign ROI',
      type: 'marketing',
      frequency: 'one-time',
      lastGenerated: '2023-12-28',
      status: 'ready',
      size: '1.8 MB',
      createdBy: 'Maria Garcia',
      createdDate: '2023-12-28'
    },
    {
      id: '7',
      name: 'Daily Sales Report',
      type: 'revenue',
      frequency: 'daily',
      lastGenerated: '2024-01-14',
      nextScheduled: '2024-01-15',
      status: 'scheduled',
      recipients: ['owner@salon.com', 'manager@salon.com', 'accountant@salon.com'],
      createdBy: 'Sarah Johnson',
      createdDate: '2023-12-10'
    },
    {
      id: '8',
      name: 'Yearly Business Overview',
      type: 'custom',
      frequency: 'yearly',
      lastGenerated: '2024-01-01',
      nextScheduled: '2025-01-01',
      status: 'ready',
      size: '12.4 MB',
      recipients: ['owner@salon.com', 'investors@salon.com'],
      createdBy: 'Sarah Johnson',
      createdDate: '2023-01-01'
    }
  ]

  const reportTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Revenue Analysis',
      description: 'Comprehensive revenue breakdown by service, location, and time period',
      category: 'Financial',
      icon: <DollarSign className="h-5 w-5" />,
      fields: ['Total Revenue', 'Revenue by Service', 'Revenue by Location', 'Revenue Trends', 'Payment Methods']
    },
    {
      id: '2',
      name: 'Booking Analytics',
      description: 'Detailed analysis of booking patterns and trends',
      category: 'Operations',
      icon: <Calendar className="h-5 w-5" />,
      fields: ['Total Bookings', 'Bookings by Service', 'Peak Times', 'Cancellation Rate', 'No-show Rate']
    },
    {
      id: '3',
      name: 'Customer Insights',
      description: 'Customer behavior, retention, and lifetime value analysis',
      category: 'Customers',
      icon: <Users className="h-5 w-5" />,
      fields: ['New Customers', 'Returning Customers', 'Customer Lifetime Value', 'Retention Rate', 'Churn Analysis']
    },
    {
      id: '4',
      name: 'Staff Performance',
      description: 'Individual and team performance metrics',
      category: 'Staff',
      icon: <TrendingUp className="h-5 w-5" />,
      fields: ['Revenue per Staff', 'Bookings per Staff', 'Utilization Rate', 'Customer Ratings', 'Commission Summary']
    }
  ]

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || report.type === typeFilter
    const matchesFrequency = frequencyFilter === 'all' || report.frequency === frequencyFilter
    
    return matchesSearch && matchesType && matchesFrequency
  })

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'ready': return 'default'
      case 'generating': return 'secondary'
      case 'scheduled': return 'outline'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'revenue': return <DollarSign className="h-4 w-4" />
      case 'bookings': return <Calendar className="h-4 w-4" />
      case 'customers': return <Users className="h-4 w-4" />
      case 'staff': return <TrendingUp className="h-4 w-4" />
      case 'services': return <BarChart3 className="h-4 w-4" />
      case 'marketing': return <Mail className="h-4 w-4" />
      case 'custom': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(filteredReports.map(r => r.id))
    } else {
      setSelectedReports([])
    }
  }

  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      setSelectedReports([...selectedReports, reportId])
    } else {
      setSelectedReports(selectedReports.filter(id => id !== reportId))
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Generate and manage business reports</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>
                  Choose a template or create a custom report
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Report Type</Label>
                  <RadioGroup value={newReportType} onValueChange={setNewReportType}>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {reportTemplates.map((template) => (
                        <div key={template.id} className="flex items-start space-x-2">
                          <RadioGroupItem value={template.name.toLowerCase().replace(' ', '-')} id={template.id} />
                          <Label htmlFor={template.id} className="cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded">
                                {template.icon}
                              </div>
                              <div>
                                <p className="font-medium">{template.name}</p>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select value={newReportFrequency} onValueChange={setNewReportFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Email Recipients (optional)</Label>
                  <Input placeholder="Enter email addresses separated by commas" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Create Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {reportTemplates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-muted rounded">
                  {template.icon}
                </div>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              <Button variant="outline" className="w-full" size="sm">
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="min-w-[150px]">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <Label>Frequency</Label>
              <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedReports.length > 0 && (
            <div className="flex items-center gap-4 mt-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedReports.length} selected</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>{filteredReports.length} reports available</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Last Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={(checked) => handleSelectReport(report.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created by {report.createdBy}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.type)}
                      <span className="capitalize">{report.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {report.frequency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{report.lastGenerated}</p>
                      {report.nextScheduled && (
                        <p className="text-sm text-muted-foreground">
                          Next: {report.nextScheduled}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.size || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {report.status === 'ready' && (
                        <>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}