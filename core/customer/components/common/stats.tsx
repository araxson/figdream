"use client";

import { Star, TrendingUp, MessageSquare, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewsStatsProps {
  metrics?: {
    total_reviews: number;
    average_rating: number;
    response_rate: number;
    average_response_time: number;
  };
}

export function ReviewsStats({ metrics }: ReviewsStatsProps) {
  const stats = [
    {
      title: "Total Reviews",
      value: metrics?.total_reviews || 0,
      icon: MessageSquare,
      description: "All time reviews",
    },
    {
      title: "Average Rating",
      value: (metrics?.average_rating || 0).toFixed(1),
      icon: Star,
      description: "Out of 5 stars",
    },
    {
      title: "Response Rate",
      value: `${metrics?.response_rate || 0}%`,
      icon: TrendingUp,
      description: "Reviews responded to",
    },
    {
      title: "Avg Response Time",
      value: `${metrics?.average_response_time || 0}h`,
      icon: Clock,
      description: "Time to first response",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
