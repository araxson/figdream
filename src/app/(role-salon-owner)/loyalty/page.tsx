import { createClient } from '@/lib/database/supabase/server'
import { getLoyaltyProgram, getLoyaltyStats, getTopLoyaltyCustomers } from '@/lib/data-access/loyalty-admin'
import { redirect } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Badge,
  Progress
} from '@/components/ui'
import { 
  Trophy,
  Users,
  TrendingUp,
  Gift,
  Settings,
  Plus,
  Star,
  Award,
  Coins
} from 'lucide-react'
import Link from 'next/link'
import LoyaltyProgramSettings from '@/components/salon-owner/loyalty/loyalty-program-settings'
import PointsAdjustmentDialog from '@/components/salon-owner/loyalty/points-adjustment-dialog'
import CustomerPointsTable from '@/components/salon-owner/loyalty/customer-points-table'

export default async function LoyaltyAdminPage() {
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

  // Get loyalty program, stats and top customers
  const [program, stats, topCustomers] = await Promise.all([
    getLoyaltyProgram(userRole.salon_id),
    getLoyaltyStats(userRole.salon_id),
    getTopLoyaltyCustomers(userRole.salon_id, 5)
  ])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-500'
      case 'gold': return 'bg-yellow-500'
      case 'silver': return 'bg-gray-400'
      default: return 'bg-orange-600'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Trophy className="h-4 w-4" />
      case 'gold': return <Star className="h-4 w-4" />
      case 'silver': return <Award className="h-4 w-4" />
      default: return <Coins className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Loyalty Program</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer loyalty points and rewards
          </p>
        </div>
        <div className="flex gap-2">
          <PointsAdjustmentDialog salonId={userRole.salon_id}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adjust Points
            </Button>
          </PointsAdjustmentDialog>
          <Button variant="outline" asChild>
            <Link href="/salon-admin/loyalty/transactions">
              View All Transactions
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Enrolled in program
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPoints.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Points Earned (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{stats.monthlyEarned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Points Redeemed (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.monthlyRedeemed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Tier Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
                <CardDescription>
                  Member distribution across loyalty tiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.tierDistribution).map(([tier, count]) => {
                  const percentage = stats.totalCustomers > 0 
                    ? (count / stats.totalCustomers) * 100 
                    : 0
                  
                  return (
                    <div key={tier} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getTierColor(tier)}`} />
                          <span className="capitalize font-medium">{tier}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Top Members */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Top Members</CardTitle>
                    <CardDescription>
                      Highest point balances
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/salon-admin/loyalty/members">
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCustomers.map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {customer.profiles?.full_name || `${customer.profiles?.first_name || ''} ${customer.profiles?.last_name || ''}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {customer.profiles?.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {customer.current_points.toLocaleString()} pts
                        </p>
                        <Badge variant="outline" className="text-xs">
                          <span className={`h-2 w-2 rounded-full mr-1 ${getTierColor('bronze')}`} />
                          Bronze
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Program Status */}
          <Card>
            <CardHeader>
              <CardTitle>Program Configuration</CardTitle>
              <CardDescription>
                Current loyalty program settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {program ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Points per Dollar</p>
                    <p className="text-2xl font-bold">{program.points_per_dollar || 1}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Redemption Value</p>
                    <p className="text-2xl font-bold">${program.redemption_value || 0.01}/pt</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Sign-up Bonus</p>
                    <p className="text-2xl font-bold">{program.signup_bonus || 0} pts</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    No loyalty program configured yet
                  </p>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Program
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Loyalty Members</CardTitle>
                  <CardDescription>
                    Manage customer points and tiers
                  </CardDescription>
                </div>
                <PointsAdjustmentDialog salonId={userRole.salon_id}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adjust Points
                  </Button>
                </PointsAdjustmentDialog>
              </div>
            </CardHeader>
            <CardContent>
              <CustomerPointsTable salonId={userRole.salon_id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <LoyaltyProgramSettings 
            salonId={userRole.salon_id} 
            currentProgram={program}
          />
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Rewards Configuration</CardTitle>
              <CardDescription>
                Set up rewards and redemption options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Rewards configuration coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}