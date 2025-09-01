'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/database/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, AlertCircle, Camera, Loader2 } from 'lucide-react';
import { createReview } from '@/lib/data-access/reviews/reviews';
import { toast } from 'sonner';
import type { Database } from '@/types/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  salons: { id: string; name: string } | null;
  services: { id: string; name: string } | null;
  staff_profiles: { id: string; first_name: string; last_name: string } | null;
};

export default function NewReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    loadCompletedAppointments();
  }, []);

  const loadCompletedAppointments = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login/customer');
        return;
      }

      // Get customer's completed appointments that haven't been reviewed
      const { data: customerData } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!customerData) {
        router.push('/register/customer');
        return;
      }

      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          salons (id, name),
          services (id, name),
          staff_profiles (id, first_name, last_name),
          reviews!left (id)
        `)
        .eq('customer_id', customerData.id)
        .eq('status', 'completed')
        .is('reviews.id', null) // Only appointments without reviews
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error loading appointments:', error);
        toast.error('Failed to load appointments');
      } else {
        setAppointments(appointmentsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAppointment) {
      toast.error('Please select an appointment to review');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write a review');
      return;
    }

    setLoading(true);

    try {
      const result = await createReview({
        salon_id: selectedAppointment.salon_id,
        location_id: selectedAppointment.location_id || undefined,
        service_id: selectedAppointment.service_id || undefined,
        staff_id: selectedAppointment.staff_id || undefined,
        booking_id: selectedAppointment.id,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
        photos: photos.length > 0 ? photos : undefined,
      });

      if (result) {
        toast.success('Review submitted successfully! It will be published after moderation.');
        router.push('/customer/reviews');
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An error occurred while submitting your review');
    } finally {
      setLoading(false);
    }
  };

  const renderStarInput = () => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-lg font-medium ml-2">
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </span>
      </div>
    );
  };

  if (loadingAppointments) {
    return (
      <div className="container mx-auto p-6 max-w-3xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Write a Review</h1>
        <p className="text-muted-foreground mt-2">
          Share your experience to help others find great salons
        </p>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Appointments to Review</h3>
            <p className="text-muted-foreground mb-4">
              You can only review completed appointments. Book a service to get started!
            </p>
            <Button onClick={() => router.push('/book')}>
              Book an Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Appointment</CardTitle>
              <CardDescription>
                Choose which appointment you'd like to review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedAppointment?.id || ''}
                onValueChange={(value) => {
                  const apt = appointments.find(a => a.id === value);
                  setSelectedAppointment(apt || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an appointment" />
                </SelectTrigger>
                <SelectContent>
                  {appointments.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {apt.salons?.name} - {apt.services?.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(apt.appointment_date).toLocaleDateString()} with {apt.staff_profiles?.first_name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedAppointment && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Your Rating</CardTitle>
                  <CardDescription>
                    How would you rate your experience?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderStarInput()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Review Details</CardTitle>
                  <CardDescription>
                    Tell us about your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Review Title (Optional)</Label>
                    <Input
                      id="title"
                      placeholder="Summarize your experience"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Your Review</Label>
                    <Textarea
                      id="content"
                      placeholder="Share details about your visit, the service quality, staff, and overall experience..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                      maxLength={1000}
                      required
                    />
                    <p className="text-sm text-muted-foreground text-right">
                      {content.length}/1000 characters
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your review will be published after moderation. Please be honest and constructive.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/customer/reviews')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}