'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Download, FileText } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
import { DateRange } from 'react-day-picker'
const exportSchema = z.object({
  export_type: z.enum(['customers', 'appointments', 'transactions', 'services', 'staff', 'analytics', 'full_backup']),
  export_format: z.enum(['csv', 'json', 'excel']),
  date_range: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  include_archived: z.boolean(),
  include_personal_data: z.boolean(),
  filters: z.object({
    status: z.string().optional(),
    location_id: z.string().optional(),
  }).optional(),
})
type ExportFormData = z.infer<typeof exportSchema>
interface ExportRequestDialogProps {
  salonId: string
}
export function ExportRequestDialog({ salonId }: ExportRequestDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      export_type: 'customers',
      export_format: 'csv',
      include_archived: false,
      include_personal_data: true,
    }
  })
  const handleSubmit = async (data: ExportFormData) => {
    setIsExporting(true)
    try {
      const supabase = createClient()
      // Create export request
      const exportRequest = {
        salon_id: salonId,
        export_type: data.export_type,
        export_format: data.export_format,
        status: 'processing',
        parameters: {
          date_range: dateRange ? {
            from: dateRange.from?.toISOString(),
            to: dateRange.to?.toISOString(),
          } : null,
          include_archived: data.include_archived,
          include_personal_data: data.include_personal_data,
          filters: data.filters,
        },
        requested_by: (await supabase.auth.getUser()).data.user?.id,
      }
      const { data: exportData, error } = await supabase
        .from('data_exports')
        .insert(exportRequest)
        .select()
        .single()
      if (error) throw error
      // Simulate export processing (in real app, this would be handled by a background job)
      setTimeout(async () => {
        // Fetch the actual data based on export type
        let recordCount = 0
        let exportContent = ''
        switch (data.export_type) {
          case 'customers':
            const { data: customers } = await supabase
              .from('customers')
              .select(`
                *,
                profiles(
                  full_name,
                  email,
                  phone
                )
              `)
              .eq('salon_id', salonId)
            recordCount = customers?.length || 0
            if (data.export_format === 'csv') {
              exportContent = 'id,name,email,phone,created_at\n'
              customers?.forEach(c => {
                exportContent += `${c.id},"${c.profiles?.full_name}","${c.profiles?.email}","${c.profiles?.phone}","${c.created_at}"\n`
              })
            } else {
              exportContent = JSON.stringify(customers, null, 2)
            }
            break
          case 'appointments':
            const { data: appointments } = await supabase
              .from('appointments')
              .select('*')
              .eq('salon_id', salonId)
            recordCount = appointments?.length || 0
            if (data.export_format === 'csv') {
              exportContent = 'id,customer_id,date,status,total_amount\n'
              appointments?.forEach(a => {
                exportContent += `${a.id},${a.customer_id},"${a.appointment_date}","${a.status}",${a.total_amount}\n`
              })
            } else {
              exportContent = JSON.stringify(appointments, null, 2)
            }
            break
          // Add more export types as needed
        }
        // Update export status
        const { error: updateError } = await supabase
          .from('data_exports')
          .update({
            status: 'completed',
            record_count: recordCount,
            file_size: new Blob([exportContent]).size,
            completed_at: new Date().toISOString(),
          })
          .eq('id', exportData.id)
        if (!updateError) {
          toast.success(`Export completed: ${recordCount} records exported`)
          router.refresh()
        }
      }, 3000)
      toast.success('Export started. You will be notified when it completes.')
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (_error) {
      toast.error('Failed to create export')
    } finally {
      setIsExporting(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          New Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Select the data you want to export and configure options
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="export_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data to export" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="appointments">Appointments</SelectItem>
                      <SelectItem value="transactions">Transactions</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="full_backup">Full Backup</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="export_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export Format</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="csv" id="csv" />
                        <label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                          <FileText className="h-4 w-4" />
                          CSV
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="json" id="json" />
                        <label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                          JSON
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="excel" id="excel" />
                        <label htmlFor="excel" className="flex items-center gap-2 cursor-pointer">
                          Excel
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Date Range (Optional)</FormLabel>
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <FormDescription>
                Leave empty to export all data
              </FormDescription>
            </div>
            <FormField
              control={form.control}
              name="include_archived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Include Archived Records
                    </FormLabel>
                    <FormDescription>
                      Export data that has been archived or marked as inactive
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="include_personal_data"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Include Personal Information
                    </FormLabel>
                    <FormDescription>
                      Export sensitive data like emails, phone numbers, and addresses
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  form.reset()
                }}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isExporting}>
                {isExporting ? 'Processing...' : 'Start Export'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}