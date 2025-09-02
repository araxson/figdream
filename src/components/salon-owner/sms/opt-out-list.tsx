'use client'

import { useState } from 'react'
import {
  Button,
  Badge,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui'
import { format } from 'date-fns'
import { Search, UserCheck, Download } from 'lucide-react'
import { Database } from '@/types/database.types'
import { removeOptOut } from '@/lib/data-access/sms'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type SmsOptOut = Database['public']['Tables']['sms_opt_outs']['Row'] & {
  customers?: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
  } | null
}

interface OptOutListProps {
  optOuts: SmsOptOut[]
}

export function OptOutList({ optOuts }: OptOutListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOptOut, setSelectedOptOut] = useState<SmsOptOut | null>(null)
  const [showResubscribeDialog, setShowResubscribeDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter opt-outs based on search
  const filteredOptOuts = optOuts.filter(optOut => {
    const search = searchTerm.toLowerCase()
    return (
      optOut.phone.toLowerCase().includes(search) ||
      optOut.customers?.first_name?.toLowerCase().includes(search) ||
      optOut.customers?.last_name?.toLowerCase().includes(search) ||
      optOut.customers?.email?.toLowerCase().includes(search) ||
      optOut.reason?.toLowerCase().includes(search)
    )
  })

  const handleResubscribe = async () => {
    if (!selectedOptOut) return

    setIsProcessing(true)
    try {
      await removeOptOut(selectedOptOut.id)
      toast.success('Phone number re-subscribed successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to re-subscribe phone number')
      console.error(error)
    } finally {
      setIsProcessing(false)
      setShowResubscribeDialog(false)
      setSelectedOptOut(null)
    }
  }

  const exportToCSV = () => {
    const headers = ['Phone', 'Name', 'Email', 'Reason', 'Date']
    const rows = filteredOptOuts.map(optOut => [
      optOut.phone,
      optOut.customers ? `${optOut.customers.first_name || ''} ${optOut.customers.last_name || ''}`.trim() : '',
      optOut.customers?.email || '',
      optOut.reason || '',
      format(new Date(optOut.opted_out_at), 'yyyy-MM-dd HH:mm')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sms-opt-outs-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Opt-out list exported successfully')
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search and Export */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by phone, name, email, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredOptOuts.length} of {optOuts.length} opt-outs
        </p>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Opted Out</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOptOuts.length > 0 ? (
                filteredOptOuts.map((optOut) => (
                  <TableRow key={optOut.id}>
                    <TableCell className="font-mono">{optOut.phone}</TableCell>
                    <TableCell>
                      {optOut.customers ? (
                        <div>
                          <p className="font-medium">
                            {optOut.customers.first_name} {optOut.customers.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {optOut.customers.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {optOut.reason ? (
                        <Badge variant="outline">{optOut.reason}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(optOut.opted_out_at), 'MMM d, yyyy')}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(optOut.opted_out_at), 'h:mm a')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOptOut(optOut)
                          setShowResubscribeDialog(true)
                        }}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Re-subscribe
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {searchTerm ? 'No opt-outs found matching your search' : 'No SMS opt-outs found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Re-subscribe Confirmation Dialog */}
      <AlertDialog open={showResubscribeDialog} onOpenChange={setShowResubscribeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Re-subscribe Phone Number</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to re-subscribe {selectedOptOut?.phone}? 
              This will allow SMS messages to be sent to this number again.
              <br /><br />
              <strong>Important:</strong> Only re-subscribe if you have explicit consent from the phone owner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResubscribe} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Re-subscribe'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}