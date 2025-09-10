import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// type Campaign = Database['public']['Tables']['email_campaigns']['Row']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { campaignId } = await request.json()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get target audience based on campaign criteria
    const { data: audience, error: audienceError } = await supabase
      .from('customers')
      .select('id, email, phone, first_name, last_name')
      .eq('salon_id', campaign?.salon_id || '')

    if (audienceError || !audience) {
      return NextResponse.json({ error: 'Failed to fetch audience' }, { status: 500 })
    }

    // Apply audience filters
    const targetAudience = audience
    // TODO: Implement audience filtering based on business requirements

    // Send campaign based on type
    let sentCount = 0
    let failedCount = 0
    
    for (const recipient of targetAudience) {
      try {
        if (recipient.email) {
          // Send email
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'campaign',
              to: recipient.email,
              subject: campaign?.subject || 'Campaign',
              data: {
                firstName: recipient.first_name,
                content: campaign?.content || '',
                salonName: campaign?.name || ''
              }
            })
          })
          
          if (emailResponse.ok) {
            sentCount++
          } else {
            failedCount++
          }
        } else if (recipient.phone) {
          // Send SMS
          const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'campaign',
              to: recipient.phone,
              message: campaign?.content || ''
            })
          })
          
          if (smsResponse.ok) {
            sentCount++
          } else {
            failedCount++
          }
        }

        // Record campaign recipient
        await supabase
          .from('email_campaign_recipients')
          .insert({
            campaign_id: campaignId,
            customer_id: recipient.id,
            sent_at: new Date().toISOString(),
            status: 'sent'
          })

      } catch (error) {
        failedCount++
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to send to ${recipient.email || recipient.phone}:`, error)
        }
      }
    }

    // Update campaign metrics
    await supabase
      .from('email_campaigns')
      .update({
        recipients_count: sentCount,
        sent_at: new Date().toISOString(),
        status: 'sent'
      })
      .eq('id', campaignId)

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: targetAudience.length
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Campaign send error:', error)
    }
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    )
  }
}