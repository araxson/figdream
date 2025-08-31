import { createClient } from '@/lib/database/supabase/server';
import { getCustomers } from '@/lib/data-access/customers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, UserPlus, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SalonCustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/salon-owner');
  }

  // Get salon ID for the current user
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .single();

  if (!userRole?.salon_id) {
    redirect('/403');
  }

  const customers = await getCustomers(userRole.salon_id);

  // Calculate stats
  const totalCustomers = customers?.length || 0;
  const newCustomersThisMonth = customers?.filter(c => {
    const createdAt = new Date(c.created_at);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && 
           createdAt.getFullYear() === now.getFullYear();
  }).length || 0;

  const totalLifetimeValue = customers?.reduce((sum, c) => 
    sum + (c.customer_analytics?.[0]?.total_spent || 0), 0
  ) || 0;

  const avgVisitFrequency = customers?.reduce((sum, c) => 
    sum + (c.customer_analytics?.[0]?.visit_count || 0), 0
  ) / (totalCustomers || 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-gray-600">
            Manage your salon's customer base and view analytics
          </p>
        </div>
        <Button asChild>
          <Link href="/salon-admin/customers/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +{newCustomersThisMonth} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lifetime Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalLifetimeValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total revenue from customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Visit Frequency
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgVisitFrequency.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Visits per customer
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Retention Rate
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Last 90 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            Search and manage your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>

          {/* Customer Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Visits</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers && customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {customer.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Customer since {new Date(customer.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.profiles?.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              {customer.profiles.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.customer_analytics?.[0]?.visit_count || 0}
                      </TableCell>
                      <TableCell>
                        ${customer.customer_analytics?.[0]?.total_spent?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        {customer.customer_analytics?.[0]?.last_visit_date
                          ? new Date(customer.customer_analytics[0].last_visit_date).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/salon-admin/customers/${customer.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/salon-admin/customers/${customer.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No customers found. Add your first customer to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}