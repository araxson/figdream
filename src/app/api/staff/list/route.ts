import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const supabase = await createClient()
    
    // Get salon owned by user
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    const { data: staffData, error } = await supabase
      .from('staff_profiles')
      .select(`
        *,
        profiles(*)
      `)
      .eq('salon_id', salon.id)
      .order('created_at')

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json(
        { error: 'Failed to fetch staff data' },
        { status: 500 }
      )
    }

    return NextResponse.json({ staff: staffData || [] })
  } catch (error) {
    console.error('Staff list API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { action, staffId, staffData } = await request.json()
    const supabase = await createClient()
    
    // Get salon owned by user
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }
    
    if (action === 'add' && staffData) {
      const { error } = await supabase
        .from('staff_profiles')
        .insert({
          salon_id: salon.id,
          user_id: staffData.userId,
          employee_id: `EMP-${Date.now()}`,
          title: staffData.title || 'Staff',
          commission_rate: staffData.commissionRate || 0,
          specialties: staffData.specialties || [],
          is_active: true
        })
      
      if (error) {
        console.error('Error adding staff:', error)
        return NextResponse.json(
          { error: 'Failed to add staff member' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'update' && staffId && staffData) {
      const { error } = await supabase
        .from('staff_profiles')
        .update({
          title: staffData.title,
          commission_rate: staffData.commissionRate,
          specialties: staffData.specialties,
          is_active: staffData.isActive
        })
        .eq('id', staffId)
        .eq('salon_id', salon.id)
      
      if (error) {
        console.error('Error updating staff:', error)
        return NextResponse.json(
          { error: 'Failed to update staff member' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'delete' && staffId) {
      const { error } = await supabase
        .from('staff_profiles')
        .update({ is_active: false })
        .eq('id', staffId)
        .eq('salon_id', salon.id)
      
      if (error) {
        console.error('Error deactivating staff:', error)
        return NextResponse.json(
          { error: 'Failed to deactivate staff member' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Staff action API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}