'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Calendar,
  DollarSign,
  Package,
  Star,
  BarChart3,
  Settings,
  Clock,
  Mail,
  MessageSquare,
  MapPin,
  UserCheck,
  CalendarOff,
  Briefcase,
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react'

interface SalonManagementDashboardProps {
  salonId: string
}

export function SalonManagementDashboard({ salonId }: SalonManagementDashboardProps) {
  const managementSections = [
    {
      title: 'Business Operations',
      description: 'Core business management',
      items: [
        {
          title: 'Staff Management',
          description: 'Manage staff members and roles',
          icon: Users,
          href: `/admin/salons/${salonId}/manage/staff`,
          color: 'text-blue-600 bg-blue-50'
        },
        {
          title: 'Staff Schedules',
          description: 'Work schedules and availability',
          icon: Clock,
          href: `/admin/salons/${salonId}/manage/staff/schedules`,
          color: 'text-purple-600 bg-purple-50'
        },
        {
          title: 'Time Off Requests',
          description: 'Handle time off and leave requests',
          icon: CalendarOff,
          href: `/admin/salons/${salonId}/manage/staff/time-off`,
          color: 'text-orange-600 bg-orange-50'
        },
        {
          title: 'Services',
          description: 'Manage salon services and pricing',
          icon: Briefcase,
          href: `/admin/salons/${salonId}/manage/services`,
          color: 'text-green-600 bg-green-50'
        },
        {
          title: 'Locations',
          description: 'Manage salon locations',
          icon: MapPin,
          href: `/admin/salons/${salonId}/manage/locations`,
          color: 'text-red-600 bg-red-50'
        }
      ]
    },
    {
      title: 'Customer Management',
      description: 'Customer relations and bookings',
      items: [
        {
          title: 'Appointments',
          description: 'View and manage bookings',
          icon: Calendar,
          href: `/admin/salons/${salonId}/manage/appointments`,
          color: 'text-indigo-600 bg-indigo-50'
        },
        {
          title: 'Customers',
          description: 'Customer database and profiles',
          icon: UserCheck,
          href: `/admin/salons/${salonId}/manage/customers`,
          color: 'text-teal-600 bg-teal-50'
        },
        {
          title: 'Reviews',
          description: 'Customer feedback and ratings',
          icon: Star,
          href: `/admin/salons/${salonId}/manage/reviews`,
          color: 'text-yellow-600 bg-yellow-50'
        }
      ]
    },
    {
      title: 'Marketing & Growth',
      description: 'Marketing campaigns and analytics',
      items: [
        {
          title: 'Email Campaigns',
          description: 'Email marketing campaigns',
          icon: Mail,
          href: `/admin/salons/${salonId}/manage/campaigns/email`,
          color: 'text-pink-600 bg-pink-50'
        },
        {
          title: 'SMS Campaigns',
          description: 'SMS marketing campaigns',
          icon: MessageSquare,
          href: `/admin/salons/${salonId}/manage/campaigns/sms`,
          color: 'text-cyan-600 bg-cyan-50'
        },
        {
          title: 'Analytics',
          description: 'Performance metrics and insights',
          icon: BarChart3,
          href: `/admin/salons/${salonId}/manage/analytics`,
          color: 'text-violet-600 bg-violet-50'
        },
        {
          title: 'Revenue',
          description: 'Financial performance',
          icon: DollarSign,
          href: `/admin/salons/${salonId}/manage/revenue`,
          color: 'text-emerald-600 bg-emerald-50'
        }
      ]
    },
    {
      title: 'Reports & Settings',
      description: 'Reporting and configuration',
      items: [
        {
          title: 'Reports',
          description: 'Detailed business reports',
          icon: FileText,
          href: `/admin/salons/${salonId}/manage/reports`,
          color: 'text-slate-600 bg-slate-50'
        },
        {
          title: 'Settings',
          description: 'Salon settings and preferences',
          icon: Settings,
          href: `/admin/salons/${salonId}/manage/settings`,
          color: 'text-gray-600 bg-gray-50'
        }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">6 on duty today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">Based on 1,234 reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      {managementSections.map((section) => (
        <div key={section.title}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => (
              <Card key={item.title} className="hover:shadow-lg transition-shadow">
                <Link href={item.href}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Quick Actions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Export Reports</Button>
            <Button variant="outline" size="sm">Send Notification</Button>
            <Button variant="outline" size="sm">View Audit Log</Button>
            <Button variant="outline" size="sm">Backup Data</Button>
            <Button variant="outline" size="sm">Contact Owner</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}