import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get salon ID
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', user.id)
      .single()

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Fetch invitations
    const { data, error } = await supabase
      .from('staff_invitations')
      .select('*')
      .eq('salon_id', salon.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Invitations fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    return NextResponse.json({ invitations: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role, firstName, lastName } = body

    // Validate required fields
    if (!email || !role || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get salon ID
    const { data: salon } = await supabase
      .from('salons')
      .select('id, name')
      .eq('created_by', user.id)
      .single()

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Create invitation
    const { data, error } = await supabase
      .from('staff_invitations')
      .insert({
        salon_id: salon.id,
        email: email,
        role: role,
        invited_by: user.id,
        metadata: {
          first_name: firstName,
          last_name: lastName
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Invitation create error:', error)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    return NextResponse.json({ invitation: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, action } = body

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updateData: Record<string, string> = { updated_at: new Date().toISOString() }

    if (action === 'resend') {
      updateData.status = 'pending'
    } else if (action === 'accept') {
      updateData.accepted_at = new Date().toISOString()
    } else if (action === 'reject') {
      updateData.status = 'rejected'
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('staff_invitations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Invitation update error:', error)
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }

    return NextResponse.json({ invitation: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Invitation ID required' }, { status: 400 })
    }

    // Get salon ID to verify ownership
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', user.id)
      .single()

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Delete invitation (only if it belongs to user's salon)
    const { error } = await supabase
      .from('staff_invitations')
      .delete()
      .eq('id', id)
      .eq('salon_id', salon.id)

    if (error) {
      console.error('Invitation delete error:', error)
      return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}