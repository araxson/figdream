import { createClient } from '@/lib/database/supabase/server';
import { getStaffByUserId, getStaffEarnings } from '@/lib/data-access/staff';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, 
  CreditCard, Receipt, Award, ChevronUp, ChevronDown
} from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function StaffEarningsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/staff');
  }

  const staff = await getStaffByUserId(user.id);
  
  if (!staff) {
    redirect('/register/staff');
  }

  // Get earnings data for different periods
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];

  // Get earnings data
  const [currentMonthEarnings, lastMonthEarnings, yearEarnings] = await Promise.all([
    getStaffEarnings(staff.id, thisMonthStart),
    getStaffEarnings(staff.id, lastMonthStart, lastMonthEnd),
    getStaffEarnings(staff.id, yearStart)
  ]);

  // Calculate totals
  const calculateTotals = (earnings: any[]) => {
    return earnings?.reduce((acc, earning) => ({
      base: acc.base + (earning.base_amount || 0),
      commission: acc.commission + (earning.commission_amount || 0),
      tips: acc.tips + (earning.tip_amount || 0),
      bonus: acc.bonus + (earning.bonus_amount || 0),
      total: acc.total + (earning.total_amount || 0),
      services: acc.services + (earning.service_count || 0)
    }), { base: 0, commission: 0, tips: 0, bonus: 0, total: 0, services: 0 }) || 
    { base: 0, commission: 0, tips: 0, bonus: 0, total: 0, services: 0 };
  };

  const currentMonthTotals = calculateTotals(currentMonthEarnings || []);
  const lastMonthTotals = calculateTotals(lastMonthEarnings || []);
  const yearTotals = calculateTotals(yearEarnings || []);

  // Calculate month-over-month growth
  const monthGrowth = lastMonthTotals.total > 0 
    ? ((currentMonthTotals.total - lastMonthTotals.total) / lastMonthTotals.total * 100)
    : 0;

  // Calculate average per service
  const avgPerService = currentMonthTotals.services > 0 
    ? currentMonthTotals.total / currentMonthTotals.services
    : 0;

  // Group earnings by week for current month
  const weeklyEarnings = (currentMonthEarnings || []).reduce((acc: any, earning: any) => {
    const date = new Date(earning.earning_date);
    const weekNumber = Math.ceil(date.getDate() / 7);
    const weekKey = `Week ${weekNumber}`;
    
    if (!acc[weekKey]) {
      acc[weekKey] = { total: 0, services: 0, days: new Set() };
    }
    
    acc[weekKey].total += earning.total_amount || 0;
    acc[weekKey].services += earning.service_count || 0;
    acc[weekKey].days.add(earning.earning_date);
    
    return acc;
  }, {});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Earnings Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your earnings, commissions, and performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthTotals.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {monthGrowth > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+{monthGrowth.toFixed(1)}%</span>
                  <span className="ml-1">from last month</span>
                </>
              ) : monthGrowth < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600">{monthGrowth.toFixed(1)}%</span>
                  <span className="ml-1">from last month</span>
                </>
              ) : (
                <span>Same as last month</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year to Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearTotals.total)}</div>
            <p className="text-xs text-muted-foreground">
              {yearTotals.services} services completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Service</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgPerService)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tips</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthTotals.tips)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>
                Your earnings composition for this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Base Salary</p>
                      <p className="text-sm text-muted-foreground">Fixed earnings</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(currentMonthTotals.base)}</p>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Commission</p>
                      <p className="text-sm text-muted-foreground">Service-based earnings</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(currentMonthTotals.commission)}</p>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Tips</p>
                      <p className="text-sm text-muted-foreground">Customer gratuities</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(currentMonthTotals.tips)}</p>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Bonuses</p>
                      <p className="text-sm text-muted-foreground">Performance bonuses</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(currentMonthTotals.bonus)}</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">Total Earnings</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(currentMonthTotals.total)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Earnings</CardTitle>
              <CardDescription>
                Daily breakdown of your earnings this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentMonthEarnings && currentMonthEarnings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Base</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Tips</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMonthEarnings.map((earning: any) => (
                      <TableRow key={earning.id}>
                        <TableCell>{formatDate(earning.earning_date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{earning.service_count || 0}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(earning.base_amount || 0)}</TableCell>
                        <TableCell>{formatCurrency(earning.commission_amount || 0)}</TableCell>
                        <TableCell>{formatCurrency(earning.tip_amount || 0)}</TableCell>
                        <TableCell>{formatCurrency(earning.bonus_amount || 0)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(earning.total_amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No earnings recorded for this month yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trends</CardTitle>
              <CardDescription>
                Your earnings progression throughout the month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(weeklyEarnings).map(([week, data]: [string, any]) => {
                  const avgPerDay = data.total / data.days.size;
                  const avgPerServiceWeek = data.services > 0 ? data.total / data.services : 0;
                  
                  return (
                    <div key={week} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{week}</h4>
                          <p className="text-sm text-muted-foreground">
                            {data.days.size} working days • {data.services} services
                          </p>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(data.total)}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Avg per day</p>
                          <p className="font-medium">{formatCurrency(avgPerDay)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg per service</p>
                          <p className="font-medium">{formatCurrency(avgPerServiceWeek)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {Object.keys(weeklyEarnings).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No weekly data available yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comparison with Last Month */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Month-over-Month Comparison</CardTitle>
          <CardDescription>
            How this month compares to last month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Total Earnings', current: currentMonthTotals.total, last: lastMonthTotals.total },
              { label: 'Commission', current: currentMonthTotals.commission, last: lastMonthTotals.commission },
              { label: 'Tips', current: currentMonthTotals.tips, last: lastMonthTotals.tips },
              { label: 'Services', current: currentMonthTotals.services, last: lastMonthTotals.services, isCount: true }
            ].map((item) => {
              const change = item.last > 0 ? ((item.current - item.last) / item.last * 100) : 0;
              const isPositive = change > 0;
              
              return (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      {item.isCount ? item.current : formatCurrency(item.current)}
                    </span>
                    <div className={`flex items-center gap-1 text-sm ${
                      isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {isPositive ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : change < 0 ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : null}
                      <span>{Math.abs(change).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}