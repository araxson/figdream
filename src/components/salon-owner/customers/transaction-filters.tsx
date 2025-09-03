'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Search, X } from 'lucide-react'
interface TransactionFiltersProps {
  salonId: string
  currentFilters: {
    customer?: string
    type?: string
    start?: string
    end?: string
  }
}
export default function TransactionFilters({ 
  salonId: _salonId, 
  currentFilters 
}: TransactionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [customerSearch, setCustomerSearch] = useState(currentFilters.customer || '')
  const [transactionType, setTransactionType] = useState(currentFilters.type || 'all')
  const [startDate, setStartDate] = useState<Date | undefined>(
    currentFilters.start ? new Date(currentFilters.start) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    currentFilters.end ? new Date(currentFilters.end) : undefined
  )
  const applyFilters = () => {
    const params = new URLSearchParams()
    if (customerSearch) params.set('customer', customerSearch)
    if (transactionType && transactionType !== 'all') params.set('type', transactionType)
    if (startDate) params.set('start', format(startDate, 'yyyy-MM-dd'))
    if (endDate) params.set('end', format(endDate, 'yyyy-MM-dd'))
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }
  const clearFilters = () => {
    setCustomerSearch('')
    setTransactionType('all')
    setStartDate(undefined)
    setEndDate(undefined)
    router.push(pathname)
  }
  const hasActiveFilters = customerSearch || 
    (transactionType && transactionType !== 'all') || 
    startDate || 
    endDate
  return (
    <TooltipProvider>
      <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-5">
          {/* Customer Search */}
          <div className="space-y-2">
            <Label htmlFor="customer-search">Customer</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="customer-search"
                placeholder="Name or email..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="transaction-type">Type</Label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger id="transaction-type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="earned">Earned</SelectItem>
                <SelectItem value="redeemed">Redeemed</SelectItem>
                <SelectItem value="adjusted">Adjusted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* End Date */}
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => startDate ? date < startDate : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Actions */}
          <div className="space-y-2">
            <Label className="invisible">Actions</Label>
            <div className="flex gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Apply
              </Button>
              {hasActiveFilters && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={clearFilters}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Clear all filters
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      </Card>
    </TooltipProvider>
  )
}