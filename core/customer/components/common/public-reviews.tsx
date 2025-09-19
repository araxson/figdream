import { getFeaturedReviews } from "../dal/reviews-queries";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle } from "lucide-react";

export async function PublicReviews() {
  const reviews = await getFeaturedReviews(undefined, 20);

  const renderStars = (rating: number | null) => {
    const ratingValue = rating || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < ratingValue
            ? "fill-current text-primary"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Customer Reviews</h1>
        <p className="text-xl text-muted-foreground">
          See what our customers are saying
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={review.customer?.avatar_url || ""} />
                  <AvatarFallback>
                    {review.customer?.display_name?.slice(0, 2).toUpperCase() ||
                      "CU"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {review.customer?.display_name || "Anonymous"}
                    </h3>
                    {review.is_verified && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    {renderStars(review.overall_rating)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(review.created_at || "").toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {review.title && (
                <h4 className="font-medium mb-2">{review.title}</h4>
              )}
              <p className="text-sm text-muted-foreground">{review.content}</p>

              {review.salon && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm">
                    <span className="font-medium">Salon:</span>{" "}
                    {review.salon.name}
                  </p>
                  {review.staff && (
                    <p className="text-sm">
                      <span className="font-medium">Staff:</span>{" "}
                      {review.staff.display_name}
                    </p>
                  )}
                </div>
              )}

              {review.response_content && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Business Response:</p>
                  <p className="text-sm text-muted-foreground">
                    {review.response_content}
                  </p>
                </div>
              )}

              {review.helpful_count && review.helpful_count > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  {review.helpful_count} people found this helpful
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
