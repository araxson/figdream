"use client"
import { useState, useEffect } from "react"
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator, Skeleton } from "@/components/ui"
import { 
  Gift, 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  ArrowDownLeft, 
  ArrowUpRight,
  Copy,
  Share2,
  Download
} from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/database/supabase/client"
import { toast } from "sonner"
type Transaction = {
  id: string
  date: string
  type: 'purchase' | 'redemption' | 'refund' | 'adjustment'
  amount: number
  description: string
  location?: string
  staff?: string
  balance_after: number
}
type GiftCardDetails = {
  id: string
  code: string
  balance: number
  original_amount: number
  expires_at: string | null
  created_at: string
  status: 'active' | 'expired' | 'depleted'
  sender_name?: string
  recipient_name?: string
  message?: string
  transactions: Transaction[]
}
interface GiftCardDetailsProps {
  giftCardId: string
}
export function GiftCardDetails({ giftCardId }: GiftCardDetailsProps) {
  const [giftCard, setGiftCard] = useState<GiftCardDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    fetchGiftCardDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftCardId])
  async function fetchGiftCardDetails() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Please sign in to view gift card details")
        return
      }
      // Fetch gift card details from database
      const { data: giftCardData, error: cardError } = await supabase
        .from('gift_cards')
        .select(`
          id,
          code,
          balance,
          original_amount,
          expires_at,
          created_at,
          status,
          sender_name,
          recipient_name,
          message
        `)
        .eq('id', giftCardId)
        .single()

      if (cardError || !giftCardData) {
        setError("Gift card not found")
        return
      }

      // Fetch transaction history
      const { data: transactions, error: transError } = await supabase
        .from('gift_card_transactions')
        .select(`
          id,
          date:created_at,
          type,
          amount,
          description,
          location:salon_id,
          staff:staff_member_id,
          balance_after
        `)
        .eq('gift_card_id', giftCardId)
        .order('created_at', { ascending: false })

      if (transError) {
      }

      const giftCardWithTransactions: GiftCardDetails = {
        ...giftCardData,
        transactions: transactions || []
      }
      
      setGiftCard(giftCardWithTransactions)
    } catch (err) {
      setError("Failed to load gift card details")
    } finally {
      setLoading(false)
    }
  }
  const copyToClipboard = () => {
    if (giftCard) {
      navigator.clipboard.writeText(giftCard.code)
      toast.success("Gift card code copied to clipboard")
    }
  }
  const shareGiftCard = () => {
    if (giftCard && navigator.share) {
      navigator.share({
        title: 'Gift Card',
        text: `Gift Card Code: ${giftCard.code} - Balance: $${giftCard.balance}`,
      })
    } else {
      copyToClipboard()
    }
  }
  const downloadPDF = () => {
    toast.success("Downloading gift card as PDF...")
    // Implement PDF generation logic
  }
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'redemption':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'refund':
        return <ArrowDownLeft className="h-4 w-4 text-blue-500" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />
    }
  }
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600'
      case 'redemption':
        return 'text-red-600'
      case 'refund':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }
  if (error || !giftCard) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground">{error || "Gift card not found"}</p>
        </CardContent>
      </Card>
    )
  }
  const usagePercentage = ((giftCard.original_amount - giftCard.balance) / giftCard.original_amount) * 100
  return (
    <div className="space-y-4">
      {/* Main Card Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Gift className="h-6 w-6" />
                Gift Card Details
              </CardTitle>
              <CardDescription className="mt-2">
                Code: {giftCard.code}
              </CardDescription>
            </div>
            <Badge variant={giftCard.status === 'active' ? 'default' : 'secondary'}>
              {giftCard.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-3xl font-bold">${giftCard.balance.toFixed(2)}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>of ${giftCard.original_amount.toFixed(2)} original value</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full"
                  style={{ width: `${100 - usagePercentage}%` }}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {giftCard.expires_at 
                    ? `Expires ${format(new Date(giftCard.expires_at), 'MMMM d, yyyy')}`
                    : 'No expiration date'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Purchased {format(new Date(giftCard.created_at), 'MMMM d, yyyy')}</span>
              </div>
              {giftCard.sender_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>From: {giftCard.sender_name}</span>
                </div>
              )}
              {giftCard.recipient_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>To: {giftCard.recipient_name}</span>
                </div>
              )}
            </div>
          </div>
          {/* Personal Message */}
          {giftCard.message && (
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm italic">&quot;{giftCard.message}&quot;</p>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
            <Button variant="outline" size="sm" onClick={shareGiftCard}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All activity for this gift card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {giftCard.transactions.map((transaction, index) => (
              <div key={transaction.id}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(transaction.date), 'MMM d, yyyy h:mm a')}</span>
                        {transaction.location && (
                          <>
                            <span>•</span>
                            <span>{transaction.location}</span>
                          </>
                        )}
                        {transaction.staff && (
                          <>
                            <span>•</span>
                            <span>{transaction.staff}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: ${transaction.balance_after.toFixed(2)}
                    </p>
                  </div>
                </div>
                {index < giftCard.transactions.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}