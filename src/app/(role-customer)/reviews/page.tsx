import { createClient } from '@/lib/database/supabase/server';
import { getCustomerByUserId } from '@/lib/data-access/customers';
import { getReviews } from '@/lib/data-access/reviews/reviews';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
} from '@/components/ui';
import { Star, Calendar, ShieldCheck, MessageSquare, ThumbsUp, Camera, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CustomerReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/customer');
  }

  const customer = await getCustomerByUserId(user.id);
  
  if (!customer) {
    redirect('/register/customer');
  }

  // Get customer's reviews
  const reviewsResult = await getReviews({
    customer_id: customer.id,
    limit: 50,
    offset: 0,
    sort_by: 'date_desc'
  });

  const reviews = reviewsResult?.reviews || [];
  
  // Categorize reviews
  const publishedReviews = reviews.filter(r => r.status === 'approved');
  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const rejectedReviews = reviews.filter(r => r.status === 'rejected');

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const ReviewCard = ({ review }: { review: any }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{review.salons?.name || 'Salon'}</CardTitle>
              {review.verified_purchase && (
                <Badge variant="outline" className="text-xs">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
              {review.services?.name && (
                <span>Service: {review.services.name}</span>
              )}
              {review.staff_profiles?.first_name && (
                <span>Staff: {review.staff_profiles.first_name}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {renderRating(review.rating)}
            {getStatusBadge(review.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {review.title && (
          <h4 className="font-semibold">{review.title}</h4>
        )}
        <p className="text-sm">{review.content}</p>
        
        {review.photos && review.photos.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Camera className="h-4 w-4" />
            <span>{review.photos.length} photo(s) attached</span>
          </div>
        )}
        
        {review.review_responses && review.review_responses.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Business Response</span>
            </div>
            <p className="text-sm">{review.review_responses[0].response}</p>
          </div>
        )}
        
        <Separator />
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ThumbsUp className="h-4 w-4" />
            <span>{review.helpful_count || 0} found helpful</span>
          </div>
          {review.status === 'approved' && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/customer/reviews/${review.id}/edit`}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Reviews</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your salon reviews
          </p>
        </div>
        <Button asChild>
          <Link href="/role-customer/reviews/new">
            Write a Review
          </Link>
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Share your experiences and help others find great salons
            </p>
            <Button asChild>
              <Link href="/role-customer/appointments">
                View Past Appointments
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="published" className="space-y-4">
          <TabsList>
            <TabsTrigger value="published">
              Published ({publishedReviews.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingReviews.length})
            </TabsTrigger>
            {rejectedReviews.length > 0 && (
              <TabsTrigger value="rejected">
                Rejected ({rejectedReviews.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="published" className="space-y-4">
            {publishedReviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No published reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              publishedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingReviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No pending reviews</p>
                </CardContent>
              </Card>
            ) : (
              pendingReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </TabsContent>

          {rejectedReviews.length > 0 && (
            <TabsContent value="rejected" className="space-y-4">
              {rejectedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </TabsContent>
          )}
        </Tabs>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <p className="text-sm">Be honest and constructive in your feedback</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <p className="text-sm">Focus on your personal experience</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <p className="text-sm">Avoid offensive language or personal attacks</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <p className="text-sm">Include specific details about services received</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}