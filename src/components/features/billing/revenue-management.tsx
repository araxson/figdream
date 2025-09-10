import { createClient } from '@/lib/supabase/server'
import { WalkInForm } from '@/components/features/appointments/walk-in/walk-in-form'
import { AppointmentsRevenueTable } from './appointments-revenue-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar, Users } from 'lucide-react'

async function getRevenueStats() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: salon } = await supabase
    .from('salons')
    .select('id')
    .eq('created_by', user.id)
    .single()
  
  if (!salon) return null

  // Get current month dates
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Get current month revenue from revenue_summary
  const { data: currentMonthData } = await supabase
    .from('revenue_summary')
    .select('total_revenue')
    .eq('salon_id', salon.id)
    .gte('appointment_date', startOfMonth.toISOString().split('T')[0])

  // Get last month revenue
  const { data: lastMonthData } = await supabase
    .from('revenue_summary')
    .select('total_revenue')
    .eq('salon_id', salon.id)
    .gte('appointment_date', startOfLastMonth.toISOString().split('T')[0])
    .lte('appointment_date', endOfLastMonth.toISOString().split('T')[0])

  // Get today's revenue
  const { data: todayData } = await supabase
    .from('revenue_summary')
    .select('total_revenue')
    .eq('salon_id', salon.id)
    .eq('appointment_date', new Date().toISOString().split('T')[0])

  // Get staff members for the form
  const { data: staffMembers } = await supabase
    .from('staff_profiles')
    .select('id, profiles(first_name, last_name)')
    .eq('salon_id', salon.id)
    .eq('is_active', true)

  // Calculate totals
  const currentMonthRevenue = currentMonthData?.reduce((sum, item) => 
    sum + (item.total_revenue || 0), 0) || 0
  
  const lastMonthRevenue = lastMonthData?.reduce((sum, item) => 
    sum + (item.total_revenue || 0), 0) || 0
  
  const todayRevenue = todayData?.reduce((sum, item) => 
    sum + (item.total_revenue || 0), 0) || 0

  const monthGrowth = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : '0'

  return {
    salonId: salon.id,
    currentMonthRevenue,
    lastMonthRevenue,
    todayRevenue,
    monthGrowth,
    totalTransactions: currentMonthData?.length || 0,
    staffMembers: staffMembers || []
  }
}

export async function RevenueManagement() {
  const stats = await getRevenueStats()
  
  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load revenue data</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">Manual entries only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.currentMonthRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.lastMonthRevenue)}</div>
            <p className="text-xs text-muted-foreground">Previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(stats.monthGrowth) >= 0 ? '+' : ''}{stats.monthGrowth}%
            </div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Entry Form and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Entries</CardTitle>
              <CardDescription>
                Manually track revenue for services, products, and other income
              </CardDescription>
            </div>
            <WalkInForm 
              salonId={stats.salonId} 
              staffMembers={stats.staffMembers}
              services={[]} // You may want to fetch services here
            />
          </div>
        </CardHeader>
        <CardContent>
          <AppointmentsRevenueTable salonId={stats.salonId} />
        </CardContent>
      </Card>
    </div>
  )
}