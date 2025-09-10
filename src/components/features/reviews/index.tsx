'use client'

import { ReviewsList } from './reviews-list'
import { ReviewMetrics } from './reviews-metrics'
import { ReviewResponses } from './reviews-responses'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

export function OwnerReviews() {
  const [activeTab, setActiveTab] = useState('reviews')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">Manage customer reviews and feedback</p>
      </div>

      <ReviewMetrics />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reviews">All Reviews</TabsTrigger>
          <TabsTrigger value="pending">Pending Responses</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="mt-6">
          <ReviewsList />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <ReviewResponses />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-6">
          <div>Review insights and trends</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}