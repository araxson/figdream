import { BookingWizard } from '@/core/booking/components';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    salonSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: salon } = await supabase
    .from('salons')
    .select('name, description')
    .eq('slug', resolvedParams.salonSlug)
    .single();

  if (!salon) {
    return {
      title: 'Salon Not Found',
    };
  }

  return {
    title: `Book Appointment at ${salon.name}`,
    description: salon.description,
  };
}

export default async function SalonBookingPage({ params }: PageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Get salon details
  const { data: salon, error } = await supabase
    .from('salons')
    .select('id, name, slug')
    .eq('slug', resolvedParams.salonSlug)
    .single();

  if (error || !salon) {
    notFound();
  }

  return <BookingWizard salonId={salon.id} />;
}