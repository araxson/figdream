"use client"

import {
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  Heart,
  Phone,
  Mail
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface CustomerOverviewProps {
  customer: {
    visit_count?: number | null
    total_spent?: number | null
    last_visit?: string | null
    loyalty_points?: number | null
    email?: string | null
    phone?: string | null
  }
  loyaltyTier: string
  loyaltyProgress: number
}

export function CustomerOverview({
  customer,
  loyaltyTier,
  loyaltyProgress
}: CustomerOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{customer.visit_count || 0}</p>
                <p className="text-sm text-muted-foreground">Total Visits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  ${customer.total_spent?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Loyalty Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={loyaltyTier === 'Gold' ? 'default' : loyaltyTier === 'Silver' ? 'secondary' : 'outline'}>
                {loyaltyTier}
              </Badge>
              <span className="text-sm">
                {customer.loyalty_points || 0} points
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{Math.round(loyaltyProgress)}%</p>
              <p className="text-xs text-muted-foreground">to next tier</p>
            </div>
          </div>
          <Progress value={loyaltyProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{customer.email || 'No email provided'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{customer.phone || 'No phone provided'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Last Visit */}
      {customer.last_visit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Last Visit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(customer.last_visit).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm">
              {customer.visit_count && customer.visit_count > 5 ? 'Regular customer' : 'New customer'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm">
              {customer.total_spent && customer.total_spent > 500 ? 'High value customer' : 'Growing customer'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}