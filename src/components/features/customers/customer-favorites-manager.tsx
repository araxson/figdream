'use client';

import { useState, useEffect } from 'react';
import { Heart, Star, Users, Calendar, TrendingUp, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface CustomerFavorite {
  id: string;
  customer_id: string;
  salon_id: string;
  service_id?: string;
  staff_id?: string;
  product_id?: string;
  favorite_type: 'service' | 'staff' | 'product';
  notes?: string;
  created_at: string;
  customers?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  services?: {
    id: string;
    name: string;
    category: string;
    price: number;
    duration: number;
  };
  staff?: {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
  };
  products?: {
    id: string;
    name: string;
    price: number;
    category: string;
  };
}

interface FavoriteStats {
  totalFavorites: number;
  servicesFavorites: number;
  staffFavorites: number;
  productsFavorites: number;
  topService?: { name: string; count: number };
  topStaff?: { name: string; count: number };
  topProduct?: { name: string; count: number };
}

export function CustomerFavoritesManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [favorites, setFavorites] = useState<CustomerFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<FavoriteStats>({
    totalFavorites: 0,
    servicesFavorites: 0,
    staffFavorites: 0,
    productsFavorites: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchFavorites();
      fetchStats();
    }
  }, [salonId]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customer_favorites')
        .select(`
          *,
          customers (
            id,
            full_name,
            email,
            phone,
            avatar_url
          ),
          services (
            id,
            name,
            category,
            price,
            duration
          ),
          staff (
            id,
            full_name,
            role,
            avatar_url
          ),
          products (
            id,
            name,
            price,
            category
          )
        `)
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load customer favorites');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_favorites')
        .select('*')
        .eq('salon_id', salonId);

      if (error) throw error;

      // Calculate statistics
      const servicesFavs = data?.filter(f => f.favorite_type === 'service') || [];
      const staffFavs = data?.filter(f => f.favorite_type === 'staff') || [];
      const productsFavs = data?.filter(f => f.favorite_type === 'product') || [];

      // Get top items
      const getTopItem = (items: any[], key: string) => {
        const counts = items.reduce((acc, item) => {
          const id = item[key];
          if (id) {
            acc[id] = (acc[id] || 0) + 1;
          }
          return acc;
        }, {});
        
        const topId = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0];
        return topId ? { id: topId[0], count: topId[1] as number } : null;
      };

      const topService = getTopItem(servicesFavs, 'service_id');
      const topStaff = getTopItem(staffFavs, 'staff_id');
      const topProduct = getTopItem(productsFavs, 'product_id');

      setStats({
        totalFavorites: data?.length || 0,
        servicesFavorites: servicesFavs.length,
        staffFavorites: staffFavs.length,
        productsFavorites: productsFavs.length,
        topService: topService ? { name: 'Top Service', count: topService.count } : undefined,
        topStaff: topStaff ? { name: 'Top Staff', count: topStaff.count } : undefined,
        topProduct: topProduct ? { name: 'Top Product', count: topProduct.count } : undefined
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    if (!confirm('Are you sure you want to remove this favorite?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('customer_favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Favorite removed');
      fetchFavorites();
      fetchStats();
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = searchTerm === '' || 
      favorite.customers?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.customers?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.services?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.staff?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.products?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || favorite.favorite_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFavoriteIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <Calendar className="h-4 w-4" />;
      case 'staff':
        return <Users className="h-4 w-4" />;
      case 'product':
        return <Star className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

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
              <Skeleton key={i} className="h-16 w-full" />
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
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFavorites}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Favorites</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.servicesFavorites}</div>
            {stats.topService && (
              <p className="text-xs text-muted-foreground">
                Top: {stats.topService.count} customers
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Favorites</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.staffFavorites}</div>
            {stats.topStaff && (
              <p className="text-xs text-muted-foreground">
                Top: {stats.topStaff.count} customers
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productsFavorites}</div>
            {stats.topProduct && (
              <p className="text-xs text-muted-foreground">
                Top: {stats.topProduct.count} customers
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Favorites</CardTitle>
              <CardDescription>
                Track customer preferences for services, staff, and products
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="by-customer">By Customer</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search favorites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="overview">
              {filteredFavorites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No customer favorites found</p>
                  <p className="text-sm mt-2">Customer favorites will appear here as they save their preferences</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Favorite Item</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFavorites.map((favorite) => (
                      <TableRow key={favorite.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={favorite.customers?.avatar_url} />
                              <AvatarFallback>
                                {favorite.customers?.full_name ? getInitials(favorite.customers.full_name) : 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {favorite.customers?.full_name || 'Unknown'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {favorite.customers?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFavoriteIcon(favorite.favorite_type)}
                            <Badge variant="outline">
                              {favorite.favorite_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {favorite.favorite_type === 'service' && favorite.services?.name}
                              {favorite.favorite_type === 'staff' && favorite.staff?.full_name}
                              {favorite.favorite_type === 'product' && favorite.products?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {favorite.favorite_type === 'service' && `${favorite.services?.category} • $${favorite.services?.price}`}
                              {favorite.favorite_type === 'staff' && favorite.staff?.role}
                              {favorite.favorite_type === 'product' && `${favorite.products?.category} • $${favorite.products?.price}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(favorite.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {favorite.notes || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFavorite(favorite.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="by-customer">
              <div className="space-y-4">
                {(() => {
                  // Group favorites by customer
                  const customerGroups = filteredFavorites.reduce((acc, fav) => {
                    const customerId = fav.customer_id;
                    if (!acc[customerId]) {
                      acc[customerId] = {
                        customer: fav.customers,
                        favorites: []
                      };
                    }
                    acc[customerId].favorites.push(fav);
                    return acc;
                  }, {} as Record<string, { customer: any; favorites: CustomerFavorite[] }>);

                  return Object.values(customerGroups).map(({ customer, favorites }) => (
                    <Card key={customer?.id || 'unknown'}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={customer?.avatar_url} />
                              <AvatarFallback>
                                {customer?.full_name ? getInitials(customer.full_name) : 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customer?.full_name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{customer?.email}</div>
                            </div>
                          </div>
                          <Badge>{favorites.length} favorites</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Services</div>
                            <div className="space-y-1">
                              {favorites
                                .filter(f => f.favorite_type === 'service')
                                .map(f => (
                                  <div key={f.id} className="text-sm text-muted-foreground">
                                    • {f.services?.name}
                                  </div>
                                ))}
                              {favorites.filter(f => f.favorite_type === 'service').length === 0 && (
                                <div className="text-sm text-muted-foreground">None</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Staff</div>
                            <div className="space-y-1">
                              {favorites
                                .filter(f => f.favorite_type === 'staff')
                                .map(f => (
                                  <div key={f.id} className="text-sm text-muted-foreground">
                                    • {f.staff?.full_name}
                                  </div>
                                ))}
                              {favorites.filter(f => f.favorite_type === 'staff').length === 0 && (
                                <div className="text-sm text-muted-foreground">None</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Products</div>
                            <div className="space-y-1">
                              {favorites
                                .filter(f => f.favorite_type === 'product')
                                .map(f => (
                                  <div key={f.id} className="text-sm text-muted-foreground">
                                    • {f.products?.name}
                                  </div>
                                ))}
                              {favorites.filter(f => f.favorite_type === 'product').length === 0 && (
                                <div className="text-sm text-muted-foreground">None</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ));
                })()}
              </div>
            </TabsContent>

            <TabsContent value="trending">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Most Favorited Services */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const serviceCounts = favorites
                          .filter(f => f.favorite_type === 'service' && f.service_id)
                          .reduce((acc, f) => {
                            const key = `${f.service_id}|${f.services?.name}`;
                            acc[key] = (acc[key] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                        
                        return Object.entries(serviceCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([key, count], index) => {
                            const [id, name] = key.split('|');
                            return (
                              <div key={id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">#{index + 1}</span>
                                  <span className="text-sm">{name}</span>
                                </div>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Most Favorited Staff */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Staff</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const staffCounts = favorites
                          .filter(f => f.favorite_type === 'staff' && f.staff_id)
                          .reduce((acc, f) => {
                            const key = `${f.staff_id}|${f.staff?.full_name}`;
                            acc[key] = (acc[key] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                        
                        return Object.entries(staffCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([key, count], index) => {
                            const [id, name] = key.split('|');
                            return (
                              <div key={id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">#{index + 1}</span>
                                  <span className="text-sm">{name}</span>
                                </div>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Most Favorited Products */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const productCounts = favorites
                          .filter(f => f.favorite_type === 'product' && f.product_id)
                          .reduce((acc, f) => {
                            const key = `${f.product_id}|${f.products?.name}`;
                            acc[key] = (acc[key] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                        
                        return Object.entries(productCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([key, count], index) => {
                            const [id, name] = key.split('|');
                            return (
                              <div key={id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">#{index + 1}</span>
                                  <span className="text-sm">{name}</span>
                                </div>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}