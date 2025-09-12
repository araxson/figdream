import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: plansData, error: plansError } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('sort_order', { ascending: true })

    if (plansError) {
      console.error('Error fetching pricing plans:', plansError)
      return NextResponse.json(
        { error: 'Failed to fetch pricing plans' },
        { status: 500 }
      )
    }

    if (plansData) {
      // Fetch features for each plan
      const plansWithFeatures = await Promise.all(
        plansData.map(async (plan) => {
          const { data: featuresData } = await supabase
            .from('pricing_features')
            .select('feature_text')
            .eq('plan_id', plan.id)
            .eq('is_included', true)
            .order('sort_order', { ascending: true })

          return {
            id: plan.id,
            name: plan.name,
            price: plan.monthly_price,
            description: plan.description || '',
            features: featuresData?.map(f => f.feature_text) || [],
            popular: plan.is_popular || false
          }
        })
      )
      
      return NextResponse.json(plansWithFeatures)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Get pricing plans error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    )
  }
}