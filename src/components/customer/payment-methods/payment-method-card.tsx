"use client"
import { CreditCard, Star, MoreVertical } from "lucide-react"
import {
  Card,
  CardContent,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui"
import type { Database } from "@/types/database.types"
type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"]
interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod
  onSetDefault?: (id: string) => void
  onRemove?: (id: string) => void
  onEdit?: (id: string) => void
}
export function PaymentMethodCard({
  paymentMethod,
  onSetDefault,
  onRemove,
  onEdit,
}: PaymentMethodCardProps) {
  const getCardBrand = (brand: string | null) => {
    const brandMap: Record<string, string> = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
      diners: "Diners Club",
      jcb: "JCB",
      unionpay: "UnionPay",
    }
    return brandMap[brand?.toLowerCase() || ""] || "Card"
  }
  const getCardColor = (brand: string | null) => {
    const colorMap: Record<string, string> = {
      visa: "bg-blue-500",
      mastercard: "bg-red-500",
      amex: "bg-green-500",
      discover: "bg-orange-500",
      diners: "bg-gray-500",
      jcb: "bg-purple-500",
      unionpay: "bg-indigo-500",
    }
    return colorMap[brand?.toLowerCase() || ""] || "bg-gray-400"
  }
  const formatExpiry = () => {
    const month = paymentMethod.exp_month?.toString().padStart(2, "0")
    const year = paymentMethod.exp_year?.toString().slice(-2)
    return `${month}/${year}`
  }
  return (
    <Card className="overflow-hidden">
      <div className={`h-2 ${getCardColor(paymentMethod.card_brand)}`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {getCardBrand(paymentMethod.card_brand)}
                </p>
                {paymentMethod.is_default && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>•••• {paymentMethod.last_four}</span>
                <span>Expires {formatExpiry()}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!paymentMethod.is_default && onSetDefault && (
                <>
                  <DropdownMenuItem onClick={() => onSetDefault(paymentMethod.id)}>
                    <Star className="mr-2 h-4 w-4" />
                    Set as Default
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(paymentMethod.id)}>
                  Edit Billing Address
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem
                  onClick={() => onRemove(paymentMethod.id)}
                  className="text-red-600"
                >
                  Remove Card
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {paymentMethod.billing_address && (
          <div className="mt-4 rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Billing Address
            </p>
            <p className="text-sm">
              {(paymentMethod.billing_address as { line1: string; line2?: string; city: string; state: string; postal_code: string }).line1}
              {(paymentMethod.billing_address as { line1: string; line2?: string; city: string; state: string; postal_code: string }).line2 && (
                <>, {(paymentMethod.billing_address as { line1: string; line2?: string; city: string; state: string; postal_code: string }).line2}</>
              )}
            </p>
            <p className="text-sm">
              {(paymentMethod.billing_address as { line1: string; line2?: string; city: string; state: string; postal_code: string }).city},{" "}
              {(paymentMethod.billing_address as { line1: string; line2?: string; city: string; state: string; postal_code: string }).state}{" "}
              {(paymentMethod.billing_address as { line1: string; line2?: string; city: string; state: string; postal_code: string }).postal_code}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
interface PaymentMethodCompactProps {
  paymentMethod: PaymentMethod
  selected?: boolean
  onSelect?: (id: string) => void
}
export function PaymentMethodCompact({
  paymentMethod,
  selected = false,
  onSelect,
}: PaymentMethodCompactProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer ${
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={() => onSelect?.(paymentMethod.id)}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            •••• {paymentMethod.last_four}
          </p>
          {paymentMethod.is_default && (
            <Badge variant="secondary">
              Default
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Expires {paymentMethod.exp_month?.toString().padStart(2, "0")}/{paymentMethod.exp_year}
        </p>
      </div>
      {selected && (
        <div className="h-4 w-4 rounded-full bg-primary" />
      )}
    </div>
  )
}