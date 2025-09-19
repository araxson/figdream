'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  Download,
  FileText,
  TrendingUp,
  Calendar,
  Calculator,
  CreditCard,
  AlertCircle,
  Check,
  Clock,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { StaffEarnings, CommissionRule, CommissionTier, Bonus, Deduction, PayrollSummary } from '../types';

interface PayrollManagerProps {
  staffId?: string;
  earnings?: StaffEarnings[];
  commissionRules?: CommissionRule[];
  payrollSummary?: PayrollSummary;
  onCalculate?: (period: { start: string; end: string }) => void;
  onApprove?: (earningsId: string) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
}

export function PayrollManager({
  staffId,
  earnings = [],
  commissionRules = [],
  payrollSummary,
  onCalculate,
  onApprove,
  onExport
}: PayrollManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });
  const [customBonus, setCustomBonus] = useState({ type: '', amount: 0, description: '' });
  const [customDeduction, setCustomDeduction] = useState({ type: '', amount: 0, description: '' });

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateCommission = (revenue: number, rule: CommissionRule) => {
    if (rule.type === 'percentage') {
      return (revenue * rule.base_rate) / 100;
    }

    if (rule.type === 'fixed') {
      return rule.base_rate;
    }

    if (rule.type === 'tiered' && rule.tiers) {
      const tier = rule.tiers.find(t =>
        revenue >= t.min_revenue && (!t.max_revenue || revenue <= t.max_revenue)
      );
      return tier ? (revenue * tier.rate) / 100 : 0;
    }

    return 0;
  };

  const currentEarnings = earnings.find(e =>
    e.period_start === selectedPeriod.start && e.period_end === selectedPeriod.end
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payroll & Commissions</h2>
          <p className="text-muted-foreground">Manage earnings, commissions, and payroll processing</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={`${selectedPeriod.start}_${selectedPeriod.end}`}
            onValueChange={(value) => {
              const [start, end] = value.split('_');
              setSelectedPeriod({ start, end });
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={`${selectedPeriod.start}_${selectedPeriod.end}`}>
                Current Period
              </SelectItem>
              <SelectItem value="2024-01-01_2024-01-31">January 2024</SelectItem>
              <SelectItem value="2024-02-01_2024-02-29">February 2024</SelectItem>
            </SelectContent>
          </Select>
          {onCalculate && (
            <Button onClick={() => onCalculate(selectedPeriod)}>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Payroll
            </Button>
          )}
        </div>
      </div>

      {payrollSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Gross</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${payrollSummary.total_gross.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {payrollSummary.staff_count} staff members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Net</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${payrollSummary.total_net.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                After deductions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${payrollSummary.total_commission.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                + ${payrollSummary.total_tips.toLocaleString()} tips
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Paid</span>
                  <span className="font-medium">{payrollSummary.payment_status.paid}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Pending</span>
                  <span className="font-medium">{payrollSummary.payment_status.pending}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {currentEarnings ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Period Earnings</CardTitle>
                    <CardDescription>
                      {selectedPeriod.start} to {selectedPeriod.end}
                    </CardDescription>
                  </div>
                  {getPaymentStatusBadge(currentEarnings.payment_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Base Salary</Label>
                      <p className="text-2xl font-bold">${currentEarnings.base_salary || 0}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Commission</Label>
                      <p className="text-2xl font-bold">${currentEarnings.commission_earned}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Tips</Label>
                      <p className="text-2xl font-bold">${currentEarnings.tips_earned}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Bonuses</Label>
                      <p className="text-2xl font-bold">
                        ${currentEarnings.bonuses.reduce((sum, b) => sum + b.amount, 0)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Deductions</Label>
                      <p className="text-2xl font-bold text-red-600">
                        -${currentEarnings.deductions.reduce((sum, d) => sum + d.amount, 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-muted-foreground">Gross Earnings</Label>
                      <p className="text-xl font-semibold">${currentEarnings.gross_earnings}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Net Earnings</Label>
                      <p className="text-2xl font-bold text-green-600">${currentEarnings.net_earnings}</p>
                    </div>
                  </div>
                </div>

                {currentEarnings.payment_date && (
                  <Alert>
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription>
                      Payment scheduled for {new Date(currentEarnings.payment_date).toLocaleDateString()}
                      via {currentEarnings.payment_method || 'Direct Deposit'}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  {onApprove && currentEarnings.payment_status === 'pending' && (
                    <Button onClick={() => onApprove(currentEarnings.id)}>
                      Approve Payment
                    </Button>
                  )}
                  {onExport && (
                    <>
                      <Button variant="outline" onClick={() => onExport('pdf')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" onClick={() => onExport('csv')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No earnings calculated for this period</p>
                {onCalculate && (
                  <Button className="mt-4" onClick={() => onCalculate(selectedPeriod)}>
                    Calculate Earnings
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {currentEarnings?.bonuses && currentEarnings.bonuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentEarnings.bonuses.map((bonus, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{bonus.type}</p>
                        <p className="text-sm text-muted-foreground">{bonus.description}</p>
                      </div>
                      <span className="font-medium text-green-600">+${bonus.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Structure</CardTitle>
              <CardDescription>Current commission rules and calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {commissionRules.map((rule) => (
                <div key={rule.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Type: {rule.type === 'percentage' ? 'Percentage' : rule.type === 'fixed' ? 'Fixed' : 'Tiered'}
                      </p>
                    </div>
                    {rule.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>

                  {rule.type === 'percentage' && (
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{rule.base_rate}% commission on all services</span>
                    </div>
                  )}

                  {rule.type === 'fixed' && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">${rule.base_rate} fixed commission per service</span>
                    </div>
                  )}

                  {rule.type === 'tiered' && rule.tiers && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Commission Tiers:</p>
                      {rule.tiers.map((tier, index) => (
                        <div key={index} className="flex items-center justify-between pl-4">
                          <span className="text-sm">
                            ${tier.min_revenue} - {tier.max_revenue ? `$${tier.max_revenue}` : 'above'}
                          </span>
                          <Badge variant="secondary">{tier.rate}%</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {rule.service_overrides && Object.keys(rule.service_overrides).length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Service Overrides:</p>
                      <div className="space-y-1">
                        {Object.entries(rule.service_overrides).map(([service, rate]) => (
                          <div key={service} className="flex items-center justify-between text-sm pl-4">
                            <span>{service}</span>
                            <span className="font-medium">{rate}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Commission Calculator</CardTitle>
              <CardDescription>Calculate potential commission based on revenue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Revenue Amount</Label>
                <Input type="number" placeholder="Enter revenue amount" />
              </div>
              <div className="space-y-2">
                <Label>Commission Rule</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select commission rule" />
                  </SelectTrigger>
                  <SelectContent>
                    {commissionRules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Commission
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-4">
          {currentEarnings?.deductions && currentEarnings.deductions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Deductions</CardTitle>
                <CardDescription>Deductions for the current pay period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentEarnings.deductions.map((deduction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{deduction.type}</p>
                        <p className="text-sm text-muted-foreground">{deduction.description}</p>
                      </div>
                      <span className="font-medium text-red-600">-${deduction.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No deductions for the current pay period.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Custom Deduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={customDeduction.type}
                    onValueChange={(value) => setCustomDeduction({ ...customDeduction, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tax">Tax</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="advance">Advance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={customDeduction.amount}
                    onChange={(e) => setCustomDeduction({
                      ...customDeduction,
                      amount: parseFloat(e.target.value)
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={customDeduction.description}
                  onChange={(e) => setCustomDeduction({
                    ...customDeduction,
                    description: e.target.value
                  })}
                  placeholder="Enter description"
                />
              </div>
              <Button className="w-full">
                <Minus className="h-4 w-4 mr-2" />
                Add Deduction
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Previous payroll periods and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.map((earning) => (
                    <TableRow key={earning.id}>
                      <TableCell className="font-medium">
                        {earning.period_start} - {earning.period_end}
                      </TableCell>
                      <TableCell>${earning.gross_earnings}</TableCell>
                      <TableCell className="text-red-600">
                        -${earning.gross_earnings - earning.net_earnings}
                      </TableCell>
                      <TableCell className="font-semibold">${earning.net_earnings}</TableCell>
                      <TableCell>{getPaymentStatusBadge(earning.payment_status)}</TableCell>
                      <TableCell>
                        {earning.payment_date ?
                          new Date(earning.payment_date).toLocaleDateString() :
                          '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Earnings Trend</CardTitle>
              <CardDescription>Your earnings over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {[...Array(12)].map((_, index) => {
                  const heights = ['h-8', 'h-12', 'h-16', 'h-20', 'h-24', 'h-32', 'h-40', 'h-48', 'h-56', 'h-64'];
                  const randomHeight = heights[Math.floor(Math.random() * heights.length)];
                  return (
                    <div key={index} className={cn("flex-1 bg-primary/20 rounded-t", randomHeight)}>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}