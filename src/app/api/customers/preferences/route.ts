import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const customerPreferencesSchema = z.object({
  allergies: z.string().max(500).optional(),
  preferences: z.string().max(500).optional(),
  restrictions: z.string().max(500).optional()
})

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer profile
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    // Get customer preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('customer_preferences')
      .select('*')
      .eq('customer_id', customer.id)

    if (preferencesError) {
      console.error('Error fetching preferences:', preferencesError)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    // Parse preferences into structured data
    const preferenceData = {
      allergies: '',
      preferences: '',
      restrictions: ''
    }

    if (preferences && preferences.length > 0) {
      preferences.forEach(pref => {
        if (pref.preference_type === 'allergies') {
          preferenceData.allergies = pref.preference_value
        } else if (pref.preference_type === 'preferences') {
          preferenceData.preferences = pref.preference_value
        } else if (pref.preference_type === 'restrictions') {
          preferenceData.restrictions = pref.preference_value
        }
      })
    }

    return NextResponse.json({ preferences: preferenceData })

  } catch (error) {
    console.error('Error fetching customer preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validate request body with Zod
    const validation = customerPreferencesSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }
    
    const { allergies, preferences, restrictions } = validation.data

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer profile
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    // Delete existing preferences first
    const { error: deleteError } = await supabase
      .from('customer_preferences')
      .delete()
      .eq('customer_id', customer.id)

    if (deleteError) {
      console.error('Error deleting existing preferences:', deleteError)
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    // Prepare new preferences to save
    const preferencesToSave: Array<{
      customer_id: string
      preference_type: 'allergies' | 'preferences' | 'restrictions'
      preference_value: string
    }> = []

    if (allergies && allergies.trim()) {
      preferencesToSave.push({
        customer_id: customer.id,
        preference_type: 'allergies',
        preference_value: allergies.trim()
      })
    }

    if (preferences && preferences.trim()) {
      preferencesToSave.push({
        customer_id: customer.id,
        preference_type: 'preferences',
        preference_value: preferences.trim()
      })
    }

    if (restrictions && restrictions.trim()) {
      preferencesToSave.push({
        customer_id: customer.id,
        preference_type: 'restrictions',
        preference_value: restrictions.trim()
      })
    }

    // Insert new preferences if any
    if (preferencesToSave.length > 0) {
      const { error: insertError } = await supabase
        .from('customer_preferences')
        .insert(preferencesToSave)

      if (insertError) {
        console.error('Error inserting preferences:', insertError)
        return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error saving customer preferences:', error)
    return NextResponse.json(
      { error: 'Failed to save customer preferences' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { preference_type, preference_value } = body

    if (!preference_type || !preference_value) {
      return NextResponse.json(
        { error: 'Preference type and value are required' },
        { status: 400 }
      )
    }

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer profile
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    // Update or insert the specific preference
    const { error } = await supabase
      .from('customer_preferences')
      .upsert({
        customer_id: customer.id,
        preference_type,
        preference_value
      }, {
        onConflict: 'customer_id,preference_type'
      })

    if (error) {
      console.error('Error updating preference:', error)
      return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating customer preference:', error)
    return NextResponse.json(
      { error: 'Failed to update customer preference' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const preference_type = searchParams.get('preference_type')

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer profile
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    // Delete specific preference or all preferences
    let query = supabase
      .from('customer_preferences')
      .delete()
      .eq('customer_id', customer.id)

    if (preference_type) {
      query = query.eq('preference_type', preference_type as 'allergies' | 'preferences' | 'restrictions')
    }

    const { error } = await query

    if (error) {
      console.error('Error deleting preferences:', error)
      return NextResponse.json({ error: 'Failed to delete preferences' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting customer preferences:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer preferences' },
      { status: 500 }
    )
  }
}