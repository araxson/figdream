'use client'

import * as React from 'react'
import { createClient } from '@/lib/database/supabase/server';
import { getCustomers } from '@/lib/data-access/customers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Progress,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  ScrollArea,
  Badge,
  Separator,
  Skeleton,
} from '@/components/ui';
import { Toaster } from 'sonner';
import { Search, UserPlus, Mail, Phone, Calendar, DollarSign, MoreHorizontal, Edit, Trash2, Eye, MessageSquare, Filter, Download } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { CustomerHoverCard } from '@/components/shared/hovers';

export default function SalonCustomersPage() {
  const [customers, setCustomers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [viewMode, setViewMode] = React.useState('list')
  const [spendingRange, setSpendingRange] = React.useState([0])
  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null)

  React.useEffect(() => {
    async function fetchCustomers() {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          redirect('/login/salon-owner');
          return;
        }

        // Get salon ID for the current user
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('salon_id')
          .eq('user_id', user.id)
          .single();

        if (!userRole?.salon_id) {
          redirect('/403');
          return;
        }

        const customersData = await getCustomers(userRole.salon_id);
        setCustomers(customersData || []);
      } catch (error) {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      // Delete logic here
      toast.success('Customer deleted successfully');
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const customerSpent = customer.customer_analytics?.[0]?.total_spent || 0;
    const matchesSpending = customerSpent >= spendingRange[0];
    
    return matchesSearch && matchesSpending;
  });

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

  const retentionRate = totalCustomers > 0 ? 
    (customers.filter(c => (c.customer_analytics?.[0]?.visit_count || 0) > 1).length / totalCustomers) * 100 : 0;

  const maxSpending = Math.max(...customers.map(c => c.customer_analytics?.[0]?.total_spent || 0), 1000);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your salon's customer base and view analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/salon-admin/customers/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Customer
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards with Progress Bars */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">+{newCustomersThisMonth} this month</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lifetime Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalLifetimeValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mb-2">Total revenue from customers</p>
              <Progress value={(totalLifetimeValue / (maxSpending * totalCustomers || 1)) * 100} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Visit Frequency</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgVisitFrequency.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mb-2">Visits per customer</p>
              <Progress value={Math.min((avgVisitFrequency / 10) * 100, 100)} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <Badge variant={retentionRate > 80 ? "default" : retentionRate > 60 ? "secondary" : "destructive"}>
                {retentionRate > 80 ? "Excellent" : retentionRate > 60 ? "Good" : "Needs Improvement"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{retentionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mb-2">Repeat customers</p>
              <Progress value={retentionRate} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Enhanced Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>Search, filter, and manage your customers</CardDescription>
              </div>
              <ToggleGroup type="single" value={viewMode} onValueChange={setViewMode}>
                <ToggleGroupItem value="list" aria-label="List view">
                  <Filter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <Eye className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Spending Filter Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Minimum Spending</label>
                  <Badge variant="outline">${spendingRange[0]}</Badge>
                </div>
                <Slider
                  value={spendingRange}
                  onValueChange={setSpendingRange}
                  max={maxSpending}
                  step={50}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export ({filteredCustomers.length})
                </Button>
                <Badge variant="secondary" className="ml-auto">
                  {filteredCustomers.length} of {totalCustomers} customers
                </Badge>
              </div>
            </div>

            {/* Enhanced Customer Table with Context Menu and Alert Dialogs */}
            <ScrollArea className="h-[600px] mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Visits</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <ContextMenu key={customer.id}>
                          <ContextMenuTrigger asChild>
                            <TableRow className="cursor-context-menu">
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    <CustomerHoverCard customer={customer.profiles || customer}>
                                      <button className="text-left hover:text-primary transition-colors">
                                        {customer.profiles?.full_name || 'Unknown'}
                                      </button>
                                    </CustomerHoverCard>
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Since {new Date(customer.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {customer.profiles?.email && (
                                    <div className="flex items-center gap-1 text-sm">
                                      <Mail className="h-3 w-3 text-muted-foreground" />
                                      {customer.profiles.email}
                                    </div>
                                  )}
                                  {customer.phone && (
                                    <div className="flex items-center gap-1 text-sm">
                                      <Phone className="h-3 w-3 text-muted-foreground" />
                                      {customer.phone}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {customer.customer_analytics?.[0]?.visit_count || 0}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  ${customer.customer_analytics?.[0]?.total_spent?.toFixed(2) || '0.00'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {customer.customer_analytics?.[0]?.last_visit_date
                                  ? new Date(customer.customer_analytics[0].last_visit_date).toLocaleDateString()
                                  : 'Never'
                                }
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {/* Mobile Drawer for Customer Details */}
                                  <Drawer>
                                    <DrawerTrigger asChild>
                                      <Button variant="ghost" size="sm" className="md:hidden">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DrawerTrigger>
                                    <DrawerContent>
                                      <DrawerHeader>
                                        <DrawerTitle>{customer.profiles?.full_name || 'Customer'}</DrawerTitle>
                                        <DrawerDescription>
                                          Customer details and analytics
                                        </DrawerDescription>
                                      </DrawerHeader>
                                      <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <span className="text-sm text-muted-foreground">Total Visits</span>
                                            <p className="font-medium">{customer.customer_analytics?.[0]?.visit_count || 0}</p>
                                          </div>
                                          <div>
                                            <span className="text-sm text-muted-foreground">Total Spent</span>
                                            <p className="font-medium">${customer.customer_analytics?.[0]?.total_spent?.toFixed(2) || '0.00'}</p>
                                          </div>
                                        </div>
                                        <Separator />
                                        <div className="flex gap-2">
                                          <Button asChild className="flex-1">
                                            <Link href={`/salon-admin/customers/${customer.id}`}>
                                              <Eye className="mr-2 h-4 w-4" />
                                              View Details
                                            </Link>
                                          </Button>
                                          <Button variant="outline" asChild className="flex-1">
                                            <Link href={`/salon-admin/customers/${customer.id}/edit`}>
                                              <Edit className="mr-2 h-4 w-4" />
                                              Edit
                                            </Link>
                                          </Button>
                                        </div>
                                      </div>
                                    </DrawerContent>
                                  </Drawer>

                                  {/* Desktop Actions */}
                                  <div className="hidden md:flex gap-1">
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={`/salon-admin/customers/${customer.id}`}>
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={`/salon-admin/customers/${customer.id}/edit`}>
                                        <Edit className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete {customer.profiles?.full_name || 'this customer'}? 
                                            This action cannot be undone and will remove all associated data.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDeleteCustomer(customer.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Delete Customer
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem asChild>
                              <Link href={`/salon-admin/customers/${customer.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </ContextMenuItem>
                            <ContextMenuItem asChild>
                              <Link href={`/salon-admin/customers/${customer.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Customer
                              </Link>
                            </ContextMenuItem>
                            <ContextMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem 
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Customer
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchQuery || spendingRange[0] > 0 ? 
                            'No customers match your current filters.' : 
                            'No customers found. Add your first customer to get started.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}