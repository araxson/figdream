"use client";

import { useState } from "react";
import { ReviewsHeader } from "./header";
import { ReviewsStats } from "./stats";
import { ReviewsList } from "./list";
import { PendingReviews } from "./pending";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReviewsManagementProps {
  role: "admin" | "owner" | "manager" | "staff";
  salonId?: string;
}

export function ReviewsManagement({ role, salonId }: ReviewsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  // TODO: Replace with actual data fetching using hooks/actions
  const reviews: any[] = [];
  const metrics = {
    total_reviews: 0,
    average_rating: 0,
    response_rate: 0,
    average_response_time: 0,
  };
  const pendingCount = 0;

  return (
    <div className="space-y-6">
      <ReviewsHeader
        totalReviews={metrics.total_reviews}
        averageRating={metrics.average_rating}
        onSearch={setSearchTerm}
        onFilter={setRatingFilter}
      />

      <ReviewsStats metrics={metrics} />

      {pendingCount > 0 && <PendingReviews count={pendingCount} />}

      <Tabs defaultValue="published" className="space-y-4">
        <TabsList>
          <TabsTrigger value="published">Published Reviews</TabsTrigger>
          {role !== "staff" && pendingCount > 0 && (
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="published" className="space-y-4">
          <ReviewsList reviews={reviews} />
        </TabsContent>

        {role !== "staff" && pendingCount > 0 && (
          <TabsContent value="pending" className="space-y-4">
            <ReviewsList reviews={[]} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
