'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  MessageSquare,
  Send,
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  Clock,
  Copy,
  Play,
  Pause,
  Building,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Salon {
  id: string
  name: string
  slug: string
}

interface Campaign {
  id: string
  salon_id: string
  name: string
  type: 'email' | 'sms'
  status: string
  created_at: string
  updated_at: string
  salon?: Salon
  recipientCount?: number
  engagement?: number
  // Email specific
  subject?: string
  content?: string
  template_id?: string
  scheduled_at?: string | null
  sent_at?: string | null
  recipients_count?: number
  opens_count?: number
  clicks_count?: number
  // SMS specific
  message_template?: string
  campaign_type?: string
  target_segments?: any
  target_count?: number
  started_at?: string | null
  completed_at?: string | null
  sent_count?: number
  delivered_count?: number
  clicked_count?: number
  revenue_generated?: number
}

interface CampaignsClientProps {
  campaigns: Campaign[]
  salons: Salon[]
  counts: {
    totalEmail: number
    totalSms: number
    active: number
    totalReach: number
  }
  currentSalonId?: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  sending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

export function CampaignsClient({ 
  campaigns: initialCampaigns, 
  salons,
  counts,
  currentSalonId
}: CampaignsClientProps) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSalon, setSelectedSalon] = useState(currentSalonId || '')
  const [selectedType, setSelectedType] = useState<'all' | 'email' | 'sms'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)
  const [campaignType, setCampaignType] = useState<'email' | 'sms'>('email')
  const [formData, setFormData] = useState({
    salon_id: currentSalonId || '',
    name: '',
    // Email fields
    subject: '',
    content: '',
    // SMS fields
    message_template: '',
    campaign_type: 'promotional',
    // Common fields
    scheduled_at: ''
  })

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !searchQuery || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.message_template?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSalon = !selectedSalon || campaign.salon_id === selectedSalon
    const matchesType = selectedType === 'all' || campaign.type === selectedType
    
    return matchesSearch && matchesSalon && matchesType
  })

  const handleSubmit = async () => {
    if (!formData.salon_id) {
      toast.error('Please select a salon')
      return
    }

    setLoading(true)
    try {
      const endpoint = campaignType === 'email' 
        ? '/api/admin/campaigns/email'
        : '/api/admin/campaigns/sms'
      
      const url = selectedCampaign 
        ? `${endpoint}/${selectedCampaign.id}`
        : endpoint
      
      const payload = campaignType === 'email' 
        ? {
            salon_id: formData.salon_id,
            name: formData.name,
            subject: formData.subject,
            content: formData.content,
            scheduled_at: formData.scheduled_at || null,
            status: formData.scheduled_at ? 'scheduled' : 'draft'
          }
        : {
            salon_id: formData.salon_id,
            name: formData.name,
            message_template: formData.message_template,
            campaign_type: formData.campaign_type,
            scheduled_at: formData.scheduled_at || null,
            status: formData.scheduled_at ? 'scheduled' : 'draft'
          }
      
      const response = await fetch(url, {
        method: selectedCampaign ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save campaign')
      }
      
      const { campaign } = await response.json()
      
      if (selectedCampaign) {
        setCampaigns(prev => prev.map(c => c.id === campaign.id ? 
          { ...campaign, type: campaignType } : c
        ))
        toast.success('Campaign updated successfully')
      } else {
        setCampaigns(prev => [{ ...campaign, type: campaignType }, ...prev])
        toast.success('Campaign created successfully')
      }
      
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving campaign:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setCampaignType(campaign.type)
    setFormData({
      salon_id: campaign.salon_id,
      name: campaign.name,
      subject: campaign.subject || '',
      content: campaign.content || '',
      message_template: campaign.message_template || '',
      campaign_type: campaign.campaign_type || 'promotional',
      scheduled_at: campaign.scheduled_at || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedCampaign) return
    
    setLoading(true)
    try {
      const endpoint = selectedCampaign.type === 'email' 
        ? '/api/admin/campaigns/email'
        : '/api/admin/campaigns/sms'
      
      const response = await fetch(`${endpoint}/${selectedCampaign.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete campaign')
      }
      
      setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id))
      toast.success('Campaign deleted successfully')
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete campaign')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setSelectedCampaign(null)
    }
  }

  const handleSendCampaign = async (campaign: Campaign) => {
    setLoading(true)
    try {
      const endpoint = campaign.type === 'email' 
        ? `/api/admin/campaigns/email/${campaign.id}/send`
        : `/api/admin/campaigns/sms/${campaign.id}/send`
      
      const response = await fetch(endpoint, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to send campaign')
      
      const updated = await response.json()
      
      setCampaigns(prev => prev.map(c => 
        c.id === campaign.id ? { ...c, status: 'sending' } : c
      ))
      
      toast.success('Campaign is being sent')
    } catch (error) {
      console.error('Error sending campaign:', error)
      toast.error('Failed to send campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    setLoading(true)
    try {
      const endpoint = campaign.type === 'email' 
        ? `/api/admin/campaigns/email/${campaign.id}/duplicate`
        : `/api/admin/campaigns/sms/${campaign.id}/duplicate`
      
      const response = await fetch(endpoint, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to duplicate campaign')
      
      const { campaign: duplicated } = await response.json()
      
      setCampaigns(prev => [{ ...duplicated, type: campaign.type }, ...prev])
      toast.success('Campaign duplicated successfully')
    } catch (error) {
      console.error('Error duplicating campaign:', error)
      toast.error('Failed to duplicate campaign')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedCampaign(null)
    setCampaignType('email')
    setFormData({
      salon_id: currentSalonId || '',
      name: '',
      subject: '',
      content: '',
      message_template: '',
      campaign_type: 'promotional',
      scheduled_at: ''
    })
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    return format(new Date(date), 'MMM d, yyyy h:mm a')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
          <p className="text-muted-foreground">
            Manage email and SMS campaigns {currentSalonId ? 'for this salon' : 'across all salons'}
          </p>
        </div>
        <Button onClick={() => {
          resetForm()
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.totalEmail}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Campaigns</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.totalSms}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.totalReach.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {!currentSalonId && (
          <Select value={selectedSalon} onValueChange={setSelectedSalon}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Salons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Salons</SelectItem>
              {salons.map(salon => (
                <SelectItem key={salon.id} value={salon.id}>
                  {salon.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {/* Campaigns Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              {!currentSalonId && <TableHead>Salon</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Scheduled/Sent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={currentSalonId ? 7 : 8} className="text-center py-8">
                  <p className="text-muted-foreground">No campaigns found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {campaign.type === 'email' ? (
                        <Mail className="h-3 w-3" />
                      ) : (
                        <MessageSquare className="h-3 w-3" />
                      )}
                      {campaign.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      {campaign.subject && (
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {campaign.subject}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  {!currentSalonId && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{campaign.salon?.name}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge className={STATUS_COLORS[campaign.status] || 'bg-gray-100 text-gray-800'}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {campaign.recipientCount?.toLocaleString() || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.engagement !== undefined ? (
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{campaign.engagement}%</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {campaign.sent_at || campaign.completed_at ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDate(campaign.sent_at || campaign.completed_at)}
                        </div>
                      ) : campaign.scheduled_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(campaign.scheduled_at)}
                        </div>
                      ) : (
                        '-'
                      )}
                    </div>
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
                            <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendCampaign(campaign)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send Now
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleDuplicateCampaign(campaign)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setDeleteDialogOpen(true)
                          }}
                          disabled={campaign.status === 'sending'}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}
            </DialogTitle>
            <DialogDescription>
              {selectedCampaign 
                ? 'Update the campaign details'
                : 'Create a new marketing campaign'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={campaignType} onValueChange={(v) => setCampaignType(v as 'email' | 'sms')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" disabled={!!selectedCampaign}>
                <Mail className="mr-2 h-4 w-4" />
                Email Campaign
              </TabsTrigger>
              <TabsTrigger value="sms" disabled={!!selectedCampaign}>
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS Campaign
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              {!currentSalonId && (
                <div className="space-y-2">
                  <Label htmlFor="salon_id">Salon *</Label>
                  <Select
                    value={formData.salon_id}
                    onValueChange={(value) => setFormData({ ...formData, salon_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a salon" />
                    </SelectTrigger>
                    <SelectContent>
                      {salons.map(salon => (
                        <SelectItem key={salon.id} value={salon.id}>
                          {salon.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Summer Sale Newsletter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., 20% Off All Services This Week!"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Email Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your email content here..."
                  rows={8}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="sms" className="space-y-4">
              {!currentSalonId && (
                <div className="space-y-2">
                  <Label htmlFor="salon_id_sms">Salon *</Label>
                  <Select
                    value={formData.salon_id}
                    onValueChange={(value) => setFormData({ ...formData, salon_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a salon" />
                    </SelectTrigger>
                    <SelectContent>
                      {salons.map(salon => (
                        <SelectItem key={salon.id} value={salon.id}>
                          {salon.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name_sms">Campaign Name *</Label>
                <Input
                  id="name_sms"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Weekend Reminder"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campaign_type">Campaign Type</Label>
                <Select
                  value={formData.campaign_type}
                  onValueChange={(value) => setFormData({ ...formData, campaign_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message_template">Message Template *</Label>
                <Textarea
                  id="message_template"
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  placeholder="Hi {name}, don't forget your appointment tomorrow at {time}. Reply STOP to unsubscribe."
                  rows={4}
                  maxLength={160}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.message_template.length}/160 characters
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <Label htmlFor="scheduled_at">Schedule Send (Optional)</Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to save as draft
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !formData.name || !formData.salon_id ||
                (campaignType === 'email' ? (!formData.subject || !formData.content) : !formData.message_template)
              }
            >
              {loading ? 'Saving...' : selectedCampaign ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCampaign?.name}"? 
              This action cannot be undone.
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