'use client'

import { ReviewsListClient } from './reviews-list'
import { ReviewMetricsClient } from './reviews-metrics'
import { ReviewResponsesClient } from './reviews-responses'
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

      <ReviewMetricsClient initialMetrics={{
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentReviews: []
      }} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reviews">All Reviews</TabsTrigger>
          <TabsTrigger value="pending">Pending Responses</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="mt-6">
          <ReviewsListClient initialReviews={[]} />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <ReviewResponsesClient initialReviews={[]} />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-6">
          <div>Review insights and trends</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}