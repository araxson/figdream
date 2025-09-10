'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'

interface PricingPlan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
  max_staff?: number
  max_locations?: number
}

export function PricingCards() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data: plansData, error: plansError } = await supabase
          .from('pricing_plans')
          .select('*')
          .order('sort_order', { ascending: true })

        if (plansError) throw plansError

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
          
          setPlans(plansWithFeatures)
        }
      } catch (error) {
        console.error('Error fetching pricing plans:', error)
        setError('Unable to load pricing plans. Please try again later.')
        // NO MOCK DATA - follow CLAUDE_CODE_INSTRUCTIONS.md rule
        setPlans([])
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error || plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {error || 'No pricing plans available at the moment.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              Most Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <div className="text-3xl font-bold">${plan.price}/mo</div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
              Get Started
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}