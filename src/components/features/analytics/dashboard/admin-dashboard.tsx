"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  Users, 
  Store, 
  DollarSign, 
  Activity,
  BarChart3,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Server,
  Database,
  Lock,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export function AdminDashboard() {
  // This would normally fetch data from your API
  const stats = {
    totalUsers: 1234,
    userChange: 12.5,
    totalSalons: 45,
    salonChange: 8.2,
    totalRevenue: 125000,
    revenueChange: 15.3,
    systemHealth: 98.5,
    healthChange: 2.1,
    activeUsers: 892,
    newSignups: 156,
    pendingIssues: 3
  }

  const systemStatus = [
    { name: "Database", status: "operational", uptime: 99.99, icon: Database },
    { name: "API Services", status: "operational", uptime: 99.95, icon: Server },
    { name: "Authentication", status: "operational", uptime: 100, icon: Lock },
    { name: "Payment Gateway", status: "degraded", uptime: 98.5, icon: DollarSign },
  ]

  const recentActivity = [
    { type: "user", message: "New salon registered: Beauty Paradise", time: "5 minutes ago", icon: Store },
    { type: "system", message: "Database backup completed successfully", time: "1 hour ago", icon: Database },
    { type: "alert", message: "High traffic detected on API endpoints", time: "2 hours ago", icon: AlertCircle },
    { type: "user", message: "Admin role assigned to user@example.com", time: "3 hours ago", icon: Users },
  ]

  return (
    <div className={cn("space-y-6")}>
      {/* Metric Cards with Better Design */}
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4")}>
        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
            <CardTitle className={cn("text-sm font-medium")}>
              Total Users
            </CardTitle>
            <Users className={cn("h-4 w-4 text-muted-foreground")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold")}>
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className={cn("flex items-center text-xs text-muted-foreground")}>
              {stats.userChange > 0 ? (
                <>
                  <ArrowUpRight className={cn("mr-1 h-3 w-3 text-green-500")} />
                  <span className={cn("text-green-500 font-medium")}>
                    {stats.userChange}%
                  </span>
                  <span className={cn("ml-1")}>from last month</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className={cn("mr-1 h-3 w-3 text-red-500")} />
                  <span className={cn("text-red-500 font-medium")}>
                    {Math.abs(stats.userChange)}%
                  </span>
                  <span className={cn("ml-1")}>from last month</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
            <CardTitle className={cn("text-sm font-medium")}>
              Active Salons
            </CardTitle>
            <Store className={cn("h-4 w-4 text-muted-foreground")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold")}>
              {stats.totalSalons}
            </div>
            <div className={cn("flex items-center text-xs text-muted-foreground")}>
              <ArrowUpRight className={cn("mr-1 h-3 w-3 text-green-500")} />
              <span className={cn("text-green-500 font-medium")}>
                {stats.salonChange}%
              </span>
              <span className={cn("ml-1")}>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
            <CardTitle className={cn("text-sm font-medium")}>
              Revenue
            </CardTitle>
            <DollarSign className={cn("h-4 w-4 text-muted-foreground")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold")}>
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className={cn("flex items-center text-xs text-muted-foreground")}>
              <TrendingUp className={cn("mr-1 h-3 w-3 text-green-500")} />
              <span className={cn("text-green-500 font-medium")}>
                {stats.revenueChange}%
              </span>
              <span className={cn("ml-1")}>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
            <CardTitle className={cn("text-sm font-medium")}>
              System Health
            </CardTitle>
            <Activity className={cn("h-4 w-4 text-muted-foreground")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold")}>
              {stats.systemHealth}%
            </div>
            <Progress value={stats.systemHealth} className={cn("h-2 mt-2")} />
            <p className={cn("text-xs text-muted-foreground mt-2")}>
              {stats.pendingIssues} issues to review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions with Better Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("grid gap-3 md:grid-cols-2 lg:grid-cols-4")}>
            <Button variant="outline" className={cn("justify-start h-auto py-3")} asChild>
              <Link href="/admin/users">
                <div className={cn("flex items-start gap-3 w-full")}>
                  <Users className={cn("h-5 w-5 mt-0.5")} />
                  <div className={cn("text-left")}>
                    <div className={cn("font-medium")}>Manage Users</div>
                    <div className={cn("text-xs text-muted-foreground")}>
                      {stats.totalUsers} total users
                    </div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className={cn("justify-start h-auto py-3")} asChild>
              <Link href="/admin/salons">
                <div className={cn("flex items-start gap-3 w-full")}>
                  <Store className={cn("h-5 w-5 mt-0.5")} />
                  <div className={cn("text-left")}>
                    <div className={cn("font-medium")}>Manage Salons</div>
                    <div className={cn("text-xs text-muted-foreground")}>
                      {stats.totalSalons} active salons
                    </div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className={cn("justify-start h-auto py-3")} asChild>
              <Link href="/admin/analytics">
                <div className={cn("flex items-start gap-3 w-full")}>
                  <BarChart3 className={cn("h-5 w-5 mt-0.5")} />
                  <div className={cn("text-left")}>
                    <div className={cn("font-medium")}>View Analytics</div>
                    <div className={cn("text-xs text-muted-foreground")}>
                      Detailed insights
                    </div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className={cn("justify-start h-auto py-3")} asChild>
              <Link href="/admin/settings">
                <div className={cn("flex items-start gap-3 w-full")}>
                  <Settings className={cn("h-5 w-5 mt-0.5")} />
                  <div className={cn("text-left")}>
                    <div className={cn("font-medium")}>System Settings</div>
                    <div className={cn("text-xs text-muted-foreground")}>
                      Configuration
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className={cn("grid gap-6 lg:grid-cols-2")}>
        {/* System Status with Better Visual Design */}
        <Card>
          <CardHeader>
            <div className={cn("flex items-center justify-between")}>
              <div>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Service health and uptime</CardDescription>
              </div>
              <Badge variant="outline" className={cn("text-green-600")}>
                <CheckCircle className={cn("mr-1 h-3 w-3")} />
                All Systems Operational
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("space-y-4")}>
              {systemStatus.map((service) => {
                const Icon = service.icon
                return (
                  <div key={service.name} className={cn("flex items-center justify-between p-3 rounded-lg border")}>
                    <div className={cn("flex items-center gap-3")}>
                      <div className={cn(
                        "p-2 rounded-lg",
                        service.status === "operational" ? "bg-green-100 dark:bg-green-900/20" : "bg-yellow-100 dark:bg-yellow-900/20"
                      )}>
                        <Icon className={cn(
                          "h-4 w-4",
                          service.status === "operational" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                        )} />
                      </div>
                      <div>
                        <p className={cn("font-medium")}>{service.name}</p>
                        <p className={cn("text-sm text-muted-foreground")}>
                          {service.uptime}% uptime
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={service.status === "operational" ? "default" : "secondary"}
                      className={cn(
                        service.status === "operational" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                      )}
                    >
                      {service.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity with Better Icons */}
        <Card>
          <CardHeader>
            <div className={cn("flex items-center justify-between")}>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/audit-logs">
                  View all
                  <ChevronRight className={cn("ml-1 h-4 w-4")} />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("space-y-4")}>
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className={cn("flex gap-3")}>
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      activity.type === "alert" ? "bg-yellow-100 dark:bg-yellow-900/20" :
                      activity.type === "system" ? "bg-blue-100 dark:bg-blue-900/20" : 
                      "bg-green-100 dark:bg-green-900/20"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        activity.type === "alert" ? "text-yellow-600 dark:text-yellow-400" :
                        activity.type === "system" ? "text-blue-600 dark:text-blue-400" : 
                        "text-green-600 dark:text-green-400"
                      )} />
                    </div>
                    <div className={cn("flex-1 space-y-1")}>
                      <p className={cn("text-sm leading-relaxed")}>
                        {activity.message}
                      </p>
                      <div className={cn("flex items-center text-xs text-muted-foreground")}>
                        <Clock className={cn("mr-1 h-3 w-3")} />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Overview with Visual Improvements */}
      <Card>
        <CardHeader>
          <div className={cn("flex items-center justify-between")}>
            <div className={cn("flex items-center gap-2")}>
              <Shield className={cn("h-5 w-5")} />
              <div>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>Platform security metrics and status</CardDescription>
              </div>
            </div>
            <Badge className={cn("bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400")}>
              <CheckCircle className={cn("mr-1 h-3 w-3")} />
              Secure
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn("grid gap-6 md:grid-cols-4")}>
            <div className={cn("space-y-3")}>
              <div className={cn("flex items-center justify-between")}>
                <p className={cn("text-sm font-medium text-muted-foreground")}>Failed Logins</p>
                <TrendingDown className={cn("h-4 w-4 text-green-500")} />
              </div>
              <p className={cn("text-3xl font-bold")}>23</p>
              <p className={cn("text-xs text-muted-foreground")}>
                Last 24 hours • <span className={cn("text-green-500")}>-15%</span>
              </p>
            </div>

            <div className={cn("space-y-3")}>
              <div className={cn("flex items-center justify-between")}>
                <p className={cn("text-sm font-medium text-muted-foreground")}>Active Sessions</p>
                <Users className={cn("h-4 w-4 text-muted-foreground")} />
              </div>
              <p className={cn("text-3xl font-bold")}>{stats.activeUsers}</p>
              <p className={cn("text-xs text-muted-foreground")}>Currently online</p>
            </div>

            <div className={cn("space-y-3")}>
              <div className={cn("flex items-center justify-between")}>
                <p className={cn("text-sm font-medium text-muted-foreground")}>Security Score</p>
                <Shield className={cn("h-4 w-4 text-green-500")} />
              </div>
              <p className={cn("text-3xl font-bold text-green-600 dark:text-green-400")}>A+</p>
              <p className={cn("text-xs text-muted-foreground")}>All checks passed</p>
            </div>

            <div className={cn("space-y-3")}>
              <div className={cn("flex items-center justify-between")}>
                <p className={cn("text-sm font-medium text-muted-foreground")}>Threats Blocked</p>
                <AlertCircle className={cn("h-4 w-4 text-muted-foreground")} />
              </div>
              <p className={cn("text-3xl font-bold")}>142</p>
              <p className={cn("text-xs text-muted-foreground")}>This month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}