'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Copy,
  Mail,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  content: string | null
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  scheduled_at: string | null
  sent_at: string | null
  recipients_count: number | null
  open_rate: number | null
  click_rate: number | null
  created_at: string
  updated_at: string
  recipients?: { count: number }[]
}

interface EmailCampaignsClientProps {
  campaigns: EmailCampaign[]
  counts: {
    total: number
    draft: number
    scheduled: number
    sent: number
  }
}

export function EmailCampaignsClient({ 
  campaigns: initialCampaigns, 
  counts
}: EmailCampaignsClientProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)
  const [loading, setLoading] = useState(false)

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !searchQuery || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleDelete = async () => {
    if (!selectedCampaign) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/campaigns/email/${selectedCampaign.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete campaign')
      
      setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id))
      toast.success('Campaign deleted successfully')
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setSelectedCampaign(null)
    }
  }

  const handleSend = async (campaign: EmailCampaign) => {
    try {
      const response = await fetch(`/api/admin/campaigns/email/${campaign.id}/send`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to send campaign')
      
      setCampaigns(prev => prev.map(c => 
        c.id === campaign.id ? { ...c, status: 'sent' as const, sent_at: new Date().toISOString() } : c
      ))
      toast.success('Campaign sent successfully')
    } catch (error) {
      console.error('Error sending campaign:', error)
      toast.error('Failed to send campaign')
    }
  }

  const handleDuplicate = async (campaign: EmailCampaign) => {
    try {
      const response = await fetch('/api/admin/campaigns/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${campaign.name} (Copy)`,
          subject: campaign.subject,
          content: campaign.content,
          status: 'draft'
        })
      })
      
      if (!response.ok) throw new Error('Failed to duplicate campaign')
      
      const { campaign: newCampaign } = await response.json()
      setCampaigns(prev => [newCampaign, ...prev])
      toast.success('Campaign duplicated successfully')
    } catch (error) {
      console.error('Error duplicating campaign:', error)
      toast.error('Failed to duplicate campaign')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' },
      scheduled: { label: 'Scheduled', variant: 'default' },
      sent: { label: 'Sent', variant: 'success' },
      cancelled: { label: 'Cancelled', variant: 'destructive' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage email marketing campaigns
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/campaigns/email/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.draft}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.scheduled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.sent}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Campaigns</CardTitle>
                <CardDescription>
                  View and manage your email marketing campaigns
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Mail className="h-3 w-3" />
                {filteredCampaigns.length} campaigns
              </Badge>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled/Sent</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Mail className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No campaigns found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="font-medium">{campaign.name}</div>
                      </TableCell>
                      <TableCell>{campaign.subject}</TableCell>
                      <TableCell>
                        {campaign.recipients?.[0]?.count || campaign.recipients_count || 0}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(campaign.status)}
                      </TableCell>
                      <TableCell>
                        {campaign.sent_at 
                          ? formatDate(campaign.sent_at)
                          : campaign.scheduled_at 
                          ? formatDate(campaign.scheduled_at)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {campaign.status === 'sent' ? (
                          <div className="text-sm">
                            <div>Open: {campaign.open_rate || 0}%</div>
                            <div className="text-muted-foreground">
                              Click: {campaign.click_rate || 0}%
                            </div>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {campaign.status === 'draft' && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/campaigns/email/${campaign.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Campaign
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSend(campaign)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Now
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            {campaign.status === 'draft' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedCampaign(campaign)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCampaign?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}