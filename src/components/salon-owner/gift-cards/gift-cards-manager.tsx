"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui"
import { 
  Gift, 
  Plus, 
  Search, 
  Filter,
  Download,
  DollarSign,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Ban
} from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
type GiftCard = {
  id: string
  code: string
  balance: number
  original_amount: number
  status: 'active' | 'expired' | 'depleted' | 'cancelled'
  created_at: string
  expires_at: string | null
  purchaser_email: string
  recipient_email?: string
  last_used?: string
  total_redemptions: number
}
export function GiftCardsManager() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [_loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [_filterStatus, _setFilterStatus] = useState<string>("all")
  const [_selectedCard, _setSelectedCard] = useState<GiftCard | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  useEffect(() => {
    fetchGiftCards()
  }, [])
  async function fetchGiftCards() {
    try {
      const _supabase = createClient()
      // Fetch gift cards for the salon
      // Using mock data for now
      const mockGiftCards: GiftCard[] = [
        {
          id: "1",
          code: "GIFT-2024-001",
          balance: 50.00,
          original_amount: 100.00,
          status: 'active',
          created_at: "2024-12-01T10:00:00",
          expires_at: "2025-12-31",
          purchaser_email: "john@example.com",
          recipient_email: "jane@example.com",
          last_used: "2024-12-20T11:00:00",
          total_redemptions: 2
        },
        {
          id: "2",
          code: "GIFT-2024-002",
          balance: 75.00,
          original_amount: 75.00,
          status: 'active',
          created_at: "2024-11-15T14:30:00",
          expires_at: "2025-06-30",
          purchaser_email: "alice@example.com",
          total_redemptions: 0
        },
        {
          id: "3",
          code: "GIFT-2024-003",
          balance: 0.00,
          original_amount: 50.00,
          status: 'depleted',
          created_at: "2024-10-01T09:00:00",
          expires_at: "2025-10-01",
          purchaser_email: "bob@example.com",
          recipient_email: "carol@example.com",
          last_used: "2024-11-30T16:00:00",
          total_redemptions: 3
        }
      ]
      setGiftCards(mockGiftCards)
    } catch (error) {
      console.error("Error fetching gift cards:", error)
      toast.error("Failed to load gift cards")
    } finally {
      setLoading(false)
    }
  }
  const filteredGiftCards = giftCards.filter(card => {
    const matchesSearch = card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.purchaser_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (card.recipient_email && card.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === "all" || card.status === filterStatus
    return matchesSearch && matchesFilter
  })
  const stats = {
    totalActive: giftCards.filter(c => c.status === 'active').length,
    totalBalance: giftCards.reduce((sum, c) => sum + c.balance, 0),
    totalSold: giftCards.reduce((sum, c) => sum + c.original_amount, 0),
    totalRedeemed: giftCards.reduce((sum, c) => sum + (c.original_amount - c.balance), 0)
  }
  const handleCancelCard = async (_cardId: string) => {
    try {
      // Cancel gift card logic
      toast.success("Gift card cancelled successfully")
      fetchGiftCards()
    } catch (_error) {
      toast.error("Failed to cancel gift card")
    }
  }
  const handleRefundCard = async (_cardId: string) => {
    try {
      // Refund gift card logic
      toast.success("Gift card refunded successfully")
      fetchGiftCards()
    } catch (_error) {
      toast.error("Failed to refund gift card")
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'expired':
        return 'destructive'
      case 'depleted':
        return 'secondary'
      case 'cancelled':
        return 'outline'
      default:
        return 'default'
    }
  }
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActive}</div>
            <p className="text-xs text-muted-foreground">Currently active gift cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Outstanding balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSold.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total value sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRedeemed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total redeemed value</p>
          </CardContent>
        </Card>
      </div>
      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gift Cards</CardTitle>
              <CardDescription>Manage and track all gift cards</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Gift Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Gift Card</DialogTitle>
                  <DialogDescription>
                    Issue a new gift card manually
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" placeholder="100.00" min="1" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Email</Label>
                    <Input type="email" placeholder="customer@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiration Date (Optional)</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input placeholder="Internal notes (optional)" />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => {
                      toast.success("Gift card created successfully")
                      setIsCreateDialogOpen(false)
                    }}>
                      Create Gift Card
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Cards</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
                <TabsTrigger value="depleted">Depleted</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cards..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Original</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Purchaser</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGiftCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.code}</TableCell>
                        <TableCell>${card.balance.toFixed(2)}</TableCell>
                        <TableCell>${card.original_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(card.status)}>
                            {card.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{card.purchaser_email}</TableCell>
                        <TableCell>{format(new Date(card.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          {card.expires_at ? format(new Date(card.expires_at), 'MMM d, yyyy') : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                            {card.status === 'active' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRefundCard(card.id)}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleCancelCard(card.id)}
                                >
                                  <Ban className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="active" className="space-y-4">
              {/* Similar table for active cards */}
              <p className="text-muted-foreground">Showing active gift cards only</p>
            </TabsContent>
            <TabsContent value="expired" className="space-y-4">
              {/* Similar table for expired cards */}
              <p className="text-muted-foreground">Showing expired gift cards only</p>
            </TabsContent>
            <TabsContent value="depleted" className="space-y-4">
              {/* Similar table for depleted cards */}
              <p className="text-muted-foreground">Showing depleted gift cards only</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}