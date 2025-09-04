"use client"
import { useState, useEffect, useCallback } from "react"
import { Package, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
// import type { Database } from "@/types/database.types"
interface ServiceEarning {
  service_id: string
  service_name: string
  category_name: string | null
  appointment_count: number
  total_earnings: number
  total_tips: number
  average_earnings: number
  percentage_of_total: number
}
interface EarningsBreakdownProps {
  staffId: string
  dateRange: { start: Date; end: Date }
}
export function EarningsBreakdown({ staffId, dateRange }: EarningsBreakdownProps) {
  const [serviceEarnings, setServiceEarnings] = useState<ServiceEarning[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const loadBreakdown = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch earnings grouped by service
      const { data, error } = await supabase
        .from("staff_earnings")
        .select(`
          *,
          appointments!inner(
            service_id,
            services!inner(
              id,
              name,
              category_id,
              service_categories(name)
            )
          )
        `)
        .eq("staff_id", staffId)
        .gte("earning_date", dateRange.start.toISOString())
        .lte("earning_date", dateRange.end.toISOString())
      if (error) throw error
      // Process and group earnings by service
      const serviceMap = new Map<string, ServiceEarning>()
      let total = 0
      data?.forEach((earning: Record<string, unknown>) => {
        const serviceId = earning.appointments?.service_id
        const serviceName = earning.appointments?.services?.name
        const categoryName = earning.appointments?.services?.service_categories?.name
        if (serviceId && serviceName) {
          const existing = serviceMap.get(serviceId) || {
            service_id: serviceId,
            service_name: serviceName,
            category_name: categoryName,
            appointment_count: 0,
            total_earnings: 0,
            total_tips: 0,
            average_earnings: 0,
            percentage_of_total: 0,
          }
          existing.appointment_count += 1
          existing.total_earnings += earning.total_amount || 0
          existing.total_tips += earning.tip_amount || 0
          serviceMap.set(serviceId, existing)
          total += earning.total_amount || 0
        }
      })
      // Calculate averages and percentages
      const serviceEarningsArray = Array.from(serviceMap.values()).map(service => ({
        ...service,
        average_earnings: service.appointment_count > 0 
          ? service.total_earnings / service.appointment_count 
          : 0,
        percentage_of_total: total > 0 
          ? (service.total_earnings / total) * 100 
          : 0,
      }))
      // Sort by total earnings descending
      serviceEarningsArray.sort((a, b) => b.total_earnings - a.total_earnings)
      setServiceEarnings(serviceEarningsArray)
      setTotalEarnings(total)
    } catch (_error) {
      toast.error("Failed to load earnings breakdown")
    } finally {
      setLoading(false)
    }
  }, [staffId, dateRange, supabase])

  useEffect(() => {
    loadBreakdown()
  }, [loadBreakdown])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }, [])

  const getTopPerformer = useCallback(() => {
    if (serviceEarnings.length === 0) return null
    return serviceEarnings[0]
  }, [serviceEarnings])
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Service</CardTitle>
          <CardDescription>Loading breakdown...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }
  const topPerformer = getTopPerformer()
  return (
    <div className="space-y-4">
      {topPerformer && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Top Performing Service</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{topPerformer.service_name}</p>
                {topPerformer.category_name && (
                  <p className="text-sm text-muted-foreground">
                    {topPerformer.category_name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {formatCurrency(topPerformer.total_earnings)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topPerformer.appointment_count} appointments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Service Type</CardTitle>
          <CardDescription>
            Detailed breakdown of your earnings by service
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serviceEarnings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No service earnings data available for this period
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="text-right">Tips</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceEarnings.map((service) => (
                  <TableRow key={service.service_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.service_name}</p>
                        {service.category_name && (
                          <p className="text-xs text-muted-foreground">
                            {service.category_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {service.appointment_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(service.total_earnings)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(service.total_tips)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(service.average_earnings)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress 
                          value={service.percentage_of_total} 
                          className="w-[60px]" 
                        />
                        <span className="text-sm font-medium w-[45px] text-right">
                          {service.percentage_of_total.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-center">
                    <Badge>
                      {serviceEarnings.reduce((sum, s) => sum + s.appointment_count, 0)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatCurrency(totalEarnings)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(
                      serviceEarnings.reduce((sum, s) => sum + s.total_tips, 0)
                    )}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-semibold">
                    100%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
