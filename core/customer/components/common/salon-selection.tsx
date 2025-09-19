'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Clock, Star, Search, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Salon {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  total_reviews: number;
  is_active: boolean;
  business_hours: any;
}

export function SalonSelection() {
  const router = useRouter();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('salons')
        .select(`
          id,
          name,
          slug,
          description,
          address,
          city,
          state,
          business_hours,
          is_active
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSalons(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSalons = salons.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          salon.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          salon.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || salon.city === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const uniqueCities = Array.from(new Set(salons.map(s => s.city).filter(Boolean)));

  const handleSalonSelect = (salon: Salon) => {
    router.push(`/customer/book/${salon.slug}`);
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (salons.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card className="p-12 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Salons Available</h3>
          <p className="mt-2 text-muted-foreground">
            There are no salons available for booking at the moment.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Select a Salon</h1>
        <p className="text-muted-foreground mt-2">
          Choose a salon location to book your appointment
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by salon name, city, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {uniqueCities.length > 0 && (
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Locations</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}
      </div>

      {filteredSalons.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSalons.map((salon) => (
            <Card key={salon.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleSalonSelect(salon)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{salon.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {salon.city && salon.state ? `${salon.city}, ${salon.state}` : 'Location not specified'}
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Open
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {salon.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {salon.description}
                  </p>
                )}
                {salon.address && (
                  <p className="text-xs text-muted-foreground">
                    {salon.address}
                  </p>
                )}
                <Button className="w-full mt-4" variant="outline">
                  Select This Salon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}