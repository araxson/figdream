"use client"
import { useState, useEffect } from "react"
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@/components/ui"
import { Gift, CreditCard, Calendar, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/database/supabase/client"
type GiftCard = {
  id: string
  code: string
  balance: number
  original_amount: number
  expires_at: string | null
  created_at: string
  status: 'active' | 'expired' | 'depleted'
  sender_name?: string
  message?: string
}
export function GiftCardList() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    fetchGiftCards()
  }, [])
  async function fetchGiftCards() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Please sign in to view your gift cards")
        return
      }
      // Fetch gift cards from database
      const { data: giftCards, error } = await supabase
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
          message
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to load gift cards')
        return
      }

      setGiftCards(giftCards || [])
    } catch (err) {
      setError("Failed to load gift cards")
    } finally {
      setLoading(false)
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'expired':
        return 'bg-red-500'
      case 'depleted':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }
  if (giftCards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Gift className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Gift Cards</h3>
          <p className="text-muted-foreground text-center">
            You don&apos;t have any gift cards yet. Purchase one or enter a gift card code to get started.
          </p>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {giftCards.map((card) => (
        <Card key={card.id} className="relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 ${getStatusColor(card.status)} opacity-10 rounded-bl-full`} />
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  {card.code}
                </CardTitle>
                <CardDescription className="mt-1">
                  {card.sender_name && `From ${card.sender_name}`}
                </CardDescription>
              </div>
              <Badge variant={card.status === 'active' ? 'default' : 'secondary'}>
                {card.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">${card.balance.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  of ${card.original_amount.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {card.expires_at ? (
                    <span>Expires {format(new Date(card.expires_at), 'MMM d, yyyy')}</span>
                  ) : (
                    <span>No expiration</span>
                  )}
                </div>
              </div>
            </div>
            {card.message && (
              <p className="text-sm italic text-muted-foreground border-l-2 pl-3">
                &quot;{card.message}&quot;
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Use Card
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <DollarSign className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}