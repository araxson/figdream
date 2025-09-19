'use client'

import { useState, useTransition, useOptimistic, useCallback } from 'react'
import { toast } from 'sonner'

// UI Components
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Actions
import {
  toggleVIPStatusAction,
  getCustomerByIdAction,
  addCustomerNoteAction
} from '../actions'

// Sub-components
import { CustomerProfileHeader } from './customer-profile-header'
import { CustomerOverview } from './customer-overview'
import { CustomerPersonalInfo } from './customer-personal-info'
import { CustomerNotes } from './customer-notes'

// Types
import type { Customer } from '../dal/customer-types'

interface CustomerProfileProps {
  customer: Customer
  open: boolean
  onClose: () => void
  onUpdate?: (customer: Customer) => void
}

export function CustomerProfile({
  customer: initialCustomer,
  open,
  onClose,
  onUpdate
}: CustomerProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isPending, startTransition] = useTransition()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  // Optimistic updates for customer data
  const [optimisticCustomer, setOptimisticCustomer] = useOptimistic(
    initialCustomer,
    (state, newCustomer: Customer) => newCustomer
  )

  const customer = optimisticCustomer

  // Handle field updates
  const handleSaveField = useCallback(async (field: string, value: string) => {
    const result = await updateCustomerFieldAction(customer.id, field, value)

    if (result.success && result.data) {
      setOptimisticCustomer(result.data)
      toast.success('Field updated successfully')
      if (onUpdate) {
        onUpdate(result.data)
      }
    } else {
      toast.error(result.error || 'Failed to update field')
      throw new Error(result.error || 'Failed to update field')
    }
  }, [customer.id, setOptimisticCustomer, onUpdate])

  // Handle VIP toggle
  const handleToggleVIP = useCallback(() => {
    startTransition(async () => {
      // Optimistic update
      setOptimisticCustomer({
        ...customer,
        is_vip: !customer.is_vip
      })

      const result = await toggleVIPStatusAction(customer.id)

      if (result.success) {
        toast.success(result.message)
        if (onUpdate && result.data) {
          onUpdate(result.data)
        }
      } else {
        // Revert on error
        setOptimisticCustomer(initialCustomer)
        toast.error(result.error || 'Failed to update VIP status')
      }
    })
  }, [customer.id, customer.is_vip, initialCustomer, setOptimisticCustomer, onUpdate])

  // Handle add note
  const handleAddNote = useCallback(async (customerId: string, note: string) => {
    setIsAddingNote(true)
    const result = await addCustomerNoteAction(customerId, note)

    if (result.success && result.data) {
      setOptimisticCustomer(result.data)
      toast.success('Note added successfully')
      if (onUpdate) {
        onUpdate(result.data)
      }
    } else {
      toast.error(result.error || 'Failed to add note')
    }

    setIsAddingNote(false)
  }, [setOptimisticCustomer, onUpdate])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    const result = await getCustomerByIdAction(customer.id)

    if (result.success && result.data) {
      setOptimisticCustomer(result.data)
      toast.success('Profile refreshed')
    } else {
      toast.error('Failed to refresh profile')
    }

    setIsRefreshing(false)
  }, [customer.id, setOptimisticCustomer])

  // Calculate loyalty tier based on visits and spending
  const loyaltyTier = customer.visit_count && customer.visit_count > 20
    ? 'Gold'
    : customer.visit_count && customer.visit_count > 10
    ? 'Silver'
    : 'Bronze'

  const loyaltyProgress = Math.min(100, ((customer.visit_count || 0) / 30) * 100)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <CustomerProfileHeader
          customer={customer}
          onToggleVIP={handleToggleVIP}
          isPending={isPending}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <CustomerOverview
              customer={customer}
              loyaltyTier={loyaltyTier}
              loyaltyProgress={loyaltyProgress}
            />
          </TabsContent>

          <TabsContent value="personal" className="space-y-6 mt-6">
            <CustomerPersonalInfo
              customer={customer}
              onSave={handleSaveField}
            />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6 mt-6">
            {/* TODO: Extract to CustomerPreferences component */}
            <div className="text-center py-8 text-muted-foreground">
              <p>Preferences section - to be implemented</p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            {/* TODO: Extract to CustomerBookingHistory component */}
            <div className="text-center py-8 text-muted-foreground">
              <p>Booking history - to be implemented</p>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6 mt-6">
            <CustomerNotes
              customerId={customer.id}
              notes={customer.notes}
              onAddNote={handleAddNote}
              isAddingNote={isAddingNote}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}