/**
 * Loyalty Members List Component
 * Display and manage loyalty program members
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, UserPlus, Gift, TrendingUp, TrendingDown } from "lucide-react";
import { useProgramMembers, useSearchLoyaltyMembers } from "../hooks";
import { EnrollCustomerDialog } from "./enroll-dialog";
import { AdjustPointsDialog } from "./adjust-points-dialog";

interface LoyaltyMembersListProps {
  programId: string;
}

export function LoyaltyMembersList({ programId }: LoyaltyMembersListProps) {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [adjustPointsData, setAdjustPointsData] = useState<{
    open: boolean;
    loyaltyId: string;
    customerName: string;
    currentBalance: number;
  }>({
    open: false,
    loyaltyId: "",
    customerName: "",
    currentBalance: 0,
  });

  const limit = 20;
  const offset = page * limit;

  const { data, isLoading, error } = useProgramMembers(programId, limit, offset);
  const { data: searchResults, isLoading: isSearching } = useSearchLoyaltyMembers(
    programId,
    searchTerm
  );

  const members = searchTerm.length >= 2 ? searchResults || [] : data?.members || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load members: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Loyalty Members</CardTitle>
            <Button onClick={() => setEnrollDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Enroll Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Members Table */}
          {isLoading || isSearching ? (
            <TableSkeleton />
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No members found" : "No members enrolled yet"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Points Balance</TableHead>
                    <TableHead>Lifetime Points</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const customer = member.customer as any;
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {customer?.first_name} {customer?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {customer?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {member.points_balance.toLocaleString()}
                            </span>
                            {member.points_balance > 1000 && (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{member.lifetime_points.toLocaleString()}</TableCell>
                        <TableCell>{member.visits_count}</TableCell>
                        <TableCell>
                          {member.tier_level ? (
                            <Badge variant="outline">{member.tier_level}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(member.enrolled_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  setAdjustPointsData({
                                    open: true,
                                    loyaltyId: member.id,
                                    customerName: `${customer?.first_name} ${customer?.last_name}`,
                                    currentBalance: member.points_balance,
                                  })
                                }
                              >
                                <Gift className="mr-2 h-4 w-4" />
                                Adjust Points
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && !searchTerm && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} members
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <EnrollCustomerDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        programId={programId}
      />

      <AdjustPointsDialog
        open={adjustPointsData.open}
        onOpenChange={(open) =>
          setAdjustPointsData((prev) => ({ ...prev, open }))
        }
        loyaltyId={adjustPointsData.loyaltyId}
        customerName={adjustPointsData.customerName}
        currentBalance={adjustPointsData.currentBalance}
      />
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
        </div>
      ))}
    </div>
  );
}