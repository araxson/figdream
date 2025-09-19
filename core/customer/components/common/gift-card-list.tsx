"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Gift,
  DollarSign,
  Calendar,
  Mail,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import type { GiftCardWithPurchaser } from "../dal/gift-cards-types";

interface GiftCardListProps {
  giftCards: GiftCardWithPurchaser[];
  onEdit?: (card: GiftCardWithPurchaser) => void;
  onDeactivate?: (cardId: string) => void;
  onViewTransactions?: (cardId: string) => void;
  onSendReminder?: (cardId: string) => void;
}

export function GiftCardList({
  giftCards,
  onEdit,
  onDeactivate,
  onViewTransactions,
  onSendReminder,
}: GiftCardListProps) {
  const getCardStatus = (card: GiftCardWithPurchaser) => {
    const now = new Date();
    const validUntil = card.valid_until ? new Date(card.valid_until) : null;

    if (!card.is_active)
      return { label: "Inactive", variant: "secondary" as const };
    if (card.balance === 0)
      return { label: "Depleted", variant: "outline" as const };
    if (validUntil && validUntil < now)
      return { label: "Expired", variant: "destructive" as const };
    return { label: "Active", variant: "default" as const };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (giftCards.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Gift className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">No gift cards found</h3>
            <p className="text-sm text-muted-foreground">
              Gift cards will appear here once created.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Purchaser</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {giftCards.map((card) => {
            const status = getCardStatus(card);
            return (
              <TableRow key={card.id}>
                <TableCell className="font-mono text-sm">{card.code}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {card.purchaser?.display_name || "Unknown"}
                    </p>
                    {card.purchaser?.email && (
                      <p className="text-xs text-muted-foreground">
                        {card.purchaser.email}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {card.recipient_email ? (
                    <div>
                      <p className="text-sm">
                        {card.recipient_name || "Recipient"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {card.recipient_email}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(card.amount)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(card.balance)}
                  </div>
                </TableCell>
                <TableCell>
                  {card.valid_until ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(card.valid_until), "MMM dd, yyyy")}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No expiry</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>
                    {status.label === "Expired" && (
                      <AlertCircle className="mr-1 h-3 w-3" />
                    )}
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onViewTransactions?.(card.id)}
                      >
                        View Transactions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(card)}>
                        Edit Details
                      </DropdownMenuItem>
                      {card.recipient_email && (
                        <DropdownMenuItem
                          onClick={() => onSendReminder?.(card.id)}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Send Reminder
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeactivate?.(card.id)}
                        className="text-destructive"
                      >
                        Deactivate Card
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
