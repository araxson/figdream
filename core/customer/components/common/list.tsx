"use client";

import { useState } from "react";
import { Star, MessageSquare, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewWithRelations } from "../dal/reviews-types";

interface ReviewsListProps {
  reviews?: ReviewWithRelations[];
  onRespond?: (reviewId: string, response: string) => void;
}

export function ReviewsList({ reviews = [], onRespond }: ReviewsListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [response, setResponse] = useState("");

  const handleSubmitResponse = (reviewId: string) => {
    if (response.trim() && onRespond) {
      onRespond(reviewId, response);
      setReplyingTo(null);
      setResponse("");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-primary text-primary" : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.customer?.avatar_url} />
                  <AvatarFallback>
                    {review.customer?.full_name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{review.customer?.full_name || "Anonymous"}</h4>
                    <div className="flex">{renderStars(review.overall_rating)}</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    {review.service?.name && (
                      <>
                        <span>•</span>
                        <span>{review.service.name}</span>
                      </>
                    )}
                    {review.staff?.full_name && (
                      <>
                        <span>•</span>
                        <span>with {review.staff.full_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setReplyingTo(review.id)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem>Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{review.content}</p>

            {review.response_content && (
              <div className="rounded-lg bg-muted p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary">Business Response</Badge>
                  <span className="text-xs text-muted-foreground">
                    {review.response_at &&
                      new Date(review.response_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{review.response_content}</p>
              </div>
            )}

            {replyingTo === review.id && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Write your response..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setResponse("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmitResponse(review.id)}
                    disabled={!response.trim()}
                  >
                    Send Response
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
