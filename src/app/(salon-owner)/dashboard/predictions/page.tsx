import { createServerClient } from '@/lib/database/supabase/server'
import { 
  getDemandForecast,
  getChurnPrediction,
  getRevenueProjection,
  getStaffingOptimization
} from '@/lib/data-access/analytics/predictions'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PredictiveDashboard from '@/components/salon-owner/analytics/predictive-dashboard'

export default async function PredictionsPage() {
  const supabase = await createServerClient()
  
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

  // Get all predictive analytics data
  const [demandForecast, churnPrediction, revenueProjection, staffingOptimization] = await Promise.all([
    getDemandForecast(userRole.salon_id, 30),
    getChurnPrediction(userRole.salon_id),
    getRevenueProjection(userRole.salon_id, 3),
    getStaffingOptimization(userRole.salon_id)
  ])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/salon-admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Predictive Analytics</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered forecasts and recommendations
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/salon-admin/dashboard/metrics">
            View Current Analytics
          </Link>
        </Button>
      </div>

      {/* Predictive Dashboard */}
      <PredictiveDashboard
        demandForecast={demandForecast}
        churnPrediction={churnPrediction}
        revenueProjection={revenueProjection}
        staffingOptimization={staffingOptimization}
      />
    </div>
  )
}