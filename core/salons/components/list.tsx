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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Star,
  StarOff,
  Eye,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import type { SalonWithRelations } from "../types";

interface SalonsListProps {
  salons: SalonWithRelations[];
  onActionComplete?: () => void;
}

export function SalonsList({ salons, onActionComplete }: SalonsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const getSubscriptionBadge = (tier: string) => {
    const tierConfig = {
      free: { label: "Free", variant: "secondary" as const },
      basic: { label: "Basic", variant: "default" as const },
      pro: { label: "Pro", variant: "default" as const },
      enterprise: { label: "Enterprise", variant: "secondary" as const },
    };

    const config = tierConfig[tier as keyof typeof tierConfig] || {
      label: tier,
      variant: "secondary" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleAction = async (action: string, salonId: string) => {
    setLoadingId(salonId);
    try {
      const response = await fetch(`/api/salons/${salonId}/${action}`, {
        method: action === "delete" ? "DELETE" : "POST",
      });

      if (response.ok) {
        onActionComplete?.();
      }
    } catch (error) {
      console.error(`Failed to ${action} salon:`, error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Salon</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salons.map((salon) => (
            <TableRow key={salon.id}>
              <TableCell>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {salon.name}
                    {salon.is_featured && (
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {salon.business_type || "Salon"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="h-3 w-3" />
                    {salon.email}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    {salon.phone}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3" />
                  {typeof salon.address === 'object' && salon.address
                    ? `${salon.address.city || ''}, ${salon.address.state || ''}`
                    : typeof salon.address === 'string'
                    ? salon.address
                    : "No address"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {salon.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {salon.is_verified && (
                    <Badge variant="outline">Verified</Badge>
                  )}
                  {salon.is_accepting_bookings && (
                    <Badge variant="default">Bookable</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getSubscriptionBadge(salon.subscription_tier || "free")}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {salon.rating_average?.toFixed(1) || "0.0"} ⭐
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {salon.rating_count || 0} reviews
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loadingId === salon.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleAction("view", salon.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("edit", salon.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {!salon.is_verified && (
                      <DropdownMenuItem
                        onClick={() => handleAction("verify", salon.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify Salon
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleAction("toggle-featured", salon.id)}
                    >
                      {salon.is_featured ? (
                        <>
                          <StarOff className="mr-2 h-4 w-4" />
                          Remove Featured
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" />
                          Make Featured
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("toggle-booking", salon.id)}
                    >
                      {salon.is_accepting_bookings ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Disable Bookings
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Enable Bookings
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("delete", salon.id)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
