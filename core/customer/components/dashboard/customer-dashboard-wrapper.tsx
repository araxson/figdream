'use client';

import { useEffect, useState } from 'react';
import { CustomerDashboard } from './customer-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type {
  CustomerProfile,
  AppointmentHistoryItem,
  CustomerFavorite,
  CustomerLoyalty,
  Notification
} from '../../types';

export function CustomerDashboardWrapper() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentHistoryItem[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<AppointmentHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<CustomerFavorite[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<CustomerLoyalty[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          id: profileData.id,
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: user.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          zip: profileData.zip_code || '',
          avatarUrl: profileData.avatar_url,
          createdAt: profileData.created_at,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: false,
          marketingEmails: false
        });
      }

      // Fetch upcoming appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: upcomingData } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          end_time,
          status,
          total_amount,
          salon:salons(id, name),
          staff:staff_profiles(id, first_name, last_name),
          appointment_services(service:services(id, name))
        `)
        .eq('customer_id', user.id)
        .gte('appointment_date', today)
        .order('appointment_date', { ascending: true })
        .limit(5);

      if (upcomingData) {
        setUpcomingAppointments(upcomingData.map(apt => ({
          id: apt.id,
          salonName: apt.salon?.name || '',
          serviceName: apt.appointment_services?.[0]?.service?.name || '',
          staffName: `${apt.staff?.first_name || ''} ${apt.staff?.last_name || ''}`.trim(),
          date: apt.appointment_date,
          time: apt.start_time,
          status: apt.status as 'confirmed' | 'pending' | 'completed' | 'cancelled',
          amount: apt.total_amount || 0,
          rating: 0
        })));
      }

      // Fetch recent appointments
      const { data: recentData } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          status,
          total_amount,
          salon:salons(name),
          staff:staff_profiles(first_name, last_name),
          appointment_services(service:services(name))
        `)
        .eq('customer_id', user.id)
        .lt('appointment_date', today)
        .order('appointment_date', { ascending: false })
        .limit(3);

      if (recentData) {
        setRecentAppointments(recentData.map(apt => ({
          id: apt.id,
          salonName: apt.salon?.name || '',
          serviceName: apt.appointment_services?.[0]?.service?.name || '',
          staffName: `${apt.staff?.first_name || ''} ${apt.staff?.last_name || ''}`.trim(),
          date: apt.appointment_date,
          time: apt.start_time,
          status: apt.status as 'confirmed' | 'pending' | 'completed' | 'cancelled',
          amount: apt.total_amount || 0,
          rating: 0
        })));
      }

      // Set empty arrays for now - these features can be implemented later
      setFavorites([]);
      setLoyaltyPrograms([]);
      setNotifications([]);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please complete your profile to continue</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <CustomerDashboard
      profile={profile}
      upcomingAppointments={upcomingAppointments}
      recentAppointments={recentAppointments}
      favorites={favorites}
      loyaltyPrograms={loyaltyPrograms}
      notifications={notifications}
    />
  );
}