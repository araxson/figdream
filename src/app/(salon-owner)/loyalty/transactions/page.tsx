import { createServerClient } from '@/lib/database/supabase/server'
import { getLoyaltyTransactions } from '@/lib/data-access/loyalty-admin'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import TransactionFilters from './transaction-filters'
import TransactionExport from './transaction-export'

export default async function LoyaltyTransactionsPage({
  searchParams
}: {
  searchParams: { 
    customer?: string
    type?: string
    start?: string
    end?: string
    page?: string
  }
}) {
  const supabase = await createServerClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's salon
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.salon_id) {
    redirect('/401')
  }

  // Pagination
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  // Get transactions with filters
  const { transactions, total } = await getLoyaltyTransactions(userRole.salon_id, {
    customerId: searchParams.customer,
    type: searchParams.type,
    startDate: searchParams.start,
    endDate: searchParams.end,
    limit,
    offset
  })

  const totalPages = Math.ceil(total / limit)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'redeemed':
        return <TrendingDown className="h-4 w-4 text-blue-600" />
      case 'adjusted':
        return <RefreshCw className="h-4 w-4 text-orange-600" />
      case 'expired':
        return <Clock className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case 'earned':
        return 'default' as const
      case 'redeemed':
        return 'secondary' as const
      case 'adjusted':
        return 'outline' as const
      case 'expired':
        return 'destructive' as const
      default:
        return 'default' as const
    }
  }

  // Calculate summary stats
  const stats = {
    totalEarned: transactions
      .filter(t => t.transaction_type === 'earned')
      .reduce((sum, t) => sum + t.points, 0),
    totalRedeemed: transactions
      .filter(t => t.transaction_type === 'redeemed')
      .reduce((sum, t) => sum + Math.abs(t.points), 0),
    totalAdjusted: transactions
      .filter(t => t.transaction_type === 'adjusted')
      .reduce((sum, t) => sum + t.points, 0),
    totalExpired: transactions
      .filter(t => t.transaction_type === 'expired')
      .reduce((sum, t) => sum + Math.abs(t.points), 0)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/salon-admin/loyalty">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Loyalty Transactions</h1>
            <p className="text-muted-foreground mt-1">
              View and export loyalty points transaction history
            </p>
          </div>
        </div>
        <TransactionExport 
          salonId={userRole.salon_id}
          filters={{
            customerId: searchParams.customer,
            type: searchParams.type,
            startDate: searchParams.start,
            endDate: searchParams.end
          }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Points Earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{stats.totalEarned.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Points Redeemed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalRedeemed.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Points Adjusted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalAdjusted > 0 ? '+' : ''}{stats.totalAdjusted.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Points Expired</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.totalExpired.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <TransactionFilters 
        salonId={userRole.salon_id}
        currentFilters={{
          customer: searchParams.customer,
          type: searchParams.type,
          start: searchParams.start,
          end: searchParams.end
        }}
      />

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {total} total transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Balance After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.customers ? (
                          <div>
                            <p className="font-medium">
                              {transaction.customers.first_name} {transaction.customers.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.customers.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTransactionBadgeVariant(transaction.transaction_type)} className="gap-1">
                          {getTransactionIcon(transaction.transaction_type)}
                          <span className="capitalize">{transaction.transaction_type}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{transaction.description}</p>
                        {transaction.reference_type && (
                          <p className="text-xs text-muted-foreground">
                            Ref: {transaction.reference_type}
                            {transaction.reference_id && ` #${transaction.reference_id.slice(0, 8)}`}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={
                          transaction.points > 0 
                            ? 'text-green-600 font-semibold' 
                            : 'text-red-600 font-semibold'
                        }>
                          {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.balance_after.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  asChild
                >
                  <Link 
                    href={{
                      pathname: '/salon-admin/loyalty/transactions',
                      query: {
                        ...searchParams,
                        page: page - 1
                      }
                    }}
                  >
                    Previous
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  asChild
                >
                  <Link 
                    href={{
                      pathname: '/salon-admin/loyalty/transactions',
                      query: {
                        ...searchParams,
                        page: page + 1
                      }
                    }}
                  >
                    Next
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}