'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, AlertCircle, ThumbsUp, Flag, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, differenceInDays } from 'date-fns';

interface Review {
  id: string;
  salon_id: string;
  customer_id: string;
  appointment_id?: string;
  rating: number;
  title?: string;
  content: string;
  service_quality: number;
  staff_friendliness: number;
  cleanliness: number;
  value_for_money: number;
  is_verified: boolean;
  is_featured: boolean;
  is_flagged: boolean;
  response?: string;
  response_date?: string;
  responded_by?: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  appointments?: {
    id: string;
    appointment_date: string;
    services?: {
      name: string;
    };
    staff?: {
      full_name: string;
    };
  };
  users?: {
    full_name: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  responseRate: number;
  averageResponseTime: number;
  featuredCount: number;
  flaggedCount: number;
}

export function ReviewsManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    responseRate: 0,
    averageResponseTime: 0,
    featuredCount: 0,
    flaggedCount: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchReviews();
      fetchStats();
    }
  }, [salonId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customers (
            id,
            full_name,
            email,
            avatar_url
          ),
          appointments (
            id,
            appointment_date,
            services (
              name
            ),
            staff (
              full_name
            )
          ),
          users (
            full_name
          )
        `)
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('salon_id', salonId);

      if (error) throw error;

      if (data && data.length > 0) {
        // Calculate statistics
        const totalReviews = data.length;
        const averageRating = data.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
        
        const ratingDistribution = data.reduce((acc, r) => {
          acc[r.rating] = (acc[r.rating] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number });

        const reviewsWithResponses = data.filter(r => r.response);
        const responseRate = (reviewsWithResponses.length / totalReviews) * 100;

        // Calculate average response time
        let totalResponseTime = 0;
        let responseCount = 0;
        reviewsWithResponses.forEach(r => {
          if (r.response_date) {
            const days = differenceInDays(parseISO(r.response_date), parseISO(r.created_at));
            totalResponseTime += days;
            responseCount++;
          }
        });
        const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

        const featuredCount = data.filter(r => r.is_featured).length;
        const flaggedCount = data.filter(r => r.is_flagged).length;

        setStats({
          totalReviews,
          averageRating,
          ratingDistribution,
          responseRate,
          averageResponseTime,
          featuredCount,
          flaggedCount
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleResponse = async () => {
    if (!selectedReview) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reviews')
        .update({
          response: responseText,
          response_date: new Date().toISOString(),
          responded_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedReview.id);

      if (error) throw error;

      toast.success('Response posted successfully');
      setIsResponseOpen(false);
      setResponseText('');
      setSelectedReview(null);
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Error posting response:', error);
      toast.error('Failed to post response');
    }
  };

  const toggleFeatured = async (review: Review) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_featured: !review.is_featured })
        .eq('id', review.id);

      if (error) throw error;

      toast.success(`Review ${review.is_featured ? 'unfeatured' : 'featured'}`);
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const toggleFlag = async (review: Review) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_flagged: !review.is_flagged })
        .eq('id', review.id);

      if (error) throw error;

      toast.success(`Review ${review.is_flagged ? 'unflagged' : 'flagged'}`);
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const markHelpful = async (review: Review) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: review.helpful_count + 1 })
        .eq('id', review.id);

      if (error) throw error;

      fetchReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const openResponseDialog = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response || '');
    setIsResponseOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchTerm === '' || 
      review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customers?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'responded' && review.response) ||
      (filterStatus === 'pending' && !review.response) ||
      (filterStatus === 'featured' && review.is_featured) ||
      (filterStatus === 'flagged' && review.is_flagged);
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'positive' && review.rating >= 4) ||
      (activeTab === 'negative' && review.rating <= 2) ||
      (activeTab === 'needsResponse' && !review.response);
    
    return matchesSearch && matchesRating && matchesStatus && matchesTab;
  });

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!currentSalon) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          {isAdmin ? 'Please select a salon from the dropdown above' : 'No salon found'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate.toFixed(0)}%</div>
            <Progress value={stats.responseRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Avg response time: {stats.averageResponseTime.toFixed(0)} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featuredCount}</div>
            <p className="text-xs text-muted-foreground">
              Showcased reviews
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedCount}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                Manage and respond to customer feedback
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              <TabsTrigger value="positive">Positive (4-5⭐)</TabsTrigger>
              <TabsTrigger value="negative">Negative (1-2⭐)</TabsTrigger>
              <TabsTrigger value="needsResponse">Needs Response</TabsTrigger>
            </TabsList>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No reviews found</p>
                <p className="text-sm mt-2">Reviews will appear here as customers leave feedback</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className={review.is_flagged ? 'border-destructive' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={review.customers?.avatar_url} />
                            <AvatarFallback>
                              {review.customers?.full_name ? getInitials(review.customers.full_name) : 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {review.customers?.full_name || 'Anonymous'}
                              </span>
                              {review.is_verified && (
                                <Badge variant="outline" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                              {review.is_featured && (
                                <Badge variant="default" className="text-xs">
                                  Featured
                                </Badge>
                              )}
                              {review.is_flagged && (
                                <Badge variant="destructive" className="text-xs">
                                  Flagged
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              {renderStars(review.rating)}
                              <span className="text-sm text-muted-foreground">
                                {format(parseISO(review.created_at), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            {review.appointments && (
                              <div className="text-sm text-muted-foreground mt-1">
                                Service: {review.appointments.services?.name} with {review.appointments.staff?.full_name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatured(review)}
                            title={review.is_featured ? 'Unfeature' : 'Feature'}
                          >
                            <TrendingUp className={`h-4 w-4 ${review.is_featured ? 'text-primary' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFlag(review)}
                            title={review.is_flagged ? 'Unflag' : 'Flag'}
                          >
                            <Flag className={`h-4 w-4 ${review.is_flagged ? 'text-destructive' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      {review.title && (
                        <h4 className="font-medium mb-2">{review.title}</h4>
                      )}
                      <p className="text-sm mb-3">{review.content}</p>

                      {/* Detailed Ratings */}
                      <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Service</div>
                          <div className="font-medium">{review.service_quality}/5</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Staff</div>
                          <div className="font-medium">{review.staff_friendliness}/5</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Cleanliness</div>
                          <div className="font-medium">{review.cleanliness}/5</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Value</div>
                          <div className="font-medium">{review.value_for_money}/5</div>
                        </div>
                      </div>

                      {/* Response */}
                      {review.response && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1">Business Response</div>
                              <p className="text-sm">{review.response}</p>
                              <div className="text-xs text-muted-foreground mt-2">
                                Responded by {review.users?.full_name || 'Staff'} on{' '}
                                {review.response_date && format(parseISO(review.response_date), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markHelpful(review)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Helpful ({review.helpful_count})
                          </Button>
                        </div>
                        {!review.response && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openResponseDialog(review)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isResponseOpen} onOpenChange={setIsResponseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              Write a professional response to this customer review
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedReview.customers?.avatar_url} />
                      <AvatarFallback>
                        {selectedReview.customers?.full_name ? getInitials(selectedReview.customers.full_name) : 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">
                        {selectedReview.customers?.full_name || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(selectedReview.rating)}
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(selectedReview.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm">{selectedReview.content}</p>
                </CardContent>
              </Card>
              <div>
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Thank you for your feedback..."
                  rows={6}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResponse}>
              Post Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}