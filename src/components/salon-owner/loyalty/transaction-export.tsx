'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { Download, FileText, Loader2 } from 'lucide-react'

interface TransactionExportProps {
  salonId: string
  filters?: {
    customerId?: string
    type?: string
    startDate?: string
    endDate?: string
  }
}

export default function TransactionExport({ 
  salonId, 
  filters 
}: TransactionExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [dateRange, setDateRange] = useState('current')
  const [includeCustomerInfo, setIncludeCustomerInfo] = useState('yes')

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const params = new URLSearchParams({
        salon_id: salonId,
        format,
        date_range: dateRange,
        include_customer: includeCustomerInfo
      })

      // Add current filters if using them
      if (dateRange === 'current' && filters) {
        if (filters.customerId) params.append('customer_id', filters.customerId)
        if (filters.type) params.append('type', filters.type)
        if (filters.startDate) params.append('start_date', filters.startDate)
        if (filters.endDate) params.append('end_date', filters.endDate)
      }

      const response = await fetch(`/api/loyalty/export?${params}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      const fileNameMatch = contentDisposition?.match(/filename="(.+)"/)
      const fileName = fileNameMatch ? fileNameMatch[1] : `loyalty-transactions.${format}`

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Export completed successfully')
      setIsOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export transactions')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Transactions</DialogTitle>
          <DialogDescription>
            Download loyalty transaction data in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>CSV (Excel compatible)</span>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>JSON (Developer friendly)</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF (Print ready)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <RadioGroup value={dateRange} onValueChange={setDateRange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current" className="font-normal cursor-pointer">
                  Use current filters
                  {filters?.startDate && filters?.endDate && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({filters.startDate} to {filters.endDate})
                    </span>
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  All transactions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last30" id="last30" />
                <Label htmlFor="last30" className="font-normal cursor-pointer">
                  Last 30 days
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="last90" id="last90" />
                <Label htmlFor="last90" className="font-normal cursor-pointer">
                  Last 90 days
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="year" id="year" />
                <Label htmlFor="year" className="font-normal cursor-pointer">
                  This year
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Include Customer Info */}
          <div className="space-y-2">
            <Label>Include Customer Information</Label>
            <RadioGroup value={includeCustomerInfo} onValueChange={setIncludeCustomerInfo}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="font-normal cursor-pointer">
                  Yes, include names and emails
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="font-normal cursor-pointer">
                  No, anonymize customer data
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}