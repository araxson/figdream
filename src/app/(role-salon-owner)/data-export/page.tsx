import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { 
  Download,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Package,
  UserCheck,
  Clock,
  Star,
  Gift
} from 'lucide-react'
import ExportDialog from '@/components/salon-owner/export/export-dialog'

export default async function DataExportPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's salon
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.salon_id) {
    redirect('/401')
  }

  const exportOptions = [
    {
      id: 'customers',
      title: 'Customer Data',
      description: 'Export customer profiles, contact information, and preferences',
      icon: <Users className="h-5 w-5" />,
      dataTypes: ['Basic Info', 'Contact Details', 'Preferences', 'Visit History'],
      formats: ['CSV', 'JSON', 'Excel'],
      color: 'bg-blue-500'
    },
    {
      id: 'appointments',
      title: 'Appointments',
      description: 'Export appointment history and upcoming bookings',
      icon: <Calendar className="h-5 w-5" />,
      dataTypes: ['Date & Time', 'Services', 'Staff', 'Customer', 'Status', 'Notes'],
      formats: ['CSV', 'JSON', 'Excel', 'PDF'],
      color: 'bg-green-500'
    },
    {
      id: 'transactions',
      title: 'Financial Transactions',
      description: 'Export payment records, invoices, and financial reports',
      icon: <DollarSign className="h-5 w-5" />,
      dataTypes: ['Payments', 'Refunds', 'Tips', 'Discounts', 'Taxes'],
      formats: ['CSV', 'Excel', 'PDF'],
      color: 'bg-yellow-500'
    },
    {
      id: 'services',
      title: 'Services & Products',
      description: 'Export service catalog and product inventory',
      icon: <Package className="h-5 w-5" />,
      dataTypes: ['Services', 'Categories', 'Pricing', 'Duration', 'Inventory'],
      formats: ['CSV', 'JSON', 'Excel'],
      color: 'bg-purple-500'
    },
    {
      id: 'staff',
      title: 'Staff Data',
      description: 'Export staff profiles, schedules, and performance metrics',
      icon: <UserCheck className="h-5 w-5" />,
      dataTypes: ['Profiles', 'Schedules', 'Time-off', 'Commissions', 'Performance'],
      formats: ['CSV', 'JSON', 'Excel', 'PDF'],
      color: 'bg-indigo-500'
    },
    {
      id: 'time_tracking',
      title: 'Time Tracking',
      description: 'Export time clock records and work hours',
      icon: <Clock className="h-5 w-5" />,
      dataTypes: ['Clock In/Out', 'Breaks', 'Overtime', 'Total Hours'],
      formats: ['CSV', 'Excel', 'PDF'],
      color: 'bg-pink-500'
    },
    {
      id: 'reviews',
      title: 'Reviews & Feedback',
      description: 'Export customer reviews and ratings',
      icon: <Star className="h-5 w-5" />,
      dataTypes: ['Ratings', 'Comments', 'Responses', 'Customer Info'],
      formats: ['CSV', 'JSON', 'Excel'],
      color: 'bg-orange-500'
    },
    {
      id: 'loyalty',
      title: 'Loyalty Program',
      description: 'Export loyalty points, transactions, and rewards',
      icon: <Gift className="h-5 w-5" />,
      dataTypes: ['Points Balance', 'Transactions', 'Rewards', 'Tiers'],
      formats: ['CSV', 'JSON', 'Excel', 'PDF'],
      color: 'bg-red-500'
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Data Export</h1>
        <p className="text-muted-foreground mt-1">
          Export your salon data in various formats for analysis, backup, or migration
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exportOptions.map((option) => (
          <Card key={option.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${option.color}`} />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${option.color} bg-opacity-10`}>
                  <div className={`${option.color} bg-opacity-100 text-white rounded p-1`}>
                    {option.icon}
                  </div>
                </div>
              </div>
              <CardTitle className="text-lg mt-3">{option.title}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data Types */}
              <div>
                <p className="text-sm font-medium mb-2">Includes:</p>
                <div className="flex flex-wrap gap-1">
                  {option.dataTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Available Formats */}
              <div>
                <p className="text-sm font-medium mb-2">Formats:</p>
                <div className="flex gap-2">
                  {option.formats.map((format) => (
                    <Badge key={format} variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <ExportDialog 
                salonId={userRole.salon_id}
                exportType={option.id}
                title={option.title}
                availableFormats={option.formats}
              >
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export {option.title}
                </Button>
              </ExportDialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Export */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Export</CardTitle>
          <CardDescription>
            Export all your salon data at once for complete backup or migration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium mb-1">Total Data Size</p>
              <p className="text-2xl font-bold">~2.3 GB</p>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Last Export</p>
              <p className="text-2xl font-bold">Never</p>
              <p className="text-xs text-muted-foreground">No previous exports</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Export Time</p>
              <p className="text-2xl font-bold">~5 min</p>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <ExportDialog 
              salonId={userRole.salon_id}
              exportType="all"
              title="All Data"
              availableFormats={['ZIP']}
              isBulkExport
            >
              <Button size="lg">
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </ExportDialog>
            <Button variant="outline" size="lg">
              Schedule Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>
            View and download previous exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No export history available
          </div>
        </CardContent>
      </Card>
    </div>
  )
}