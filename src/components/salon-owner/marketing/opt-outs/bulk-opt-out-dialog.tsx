'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { bulkOptOut } from '@/lib/data-access/sms-opt-outs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
const formSchema = z.object({
  phones: z.string().min(10, 'Please enter at least one phone number'),
  reason: z.string().min(1, 'Please provide a reason for opt-out'),
})
interface BulkOptOutDialogProps {
  salonId: string
}
export function BulkOptOutDialog({ salonId }: BulkOptOutDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phones: '',
      reason: '',
    },
  })
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      // Parse CSV or text file
      const lines = text.split('\n')
      const phones: string[] = []
      lines.forEach(line => {
        // Extract phone numbers (basic pattern matching)
        const phone = line.trim().replace(/[^\d+]/g, '')
        if (phone.length >= 10) {
          phones.push(phone)
        }
      })
      if (phones.length > 0) {
        form.setValue('phones', phones.join('\n'))
        toast.success(`Loaded ${phones.length} phone numbers from file`)
      } else {
        toast.error('No valid phone numbers found in file')
      }
    }
    reader.readAsText(file)
  }
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      // Parse phone numbers from textarea
      const phones = values.phones
        .split(/[\n,;]/)
        .map(phone => phone.trim().replace(/[^\d+]/g, ''))
        .filter(phone => phone.length >= 10)
      if (phones.length === 0) {
        throw new Error('No valid phone numbers provided')
      }
      const result = await bulkOptOut(phones, values.reason, salonId)
      toast.success(result.message)
      setOpen(false)
      form.reset()
      setFileName(null)
      router.refresh()
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk opt-out phone numbers'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Opt-Out
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Bulk SMS Opt-Out</DialogTitle>
          <DialogDescription>
            Add multiple phone numbers to the opt-out list at once
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload File (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                {fileName && (
                  <span className="text-sm text-muted-foreground">
                    {fileName}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a CSV or text file with phone numbers
              </p>
            </div>
            <FormField
              control={form.control}
              name="phones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Numbers</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter phone numbers, one per line or separated by commas:
+1 555-123-4567
5551234568
555-123-4569"
                      className="min-h-[150px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter or paste phone numbers to opt out
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Bulk request, Data cleanup, Compliance requirement..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a reason for this bulk opt-out
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Process Bulk Opt-Out'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}