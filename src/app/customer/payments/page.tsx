import { createClient } from '@/lib/database/supabase/server';
import { getCustomerByUserId } from '@/lib/data-access/customers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Calendar, CreditCard, Receipt, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default async function CustomerPaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/customer');
  }

  const customer = await getCustomerByUserId(user.id);
  
  if (!customer) {
    redirect('/register/customer');
  }

  // Get customer's appointments with payment information
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      total_price,
      payment_status,
      payment_method,
      payment_date,
      created_at,
      services (
        name,
        price
      ),
      salons (
        name
      ),
      staff_profiles (
        first_name,
        last_name
      )
    `)
    .eq('customer_id', customer.id)
    .order('appointment_date', { ascending: false });

  // Calculate payment statistics
  const paidAppointments = appointments?.filter(apt => apt.payment_status === 'paid') || [];
  const unpaidAppointments = appointments?.filter(apt => 
    apt.payment_status === 'pending' && apt.status === 'completed'
  ) || [];
  const totalPaid = paidAppointments.reduce((sum, apt) => sum + (apt.total_price || 0), 0);
  const totalPending = unpaidAppointments.reduce((sum, apt) => sum + (apt.total_price || 0), 0);

  // Get monthly spending for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const recentPayments = paidAppointments.filter(apt => 
    new Date(apt.payment_date || apt.appointment_date) >= sixMonthsAgo
  );
  
  const monthlySpending = recentPayments.reduce((acc, apt) => {
    const date = new Date(apt.payment_date || apt.appointment_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + (apt.total_price || 0);
    return acc;
  }, {} as Record<string, number>);

  const averageMonthlySpending = Object.values(monthlySpending).reduce((a, b) => a + b, 0) / 
    (Object.keys(monthlySpending).length || 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPaymentStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string | null) => {
    if (!method) return <CreditCard className="h-4 w-4" />;
    
    switch (method.toLowerCase()) {
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'card':
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payment History</h1>
        <p className="text-muted-foreground mt-2">
          View your payment records and spending history
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {paidAppointments.length} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {unpaidAppointments.length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageMonthlySpending)}</div>
            <p className="text-xs text-muted-foreground">
              Last 6 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Payment records are managed by your salon. If you have questions about a payment, 
          please contact your salon directly.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Transactions ({appointments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({paidAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({unpaidAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Complete history of all your service payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!appointments || appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payment records found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Salon</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>
                          {new Date(apt.appointment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{apt.salons?.name || 'N/A'}</TableCell>
                        <TableCell>{apt.services?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {apt.staff_profiles ? 
                            `${apt.staff_profiles.first_name} ${apt.staff_profiles.last_name}` : 
                            'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(apt.total_price || 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(apt.payment_method)}
                            <span className="capitalize">
                              {apt.payment_method || 'Not recorded'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(apt.payment_status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paid Transactions</CardTitle>
              <CardDescription>
                Services you've paid for
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paidAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No paid transactions found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Salon</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>
                          {new Date(apt.payment_date || apt.appointment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{apt.salons?.name || 'N/A'}</TableCell>
                        <TableCell>{apt.services?.name || 'N/A'}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(apt.total_price || 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(apt.payment_method)}
                            <span className="capitalize">
                              {apt.payment_method || 'Cash'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>
                Services awaiting payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unpaidAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending payments</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Date</TableHead>
                      <TableHead>Salon</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>
                          {new Date(apt.appointment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{apt.salons?.name || 'N/A'}</TableCell>
                        <TableCell>{apt.services?.name || 'N/A'}</TableCell>
                        <TableCell className="font-medium text-orange-600">
                          {formatCurrency(apt.total_price || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Pending</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Monthly Spending Breakdown */}
      {Object.keys(monthlySpending).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
            <CardDescription>Your spending over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(monthlySpending)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([month, amount]) => {
                  const [year, monthNum] = month.split('-');
                  const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  const isAboveAverage = amount > averageMonthlySpending;
                  
                  return (
                    <div key={month} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="font-medium">{monthName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isAboveAverage ? 'text-orange-600' : 'text-green-600'}`}>
                          {formatCurrency(amount)}
                        </span>
                        {isAboveAverage ? (
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}