import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Clock, 
  Award, 
  DollarSign, 
  Gift,
  User,
  Users,
  Star,
  Store,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Base stats interface
interface BaseStats {
  todayAppointments?: number
  completedToday?: number
  upcomingToday?: number
  averageRating?: number
  totalReviews?: number
}

// Admin-specific stats
interface AdminStats extends BaseStats {
  totalUsers: number
  userChange: number
  totalSalons: number
  salonChange: number
  totalRevenue: number
  revenueChange: number
  systemHealth: number
  healthChange: number
  activeUsers: number
  newSignups: number
  pendingIssues: number
}

// Owner/Manager-specific stats
interface OwnerStats extends BaseStats {
  todayRevenue: number
  monthlyRevenue: number
  monthlyEarnings: number
  totalCustomers: number
  regularClients: number
  activeStaff: number
  totalServices: number
}

// Staff-specific stats
interface StaffStats extends BaseStats {
  weeklyEarnings: number
  monthlyEarnings: number
  regularClients: number
}

// Customer-specific stats
interface CustomerStats extends BaseStats {
  totalBookings: number
  upcomingAppointments: number
  completedAppointments: number
  loyaltyPoints: number
  totalSpent: number
  favoriteService: string
  memberSince: number
  activeOffers: number
  membershipLevel: string
  nextRewardAt: number
}

type DashboardStatsType = AdminStats | OwnerStats | StaffStats | CustomerStats

interface DashboardStatsProps {
  userRole: 'super_admin' | 'salon_owner' | 'salon_manager' | 'staff' | 'customer'
  stats: DashboardStatsType
  loading?: boolean
}

export function DashboardStats({ userRole, stats, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderAdminStats = (adminStats: AdminStats) => (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4")}>
      <Card>
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
          <CardTitle className={cn("text-sm font-medium")}>Total Users</CardTitle>
          <Users className={cn("h-4 w-4 text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold")}>
            {adminStats.totalUsers.toLocaleString()}
          </div>
          <div className={cn("flex items-center text-xs text-muted-foreground")}>
            {adminStats.userChange > 0 ? (
              <>
                <ArrowUpRight className={cn("mr-1 h-3 w-3 text-green-500")} />
                <span className={cn("text-green-500 font-medium")}>
                  {adminStats.userChange}%
                </span>
                <span className={cn("ml-1")}>from last month</span>
              </>
            ) : (
              <>
                <ArrowDownRight className={cn("mr-1 h-3 w-3 text-red-500")} />
                <span className={cn("text-red-500 font-medium")}>
                  {Math.abs(adminStats.userChange)}%
                </span>
                <span className={cn("ml-1")}>from last month</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
          <CardTitle className={cn("text-sm font-medium")}>Active Salons</CardTitle>
          <Store className={cn("h-4 w-4 text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold")}>{adminStats.totalSalons}</div>
          <div className={cn("flex items-center text-xs text-muted-foreground")}>
            <ArrowUpRight className={cn("mr-1 h-3 w-3 text-green-500")} />
            <span className={cn("text-green-500 font-medium")}>
              {adminStats.salonChange}%
            </span>
            <span className={cn("ml-1")}>from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
          <CardTitle className={cn("text-sm font-medium")}>Revenue</CardTitle>
          <DollarSign className={cn("h-4 w-4 text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold")}>
            ${adminStats.totalRevenue.toLocaleString()}
          </div>
          <div className={cn("flex items-center text-xs text-muted-foreground")}>
            <TrendingUp className={cn("mr-1 h-3 w-3 text-green-500")} />
            <span className={cn("text-green-500 font-medium")}>
              {adminStats.revenueChange}%
            </span>
            <span className={cn("ml-1")}>from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
          <CardTitle className={cn("text-sm font-medium")}>System Health</CardTitle>
          <Activity className={cn("h-4 w-4 text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold")}>{adminStats.systemHealth}%</div>
          <Progress value={adminStats.systemHealth} className={cn("h-2 mt-2")} />
          <p className={cn("text-xs text-muted-foreground mt-2")}>
            {adminStats.pendingIssues} issues to review
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderOwnerStats = (ownerStats: OwnerStats) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(ownerStats.todayRevenue || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from yesterday
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ownerStats.todayAppointments || 0}</div>
          <p className="text-xs text-muted-foreground">
            6 spots still available
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ownerStats.totalCustomers || 0}</div>
          <p className="text-xs text-muted-foreground">
            +48 new this month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ownerStats.averageRating || 0}</div>
          <p className="text-xs text-muted-foreground">
            From {ownerStats.totalReviews || 0} reviews
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderStaffStats = (staffStats: StaffStats) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{staffStats.todayAppointments || 0}</div>
          <p className="text-xs text-muted-foreground">
            {staffStats.completedToday || 0} completed, {staffStats.upcomingToday || 0} upcoming
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(staffStats.weeklyEarnings || 0).toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">
            This week&apos;s total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{staffStats.averageRating || 0}</div>
          <p className="text-xs text-muted-foreground">
            From {staffStats.totalReviews || 0} reviews
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Regular Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{staffStats.regularClients || 0}</div>
          <p className="text-xs text-muted-foreground">
            Repeat customers
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderCustomerStats = (customerStats: CustomerStats) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customerStats.totalBookings || 0}</div>
          <p className="text-xs text-muted-foreground">All time appointments</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          <Clock className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customerStats.upcomingAppointments || 0}</div>
          <p className="text-xs text-muted-foreground">Scheduled appointments</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
          <Award className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customerStats.loyaltyPoints?.toLocaleString() || 0}</div>
          <p className="text-xs text-muted-foreground">
            {(customerStats.nextRewardAt || 0) - (customerStats.loyaltyPoints || 0)} points to next reward
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(customerStats.totalSpent || 0).toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">Lifetime value</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
          <Gift className="h-4 w-4 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customerStats.activeOffers || 0}</div>
          <p className="text-xs text-muted-foreground">Available promotions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Member Since</CardTitle>
          <User className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customerStats.memberSince || 0} months</div>
          <p className="text-xs text-muted-foreground">{customerStats.membershipLevel || 'Basic'}</p>
        </CardContent>
      </Card>
    </div>
  )

  switch (userRole) {
    case 'super_admin':
      return renderAdminStats(stats as AdminStats)
    case 'salon_owner':
    case 'salon_manager':
      return renderOwnerStats(stats as OwnerStats)
    case 'staff':
      return renderStaffStats(stats as StaffStats)
    case 'customer':
      return renderCustomerStats(stats as CustomerStats)
    default:
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Dashboard stats not available for this role</p>
        </div>
      )
  }
}