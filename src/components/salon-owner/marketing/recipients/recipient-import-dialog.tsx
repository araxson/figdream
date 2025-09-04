'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
const importSchema = z.object({
  importType: z.enum(['csv', 'paste']),
  csvFile: z.any().optional(),
  pastedData: z.string().optional(),
  updateExisting: z.boolean(),
})
type ImportFormData = z.infer<typeof importSchema>
interface RecipientImportDialogProps {
  salonId: string
}
export function RecipientImportDialog({ salonId }: RecipientImportDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importSummary, setImportSummary] = useState<{
    total: number
    new: number
    updated: number
    errors: number
  } | null>(null)
  const form = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      importType: 'csv',
      updateExisting: true,
    }
  })
  const parseCSVData = (csvText: string): Array<Record<string, string>> => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must have headers and at least one data row')
    }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const requiredHeaders = ['email']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
    }
    const data = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      if (row.email) {
        data.push(row)
      }
    }
    return data
  }
  const handleImport = async (data: ImportFormData) => {
    setIsImporting(true)
    setImportSummary(null)
    try {
      let importData: Array<Record<string, unknown>> = []
      if (data.importType === 'paste' && data.pastedData) {
        importData = parseCSVData(data.pastedData)
      } else if (data.importType === 'csv' && data.csvFile) {
        const fileText = await data.csvFile[0].text()
        importData = parseCSVData(fileText)
      }
      if (importData.length === 0) {
        throw new Error('No valid data to import')
      }
      const supabase = createClient()
      const summary = {
        total: importData.length,
        new: 0,
        updated: 0,
        errors: 0,
      }
      // Process each row
      for (const row of importData) {
        try {
          // Check if customer exists
          const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('salon_id', salonId)
            .eq('profiles.email', row.email)
            .single()
          if (existingCustomer && data.updateExisting) {
            // Update existing customer
            const updateData: Record<string, unknown> = {}
            if (row.full_name) updateData.full_name = row.full_name
            if (row.phone) updateData.phone = row.phone
            if ('marketing_opt_in' in row) updateData.marketing_opt_in = row.marketing_opt_in === 'true'
            if ('sms_opt_in' in row) updateData.sms_opt_in = row.sms_opt_in === 'true'
            const { error } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('email', row.email)
            if (error) throw error
            summary.updated++
          } else if (!existingCustomer) {
            // Create new customer
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .insert({
                email: row.email,
                full_name: row.full_name || row.email.split('@')[0],
                phone: row.phone || null,
              })
              .select()
              .single()
            if (profileError) throw profileError
            const { error: customerError } = await supabase
              .from('customers')
              .insert({
                salon_id: salonId,
                user_id: profile.id,
                marketing_opt_in: row.marketing_opt_in === 'true',
                sms_opt_in: row.sms_opt_in === 'true',
              })
            if (customerError) throw customerError
            summary.new++
          }
        } catch (_error) {
          summary.errors++
        }
      }
      setImportSummary(summary)
      if (summary.new > 0 || summary.updated > 0) {
        toast.success(`Import completed: ${summary.new} new, ${summary.updated} updated`)
        router.refresh()
      }
    } catch (_error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import recipients')
    } finally {
      setIsImporting(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Recipients
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Customer Recipients</DialogTitle>
          <DialogDescription>
            Import customer data from CSV file or paste data directly
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleImport)} className="space-y-4">
            <FormField
              control={form.control}
              name="importType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Import Method</FormLabel>
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
                          Upload CSV File
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paste" id="paste" />
                        <label htmlFor="paste" className="flex items-center gap-2 cursor-pointer">
                          Paste Data
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('importType') === 'csv' && (
              <FormField
                control={form.control}
                name="csvFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CSV File</FormLabel>
                    <FormControl>
                      <input
                        type="file"
                        accept=".csv"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormDescription>
                      CSV must include email column. Optional: full_name, phone, marketing_opt_in, sms_opt_in
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {form.watch('importType') === 'paste' && (
              <FormField
                control={form.control}
                name="pastedData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paste CSV Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="email,full_name,phone,marketing_opt_in,sms_opt_in"
                        className="min-h-[150px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      First row must be headers. Email is required.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>CSV Format Requirements:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Required column: email</li>
                  <li>Optional columns: full_name, phone, marketing_opt_in, sms_opt_in</li>
                  <li>Use &quot;true&quot; or &quot;false&quot; for opt-in columns</li>
                  <li>Maximum 1000 rows per import</li>
                </ul>
              </AlertDescription>
            </Alert>
            {importSummary && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Import Summary:</strong>
                  <div className="flex gap-4 mt-2">
                    <Badge variant="default">Total: {importSummary.total}</Badge>
                    <Badge variant="secondary">New: {importSummary.new}</Badge>
                    <Badge variant="outline">Updated: {importSummary.updated}</Badge>
                    {importSummary.errors > 0 && (
                      <Badge variant="destructive">Errors: {importSummary.errors}</Badge>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  form.reset()
                  setImportSummary(null)
                }}
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isImporting}>
                {isImporting ? 'Importing...' : 'Import Recipients'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}