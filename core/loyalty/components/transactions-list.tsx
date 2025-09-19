/**
 * Loyalty Transactions List Component
 * Display transaction history for loyalty program
 */

"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown, Gift, Clock } from "lucide-react";
import { useProgramMembers } from "../hooks";
import type { LoyaltyTransaction } from "../dal";

interface LoyaltyTransactionsListProps {
  programId: string;
}

export function LoyaltyTransactionsList({ programId }: LoyaltyTransactionsListProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const { data: membersData, isLoading: isLoadingMembers } = useProgramMembers(programId, 100, 0);

  // Mock transactions for now - would normally fetch based on selectedMemberId
  const mockTransactions: LoyaltyTransaction[] = [];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "redeemed":
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case "adjusted":
        return <Gift className="h-4 w-4 text-blue-500" />;
      case "expired":
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case "earned":
        return "default" as const;
      case "redeemed":
        return "secondary" as const;
      case "adjusted":
        return "outline" as const;
      case "expired":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a member to view transactions" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingMembers ? (
                <div className="p-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                membersData?.members.map((member) => {
                  const customer = member.customer as any;
                  return (
                    <SelectItem key={member.id} value={member.id}>
                      {customer?.first_name} {customer?.last_name} ({member.points_balance} pts)
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedMemberId ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Select a member to view their transaction history
            </p>
          </div>
        ) : mockTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.transaction_type)}
                      <Badge variant={getTransactionBadgeVariant(transaction.transaction_type)}>
                        {transaction.transaction_type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right font-medium">
                    {transaction.transaction_type === "earned" || transaction.transaction_type === "adjusted" ? "+" : "-"}
                    {Math.abs(transaction.points_amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.balance_after.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {transaction.reference_type && (
                      <Badge variant="outline">{transaction.reference_type}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}