'use client'

import * as React from 'react'
import { formatDistance } from 'date-fns'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Send, 
  Eye, 
  Copy,
  Calendar,
  Users,
  Mail,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  BarChart3
} from 'lucide-react'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
  Progress
} from '@/components/ui'
import { cn } from '@/lib/utils'

import type { Database } from '@/types/database.types'

type Campaign = Database['public']['Tables']['marketing_campaigns']['Row']
type CampaignMetrics = {
  campaign_id: string
  sent_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  bounced_count: number
  unsubscribed_count: number
  complained_count: number
  open_rate: number
  click_rate: number
  bounce_rate: number
  revenue_generated: number
  conversions: number
}

export interface CampaignListProps {
  campaigns: Campaign[]
  metrics?: Record<string, CampaignMetrics>
  onCampaignEdit?: (campaign: Campaign) => void
  onCampaignDelete?: (campaignId: string) => void
  onCampaignSend?: (campaignId: string) => void
  onCampaignPause?: (campaignId: string) => void
  onCampaignResume?: (campaignId: string) => void
  onCampaignDuplicate?: (campaign: Campaign) => void
  onCampaignView?: (campaign: Campaign) => void
  onCreateNew?: () => void
  className?: string
  isLoading?: boolean
}

const campaignStatusColors = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
}

const campaignTypeIcons = {
  email: Mail,
  sms: MessageSquare,
  push: Users,
  in_app: Users,
}

export function CampaignList({
  campaigns,
  metrics = {},
  onCampaignEdit,
  onCampaignDelete,
  onCampaignSend,
  onCampaignPause,
  onCampaignResume,
  onCampaignDuplicate,
  onCampaignView,
  onCreateNew,
  className,
  isLoading = false,
}: CampaignListProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<'created_at' | 'name' | 'status' | 'type'>('created_at')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
  const [deleteDialog, setDeleteDialog] = React.useState<{ isOpen: boolean; campaign: Campaign | null }>({
    isOpen: false,
    campaign: null,
  })
  const [sendDialog, setSendDialog] = React.useState<{ isOpen: boolean; campaign: Campaign | null }>({
    isOpen: false,
    campaign: null,
  })

  // Filter and sort campaigns
  const filteredCampaigns = React.useMemo(() => {
    const filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
      const matchesType = typeFilter === 'all' || campaign.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })

    // Sort campaigns
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [campaigns, searchQuery, statusFilter, typeFilter, sortBy, sortOrder])

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handleDelete = async () => {
    if (deleteDialog.campaign) {
      try {
        await onCampaignDelete?.(deleteDialog.campaign.id)
        setDeleteDialog({ isOpen: false, campaign: null })
      } catch (error) {
        console.error('Error deleting campaign:', error)
      }
    }
  }

  const handleSend = async () => {
    if (sendDialog.campaign) {
      try {
        await onCampaignSend?.(sendDialog.campaign.id)
        setSendDialog({ isOpen: false, campaign: null })
      } catch (error) {
        console.error('Error sending campaign:', error)
      }
    }
  }

  const renderMetrics = (campaign: Campaign) => {
    const campaignMetrics = metrics[campaign.id]
    if (!campaignMetrics || campaign.status === 'draft') {
      return (
        <div className="text-sm text-muted-foreground">
          No metrics available
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="font-medium text-foreground">
              {campaignMetrics.sent_count.toLocaleString()}
            </div>
            <div className="text-muted-foreground">Sent</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-foreground">
              {campaignMetrics.open_rate.toFixed(1)}%
            </div>
            <div className="text-muted-foreground">Open Rate</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-foreground">
              {campaignMetrics.click_rate.toFixed(1)}%
            </div>
            <div className="text-muted-foreground">Click Rate</div>
          </div>
        </div>
        {campaignMetrics.sent_count > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Delivery Progress</span>
              <span>{Math.round((campaignMetrics.delivered_count / campaignMetrics.sent_count) * 100)}%</span>
            </div>
            <Progress 
              value={(campaignMetrics.delivered_count / campaignMetrics.sent_count) * 100} 
              className="h-1"
            />
          </div>
        )}
      </div>
    )
  }

  const renderActionMenu = (campaign: Campaign) => {
    const canEdit = campaign.status === 'draft' || campaign.status === 'scheduled'
    const canSend = campaign.status === 'draft'
    const canPause = campaign.status === 'active'
    const canResume = campaign.status === 'paused'
    const canDelete = campaign.status === 'draft'

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCampaignView?.(campaign)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {canEdit && (
            <DropdownMenuItem onClick={() => onCampaignEdit?.(campaign)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Campaign
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onCampaignDuplicate?.(campaign)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {canSend && (
            <DropdownMenuItem 
              onClick={() => setSendDialog({ isOpen: true, campaign })}
              className="text-green-600"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Campaign
            </DropdownMenuItem>
          )}
          {canPause && (
            <DropdownMenuItem 
              onClick={() => onCampaignPause?.(campaign.id)}
              className="text-yellow-600"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause Campaign
            </DropdownMenuItem>
          )}
          {canResume && (
            <DropdownMenuItem 
              onClick={() => onCampaignResume?.(campaign.id)}
              className="text-green-600"
            >
              <Play className="mr-2 h-4 w-4" />
              Resume Campaign
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteDialog({ isOpen: true, campaign })}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="space-y-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Marketing Campaigns</h2>
          <p className="text-muted-foreground">
            Manage your email and SMS marketing campaigns
          </p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="in_app">In-App</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-') as [typeof sortBy, typeof sortOrder]
              setSortBy(field)
              setSortOrder(order)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="status-asc">Status A-Z</SelectItem>
                <SelectItem value="status-desc">Status Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Campaigns ({filteredCampaigns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? "No campaigns match your current filters."
                  : "You haven't created any campaigns yet."
                }
              </p>
              {onCreateNew && !searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={onCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Campaign
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    Campaign Name
                    {sortBy === 'name' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('type')}
                  >
                    Type
                    {sortBy === 'type' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortBy === 'status' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('created_at')}
                  >
                    Created
                    {sortBy === 'created_at' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => {
                  const TypeIcon = campaignTypeIcons[campaign.type] || Users
                  
                  return (
                    <TableRow key={campaign.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          {campaign.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {campaign.description.length > 60 
                                ? `${campaign.description.substring(0, 60)}...`
                                : campaign.description
                              }
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{campaign.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={campaignStatusColors[campaign.status]}
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                        {campaign.scheduled_at && campaign.status === 'scheduled' && (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Scheduled for {new Date(campaign.scheduled_at).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {renderMetrics(campaign)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDistance(new Date(campaign.created_at), new Date(), { addSuffix: true })}
                        </div>
                        {campaign.sent_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Sent {formatDistance(new Date(campaign.sent_at), new Date(), { addSuffix: true })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {renderActionMenu(campaign)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog({ isOpen, campaign: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the campaign "{deleteDialog.campaign?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ isOpen: false, campaign: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <Dialog open={sendDialog.isOpen} onOpenChange={(isOpen) => setSendDialog({ isOpen, campaign: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to send the campaign "{sendDialog.campaign?.name}"? 
              Once sent, the campaign cannot be modified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSendDialog({ isOpen: false, campaign: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSend}>
              <Send className="mr-2 h-4 w-4" />
              Send Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}