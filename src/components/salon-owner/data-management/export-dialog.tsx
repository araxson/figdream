'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Label,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Alert,
  AlertDescription
} from '@/components/ui'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CalendarIcon, Download, Loader2, Info, Shield } from 'lucide-react'
interface ExportDialogProps {
  salonId: string
  exportType: string
  title: string
  availableFormats: string[]
  isBulkExport?: boolean
  children?: React.ReactNode
}
export default function ExportDialog({
  salonId,
  exportType,
  title,
  availableFormats,
  isBulkExport = false,
  children
}: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [format, setFormat] = useState(availableFormats[0].toLowerCase())
  const [dateRange, setDateRange] = useState('all')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [includePersonalInfo, setIncludePersonalInfo] = useState(true)
  const [includeFinancialInfo, setIncludeFinancialInfo] = useState(true)
  const [anonymizeData, setAnonymizeData] = useState(false)
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({
        salon_id: salonId,
        export_type: exportType,
        format: format,
        date_range: dateRange,
        include_personal: includePersonalInfo.toString(),
        include_financial: includeFinancialInfo.toString(),
        anonymize: anonymizeData.toString()
      })
      if (dateRange === 'custom' && startDate && endDate) {
        params.append('start_date', format(startDate, 'yyyy-MM-dd'))
        params.append('end_date', format(endDate, 'yyyy-MM-dd'))
      }
      const response = await fetch(`/api/export?${params}`, {
        method: 'GET',
      })
      if (!response.ok) {
        throw new Error('Export failed')
      }
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      const fileNameMatch = contentDisposition?.match(/filename="(.+)"/)
      const fileName = fileNameMatch ? fileNameMatch[1] : `${exportType}-export.${format}`
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
      toast.success(`${title} exported successfully`)
      setIsOpen(false)
    } catch (_error) {
      toast.error('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export {title}</DialogTitle>
          <DialogDescription>
            Configure your export settings and download the data
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat}>
              {availableFormats.map((fmt) => (
                <div key={fmt} className="flex items-center space-x-2">
                  <RadioGroupItem value={fmt.toLowerCase()} id={fmt} />
                  <Label htmlFor={fmt} className="font-normal cursor-pointer">
                    {fmt}
                    {fmt === 'CSV' && ' (Excel compatible)'}
                    {fmt === 'JSON' && ' (Developer friendly)'}
                    {fmt === 'PDF' && ' (Print ready)'}
                    {fmt === 'ZIP' && ' (Compressed archive)'}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          {/* Date Range (not for bulk export) */}
          {!isBulkExport && (
            <div className="space-y-2">
              <Label>Date Range</Label>
              <RadioGroup value={dateRange} onValueChange={setDateRange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All time
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="year" id="year" />
                  <Label htmlFor="year" className="font-normal cursor-pointer">
                    This year
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="month" />
                  <Label htmlFor="month" className="font-normal cursor-pointer">
                    This month
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="font-normal cursor-pointer">
                    Custom range
                  </Label>
                </div>
              </RadioGroup>
              {dateRange === 'custom' && (
                <div className="grid gap-2 mt-2">
                  <div className="grid gap-2 md:grid-cols-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Start date"}
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "End date"}
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
                </div>
              )}
            </div>
          )}
          {/* Privacy Options */}
          <div className="space-y-3">
            <Label>Privacy Options</Label>
            {(exportType === 'customers' || exportType === 'all') && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="personal"
                  checked={includePersonalInfo}
                  onCheckedChange={(checked) => setIncludePersonalInfo(checked as boolean)}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="personal" className="font-normal cursor-pointer">
                    Include personal information
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Names, emails, phone numbers, addresses
                  </p>
                </div>
              </div>
            )}
            {(exportType === 'transactions' || exportType === 'appointments' || exportType === 'all') && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="financial"
                  checked={includeFinancialInfo}
                  onCheckedChange={(checked) => setIncludeFinancialInfo(checked as boolean)}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="financial" className="font-normal cursor-pointer">
                    Include financial information
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Prices, payments, tips, commissions
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="anonymize"
                checked={anonymizeData}
                onCheckedChange={(checked) => setAnonymizeData(checked as boolean)}
              />
              <div className="space-y-0.5">
                <Label htmlFor="anonymize" className="font-normal cursor-pointer">
                  Anonymize sensitive data
                </Label>
                <p className="text-xs text-muted-foreground">
                  Replace names and identifiers with random values
                </p>
              </div>
            </div>
          </div>
          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Exported data may contain sensitive information. Please handle with care and ensure secure storage.
            </AlertDescription>
          </Alert>
          {/* Info for Bulk Export */}
          {isBulkExport && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Bulk export will create a compressed archive containing all your salon data. This may take several minutes to complete.
              </AlertDescription>
            </Alert>
          )}
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
            disabled={isExporting || (dateRange === 'custom' && (!startDate || !endDate))}
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