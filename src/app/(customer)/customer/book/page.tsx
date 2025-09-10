'use client'

import { Suspense } from 'react'
import { CardGridSkeleton } from '@/components/ui/skeleton-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Store, MapPin, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function BookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        <p className="text-muted-foreground mt-2">Find and book your perfect salon experience</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search salons by name or location..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Near Me
        </Button>
      </div>
      
      <Suspense fallback={<CardGridSkeleton count={6} className="md:grid-cols-2 lg:grid-cols-3" />}>
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Store className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold">No salons available</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;re adding new salons to our platform. Check back soon!
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}