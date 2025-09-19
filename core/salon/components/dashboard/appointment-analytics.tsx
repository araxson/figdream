'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import type { HourlyBooking } from './types'

interface AppointmentAnalyticsProps {
  hourlyBookings: HourlyBooking[]
}

export function AppointmentAnalytics({ hourlyBookings }: AppointmentAnalyticsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Booking Patterns</CardTitle>
          <CardDescription>Hourly booking distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyBookings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Morning (9-12)</span>
                <Progress value={65} className="w-24" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Afternoon (12-5)</span>
                <Progress value={85} className="w-24" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Evening (5-8)</span>
                <Progress value={45} className="w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Online</span>
                <span className="font-semibold">68%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Phone</span>
                <span className="font-semibold">22%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Walk-in</span>
                <span className="font-semibold">10%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cancellation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold">8.5%</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Last 24h notice</span>
                  <span>65%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Same day</span>
                  <span>25%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>No show</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}