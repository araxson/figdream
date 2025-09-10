import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, salonId, startDate, endDate } = body

    // Verify user has access to this salon
    const { data: salon } = await supabase
      .from('salons')
      .select('*')
      .eq('id', salonId)
      .eq('created_by', user.id)
      .single()

    if (!salon) {
      return NextResponse.json(
        { error: 'Unauthorized or salon not found' },
        { status: 403 }
      )
    }

    interface ReportData {
      salon: string
      generatedAt: string
      period: {
        start: string
        end: string
      }
      type?: string
      totalRevenue?: number
      appointmentCount?: number
      averageTicket?: number
      revenueByDay?: Record<string, number>
      topDay?: [string, number]
      totalAppointments?: number
      statusBreakdown?: Record<string, number>
      serviceBreakdown?: Record<string, number>
      staffBreakdown?: Record<string, number>
      cancellationRate?: number
      completionRate?: number
      totalCustomers?: number
      newCustomers?: number
      returningCustomers?: number
      averageVisits?: number
      topCustomers?: Array<{
        name: string
        email: string
        visits: number
        spent: number
      }>
      staffMembers?: number
      staffPerformance?: Array<{
        name: string
        email?: string
        appointments: number
        revenue: number
        ratings: number[]
        completedAppointments: number
        cancelledAppointments: number
        averageRating: number | null
        completionRate: number
      }>
    }
    
    let reportData: ReportData = {
      salon: salon.name,
      generatedAt: new Date().toISOString(),
      period: {
        start: startDate,
        end: endDate
      }
    }

    switch (type) {
      case 'revenue':
        // Revenue Report
        const { data: appointments } = await supabase
          .from('appointments')
          .select('computed_total_price, appointment_date, status')
          .eq('salon_id', salonId)
          .eq('status', 'completed')
          .gte('appointment_date', startDate)
          .lte('appointment_date', endDate)

        const totalRevenue = appointments?.reduce((sum, apt) => 
          sum + (apt.computed_total_price || 0), 0) || 0

        const revenueByDay = appointments?.reduce((acc, apt) => {
          const date = apt.appointment_date
          if (!acc[date]) acc[date] = 0
          acc[date] += apt.computed_total_price || 0
          return acc
        }, {} as Record<string, number>) || {}

        reportData = {
          ...reportData,
          type: 'Revenue Report',
          totalRevenue,
          appointmentCount: appointments?.length || 0,
          averageTicket: appointments?.length ? totalRevenue / appointments.length : 0,
          revenueByDay,
          topDay: Object.entries(revenueByDay).sort((a, b) => b[1] - a[1])[0]
        }
        break

      case 'appointments':
        // Appointments Report
        const { data: allAppointments } = await supabase
          .from('appointments')
          .select(`
            *,
            appointment_services(
              services(name, price)
            ),
            staff_profiles(
              profiles(full_name)
            )
          `)
          .eq('salon_id', salonId)
          .gte('appointment_date', startDate)
          .lte('appointment_date', endDate)

        const statusBreakdown = allAppointments?.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        const serviceBreakdown = allAppointments?.reduce((acc, apt) => {
          const serviceName = apt.appointment_services?.[0]?.services?.name || 'Unknown'
          acc[serviceName] = (acc[serviceName] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        const staffBreakdown = allAppointments?.reduce((acc, apt) => {
          const staffName = apt.staff_profiles?.profiles?.full_name || 'Unknown'
          acc[staffName] = (acc[staffName] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        reportData = {
          ...reportData,
          type: 'Appointments Report',
          totalAppointments: allAppointments?.length || 0,
          statusBreakdown,
          serviceBreakdown,
          staffBreakdown,
          cancellationRate: statusBreakdown.cancelled 
            ? (statusBreakdown.cancelled / (allAppointments?.length || 1)) * 100 
            : 0,
          completionRate: statusBreakdown.completed
            ? (statusBreakdown.completed / (allAppointments?.length || 1)) * 100
            : 0
        }
        break

      case 'customers':
        // Customer Report
        const { data: customers } = await supabase
          .from('appointments')
          .select(`
            customer_id,
            profiles:customer_id(*),
            computed_total_price
          `)
          .eq('salon_id', salonId)
          .gte('appointment_date', startDate)
          .lte('appointment_date', endDate)

        const uniqueCustomers = new Map()
        customers?.forEach(apt => {
          if (!uniqueCustomers.has(apt.customer_id)) {
            const profileData = apt.profiles as {
              first_name?: string
              last_name?: string
              email?: string
              created_at?: string
            } | null
            uniqueCustomers.set(apt.customer_id, {
              ...(profileData || {}),
              visitCount: 0,
              totalSpent: 0
            })
          }
          const customer = uniqueCustomers.get(apt.customer_id)
          customer.visitCount++
          customer.totalSpent += apt.computed_total_price || 0
        })

        const customerArray = Array.from(uniqueCustomers.values())
        const newCustomers = customerArray.filter(c => 
          new Date(c.created_at) >= new Date(startDate)
        ).length

        reportData = {
          ...reportData,
          type: 'Customer Report',
          totalCustomers: uniqueCustomers.size,
          newCustomers,
          returningCustomers: uniqueCustomers.size - newCustomers,
          averageVisits: customerArray.reduce((sum, c) => sum + c.visitCount, 0) / (uniqueCustomers.size || 1),
          topCustomers: customerArray
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 10)
            .map(c => ({
              name: `${c.first_name} ${c.last_name}`,
              email: c.email,
              visits: c.visitCount,
              spent: c.totalSpent
            }))
        }
        break

      case 'staff_performance':
        // Staff Performance Report
        const { data: staffAppointments } = await supabase
          .from('appointments')
          .select(`
            *,
            staff_profiles!inner(
              profiles(full_name, email)
            ),
            reviews(rating)
          `)
          .eq('salon_id', salonId)
          .gte('appointment_date', startDate)
          .lte('appointment_date', endDate)

        const staffPerformance = new Map()
        staffAppointments?.forEach(apt => {
          const staffId = apt.staff_id
          if (!staffPerformance.has(staffId)) {
            staffPerformance.set(staffId, {
              name: apt.staff_profiles?.profiles?.full_name || 'Unknown',
              email: apt.staff_profiles?.profiles?.email,
              appointments: 0,
              revenue: 0,
              ratings: [],
              completedAppointments: 0,
              cancelledAppointments: 0
            })
          }
          const staff = staffPerformance.get(staffId)
          staff.appointments++
          if (apt.status === 'completed') {
            staff.completedAppointments++
            staff.revenue += apt.computed_total_price || 0
          }
          if (apt.status === 'cancelled') {
            staff.cancelledAppointments++
          }
          if (apt.reviews?.[0]?.rating) {
            staff.ratings.push(apt.reviews[0].rating)
          }
        })

        const staffArray = Array.from(staffPerformance.values()).map(staff => ({
          ...staff,
          averageRating: staff.ratings.length 
            ? staff.ratings.reduce((sum: number, r: number) => sum + r, 0) / staff.ratings.length 
            : null,
          completionRate: staff.appointments 
            ? (staff.completedAppointments / staff.appointments) * 100 
            : 0
        }))

        reportData = {
          ...reportData,
          type: 'Staff Performance Report',
          staffMembers: staffArray.length,
          totalAppointments: staffAppointments?.length || 0,
          staffPerformance: staffArray.sort((a, b) => b.revenue - a.revenue)
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    // In production, you might want to:
    // 1. Generate a PDF using a library like jsPDF or puppeteer
    // 2. Save the report to storage
    // 3. Email the report to the user

    return NextResponse.json({ 
      success: true,
      report: reportData
    }, { status: 200 })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get available report types
    const reportTypes = [
      {
        type: 'revenue',
        name: 'Revenue Report',
        description: 'Analyze revenue trends and metrics'
      },
      {
        type: 'appointments',
        name: 'Appointments Report',
        description: 'Track appointment patterns and status'
      },
      {
        type: 'customers',
        name: 'Customer Report',
        description: 'Customer acquisition and retention metrics'
      },
      {
        type: 'staff_performance',
        name: 'Staff Performance Report',
        description: 'Evaluate staff productivity and ratings'
      }
    ]

    return NextResponse.json({ reportTypes }, { status: 200 })
  } catch (error) {
    console.error('Error fetching report types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report types' },
      { status: 500 }
    )
  }
}