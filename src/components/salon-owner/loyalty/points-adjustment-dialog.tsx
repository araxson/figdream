'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Search, Plus, Minus, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database.types'

// Use database type for customer
type Customer = Database['public']['Tables']['customers']['Row']

interface PointsAdjustmentDialogProps {
  salonId: string
  customerId?: string
  children?: React.ReactNode
  onSuccess?: () => void
}

export default function PointsAdjustmentDialog({ 
  salonId,
  customerId: initialCustomerId,
  children,
  onSuccess 
}: PointsAdjustmentDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  
  // Form fields
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add')
  const [points, setPoints] = useState('')
  const [description, setDescription] = useState('')

  // Search for customers
  useEffect(() => {
    if (searchQuery.length < 2) {
      setCustomers([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(
          `/api/loyalty/customers/search?salon_id=${salonId}&q=${encodeURIComponent(searchQuery)}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setCustomers(data.customers || [])
        }
      } catch (error) {
        console.error('Error searching customers:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, salonId])

  // Load initial customer if provided
  useEffect(() => {
    if (initialCustomerId && isOpen) {
      loadCustomer(initialCustomerId)
    }
  }, [initialCustomerId, isOpen])

  const loadCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedCustomer(data.customer)
      }
    } catch (error) {
      console.error('Error loading customer:', error)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer')
      return
    }

    if (!points || parseInt(points) === 0) {
      toast.error('Please enter a valid points amount')
      return
    }

    if (!description.trim()) {
      toast.error('Please provide a description')
      return
    }

    const pointsValue = parseInt(points) * (adjustmentType === 'subtract' ? -1 : 1)

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/loyalty/adjust-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salon_id: salonId,
          customer_id: selectedCustomer.id,
          points: pointsValue,
          description: description.trim(),
          type: pointsValue > 0 ? 'earned' : 'adjusted'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to adjust points')
      }

      const result = await response.json()
      
      toast.success(
        `Points ${adjustmentType === 'add' ? 'added' : 'removed'} successfully. New balance: ${result.newBalance} points`
      )
      
      setIsOpen(false)
      resetForm()
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error adjusting points:', error)
      toast.error('Failed to adjust points. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedCustomer(null)
    setAdjustmentType('add')
    setPoints('')
    setDescription('')
    setSearchQuery('')
    setCustomers([])
  }

  const getNewBalance = () => {
    if (!selectedCustomer || !points) return selectedCustomer?.points_balance || 0
    const adjustment = parseInt(points) * (adjustmentType === 'subtract' ? -1 : 1)
    return Math.max(0, (selectedCustomer.points_balance || 0) + adjustment)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adjust Points
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust Loyalty Points</DialogTitle>
          <DialogDescription>
            Add or remove points from a customer's balance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer Selection */}
          {!initialCustomerId && (
            <div className="space-y-2">
              <Label>Select Customer</Label>
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={searchOpen}
                    className="w-full justify-between"
                  >
                    {selectedCustomer ? (
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {selectedCustomer.first_name} {selectedCustomer.last_name}
                        </span>
                        <Badge variant="secondary">
                          {selectedCustomer.points_balance || 0} pts
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Search for a customer...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search by name, email, or phone..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>
                      {isSearching ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : searchQuery.length < 2 ? (
                        'Type at least 2 characters to search'
                      ) : (
                        'No customers found'
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {customers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          onSelect={() => {
                            setSelectedCustomer(customer)
                            setSearchOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {customer.first_name} {customer.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {customer.email}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {customer.points_balance || 0} pts
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Current Balance Display */}
          {selectedCustomer && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">{selectedCustomer.points_balance || 0} points</p>
            </div>
          )}

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <RadioGroup value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as 'add' | 'subtract')}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add" />
                  <Label htmlFor="add" className="flex items-center cursor-pointer">
                    <Plus className="h-4 w-4 mr-1 text-green-600" />
                    Add Points
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subtract" id="subtract" />
                  <Label htmlFor="subtract" className="flex items-center cursor-pointer">
                    <Minus className="h-4 w-4 mr-1 text-red-600" />
                    Remove Points
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Points Amount */}
          <div className="space-y-2">
            <Label htmlFor="points">Points Amount</Label>
            <Input
              id="points"
              type="number"
              placeholder="Enter points amount"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
            />
          </div>

          {/* New Balance Preview */}
          {selectedCustomer && points && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">New Balance After Adjustment</p>
              <p className="text-2xl font-bold">
                {getNewBalance()} points
                <span className={cn(
                  "text-sm ml-2",
                  adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'
                )}>
                  ({adjustmentType === 'add' ? '+' : '-'}{points})
                </span>
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description / Reason
            </Label>
            <Textarea
              id="description"
              placeholder="Enter reason for adjustment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false)
              resetForm()
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCustomer || !points || !description.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `${adjustmentType === 'add' ? 'Add' : 'Remove'} Points`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}