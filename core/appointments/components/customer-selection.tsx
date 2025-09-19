'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Plus } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import type { Database } from '@/types/database.types'

type Customer = Database['public']['Tables']['profiles']['Row']
type FormValues = {
  customer_id: string
  services: string[]
  date: Date
  time: string
  staff_id: string
  payment_method: 'cash' | 'card' | 'online'
  notes?: string
}

interface CustomerSelectionProps {
  form: UseFormReturn<FormValues>
  customers: Customer[]
  onCreateCustomer?: () => void
  loading?: boolean
}

export function CustomerSelection({
  form,
  customers = [],
  onCreateCustomer,
  loading = false
}: CustomerSelectionProps) {
  const selectedCustomerId = form.watch('customer_id')
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Information
        </CardTitle>
        <CardDescription>
          Select an existing customer or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Customer</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{customer.full_name || customer.email}</span>
                          {customer.email && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {customer.email}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {onCreateCustomer && (
            <Button
              type="button"
              variant="outline"
              onClick={onCreateCustomer}
              disabled={loading}
              className="mt-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          )}
        </div>

        {selectedCustomer && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span>
                  <p>{selectedCustomer.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p>{selectedCustomer.email || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <p>{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className="capitalize">
                    {selectedCustomer.status || 'active'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedCustomerId && customers.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No customers found</p>
            {onCreateCustomer && (
              <Button
                type="button"
                variant="outline"
                onClick={onCreateCustomer}
                className="mt-2"
              >
                Create First Customer
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}