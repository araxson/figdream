'use client'

import { Badge } from '@/components/ui/badge'
import { DataTable, DataTableColumn, DataTableAction } from '@/components/shared/ui-components'
import { Mail, Phone, DollarSign, Calendar, Users, Eye, CalendarPlus, MessageSquare, Archive } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database.types'

// Use proper database types
type Customer = Database['public']['Tables']['customers']['Row'] & {
  customer_analytics?: Array<{
    total_spent: number
    visit_count: number
    last_visit: string | null
  }>
}

interface CustomerListProps {
  customers: Customer[]
}

export function CustomerList({ customers }: CustomerListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'name',
      header: 'Customer',
      accessor: (customer) => (
        <div className="font-medium">
          {customer.first_name} {customer.last_name}
        </div>
      ),
      sortable: true
    },
    {
      key: 'contact',
      header: 'Contact',
      accessor: (customer) => (
        <div className="space-y-1">
          {customer.email && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {customer.email}
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              {customer.phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'visits',
      header: 'Visits',
      accessor: (customer) => {
        const analytics = customer.customer_analytics?.[0]
        return analytics?.visit_count || 0
      },
      sortable: true,
      align: 'center'
    },
    {
      key: 'spent',
      header: 'Total Spent',
      accessor: (customer) => {
        const analytics = customer.customer_analytics?.[0]
        return (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">
              {(analytics?.total_spent || 0).toFixed(2)}
            </span>
          </div>
        )
      },
      sortable: true
    },
    {
      key: 'lastVisit',
      header: 'Last Visit',
      accessor: (customer) => {
        const analytics = customer.customer_analytics?.[0]
        return analytics?.last_visit ? (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {formatDate(analytics.last_visit)}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Never</span>
        )
      },
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (customer) => (
        <Badge 
          variant={customer.is_active ? 'default' : 'secondary'}
          className={customer.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20' : ''}
        >
          {customer.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
      align: 'center'
    }
  ]

  const actions: DataTableAction<Customer>[] = [
    {
      label: 'View Details',
      onClick: (customer) => {
        // Navigate to customer details
        window.location.href = `/salon-owner/customers/${customer.id}`
      },
      icon: Eye
    },
    {
      label: 'Book Appointment',
      onClick: (customer) => {
        window.location.href = `/salon-owner/appointments/new?customer=${customer.id}`
      },
      icon: CalendarPlus
    },
    {
      label: 'Send Message',
      onClick: (customer) => {
        // TODO: Implement message sending
        console.log('Send message to:', customer)
      },
      icon: MessageSquare,
      separator: true
    },
    {
      label: 'Archive Customer',
      onClick: (customer) => {
        // TODO: Implement archive
        console.log('Archive customer:', customer)
      },
      icon: Archive,
      variant: 'destructive',
      separator: true
    }
  ]

  const searchFunction = (customer: Customer) => {
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.toLowerCase()
    const email = (customer.email || '').toLowerCase()
    const phone = (customer.phone || '').toLowerCase()
    return `${fullName} ${email} ${phone}`
  }

  return (
    <DataTable
      data={customers}
      columns={columns}
      actions={actions}
      searchKey={searchFunction}
      searchPlaceholder="Search customers by name, email, or phone..."
      emptyIcon={Users}
      emptyTitle="No customers found"
      emptyDescription="Your customers will appear here once they book appointments"
      emptyAction={{
        label: "Invite Customers",
        onClick: () => console.log('Invite customers')
      }}
      showExport
      onExport={() => console.log('Export customers')}
      showRefresh
      onRefresh={() => window.location.reload()}
    />
  )
}