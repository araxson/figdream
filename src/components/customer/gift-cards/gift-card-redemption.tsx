"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Checkbox, Alert, AlertDescription, Badge } from "@/components/ui"
import { 
  Gift, 
  CreditCard, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  X
} from "lucide-react"
import { toast } from "sonner"
type GiftCard = {
  id: string
  code: string
  balance: number
  expires_at: string | null
}
interface GiftCardRedemptionProps {
  totalAmount: number
  onApplyGiftCard?: (appliedAmount: number, giftCardId: string) => void
  onRemoveGiftCard?: () => void
}
export function GiftCardRedemption({ 
  totalAmount, 
  onApplyGiftCard,
  onRemoveGiftCard 
}: GiftCardRedemptionProps) {
  const [giftCardCode, setGiftCardCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [appliedCard, setAppliedCard] = useState<GiftCard | null>(null)
  const [appliedAmount, setAppliedAmount] = useState(0)
  const [useFullBalance, setUseFullBalance] = useState(true)
  const [customAmount, setCustomAmount] = useState("")
  const [error, setError] = useState<string | null>(null)
  async function verifyGiftCard() {
    if (!giftCardCode.trim()) {
      setError("Please enter a gift card code")
      return
    }
    setVerifying(true)
    setError(null)
    try {
      // Verify gift card code and fetch details
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      const mockGiftCard: GiftCard = {
        id: "gc-001",
        code: giftCardCode.toUpperCase(),
        balance: 75.00,
        expires_at: "2025-12-31"
      }
      // Check if card is expired
      if (mockGiftCard.expires_at && new Date(mockGiftCard.expires_at) < new Date()) {
        setError("This gift card has expired")
        return
      }
      // Check if card has sufficient balance
      if (mockGiftCard.balance <= 0) {
        setError("This gift card has no remaining balance")
        return
      }
      setAppliedCard(mockGiftCard)
      // Calculate amount to apply
      const amountToApply = Math.min(mockGiftCard.balance, totalAmount)
      setAppliedAmount(amountToApply)
      setCustomAmount(amountToApply.toString())
    } catch (err) {
      console.error("Error verifying gift card:", err)
      setError("Invalid gift card code")
    } finally {
      setVerifying(false)
    }
  }
  function applyGiftCard() {
    if (!appliedCard) return
    let finalAmount = appliedAmount
    if (!useFullBalance) {
      const custom = parseFloat(customAmount)
      if (isNaN(custom) || custom <= 0) {
        setError("Please enter a valid amount")
        return
      }
      if (custom > appliedCard.balance) {
        setError(`Amount cannot exceed gift card balance ($${appliedCard.balance})`)
        return
      }
      if (custom > totalAmount) {
        setError(`Amount cannot exceed order total ($${totalAmount})`)
        return
      }
      finalAmount = custom
    }
    setAppliedAmount(finalAmount)
    onApplyGiftCard?.(finalAmount, appliedCard.id)
    toast.success(`Gift card applied: -$${finalAmount.toFixed(2)}`)
  }
  function removeGiftCard() {
    setAppliedCard(null)
    setAppliedAmount(0)
    setGiftCardCode("")
    setCustomAmount("")
    setUseFullBalance(true)
    setError(null)
    onRemoveGiftCard?.()
    toast.info("Gift card removed")
  }
  const remainingBalance = totalAmount - appliedAmount
  if (appliedAmount > 0 && appliedCard) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Gift Card Applied</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeGiftCard}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{appliedCard.code}</span>
            </div>
            <Badge variant="outline" className="bg-white">
              Balance: ${appliedCard.balance.toFixed(2)}
            </Badge>
          </div>
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span>Order Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-green-600">
              <span>Gift Card Discount</span>
              <span>-${appliedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Amount Due</span>
              <span>${remainingBalance.toFixed(2)}</span>
            </div>
          </div>
          {appliedAmount < appliedCard.balance && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Remaining gift card balance after this order: ${(appliedCard.balance - appliedAmount).toFixed(2)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Apply Gift Card
        </CardTitle>
        <CardDescription>
          Enter your gift card code to apply it to this order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="gift-card-code">Gift Card Code</Label>
          <div className="flex gap-2">
            <Input
              id="gift-card-code"
              placeholder="Enter gift card code"
              value={giftCardCode}
              onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
              disabled={verifying || !!appliedCard}
            />
            {!appliedCard && (
              <Button 
                onClick={verifyGiftCard}
                disabled={verifying || !giftCardCode.trim()}
              >
                {verifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            )}
          </div>
        </div>
        {appliedCard && (
          <div className="space-y-4 pt-4 border-t">
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Gift card verified! Balance: ${appliedCard.balance.toFixed(2)}
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-full"
                  checked={useFullBalance}
                  onCheckedChange={(checked) => {
                    setUseFullBalance(checked as boolean)
                    if (checked) {
                      const amount = Math.min(appliedCard.balance, totalAmount)
                      setAppliedAmount(amount)
                      setCustomAmount(amount.toString())
                    }
                  }}
                />
                <Label
                  htmlFor="use-full"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use maximum available amount (${Math.min(appliedCard.balance, totalAmount).toFixed(2)})
                </Label>
              </div>
              {!useFullBalance && (
                <div className="space-y-2">
                  <Label htmlFor="custom-amount">Custom Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-9"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min="0"
                      max={Math.min(appliedCard.balance, totalAmount)}
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max: ${Math.min(appliedCard.balance, totalAmount).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={applyGiftCard}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Apply Gift Card
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setAppliedCard(null)
                  setGiftCardCode("")
                  setError(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Order Total</span>
            <span className="text-lg font-semibold">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}