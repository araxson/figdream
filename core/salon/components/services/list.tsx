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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Copy, Eye } from "lucide-react";
import { ServiceWithCategory } from "../dal/services-types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { EmptyState } from "@/core/shared/ui/components/empty-state";

interface ServicesListProps {
  services: ServiceWithCategory[];
  salonId?: string;
  onEdit?: (service: ServiceWithCategory) => void;
  onDelete?: (serviceId: string) => void;
  onDuplicate?: (service: ServiceWithCategory) => void;
  onView?: (service: ServiceWithCategory) => void;
}

export function ServicesList({
  services,
  salonId,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
}: ServicesListProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(services.map((s) => s.id));
    } else {
      setSelectedServices([]);
    }
  };

  const handleSelectService = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, serviceId]);
    } else {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    }
  };

  const getStatusBadge = (service: ServiceWithCategory) => {
    if (!service.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!service.is_bookable) {
      return <Badge variant="outline">Not Bookable</Badge>;
    }
    if (service.is_featured) {
      return <Badge variant="default">Featured</Badge>;
    }
    return <Badge variant="outline">Active</Badge>;
  };

  const getPriceBadge = (service: ServiceWithCategory) => {
    if (
      service.sale_price &&
      service.base_price &&
      service.sale_price < service.base_price
    ) {
      return (
        <div className="flex items-center gap-2">
          <span className="line-through text-muted-foreground">
            {formatCurrency(service.base_price)}
          </span>
          <span className="font-semibold">
            {formatCurrency(service.sale_price)}
          </span>
          <Badge variant="destructive" className="text-xs">
            SALE
          </Badge>
        </div>
      );
    }
    return (
      <span>
        {service.base_price != null
          ? formatCurrency(service.base_price)
          : "Price on request"}
      </span>
    );
  };

  if (services.length === 0) {
    return (
      <EmptyState
        preset="services"
        action={{
          label: "Add Your First Service",
          onClick: () => {
            window.location.href = `/dashboard/services/new${salonId ? `?salon=${salonId}` : ''}`;
          },
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services ({services.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]">
                  <input
                    type="checkbox"
                    checked={selectedServices.length === services.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={(e) =>
                        handleSelectService(service.id, e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {service.short_description && (
                        <p className="text-sm text-muted-foreground">
                          {service.short_description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.category?.name || (
                      <span className="text-muted-foreground">
                        Uncategorized
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDuration(service.duration_minutes)}
                  </TableCell>
                  <TableCell>{getPriceBadge(service)}</TableCell>
                  <TableCell>{getStatusBadge(service)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{service.booking_count || 0} total</p>
                      {service.rating_average != null &&
                        service.rating_average > 0 && (
                          <p className="text-muted-foreground">
                            ⭐ {service.rating_average.toFixed(1)} (
                            {service.rating_count || 0})
                          </p>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView?.(service)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(service)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDuplicate?.(service)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete?.(service.id)}
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

        {selectedServices.length > 0 && (
          <div className="flex items-center gap-4 mt-4 p-4 bg-muted rounded-lg">
            <span className="text-sm">
              {selectedServices.length} service(s) selected
            </span>
            <Button variant="outline" size="sm">
              Bulk Edit
            </Button>
            <Button variant="destructive" size="sm">
              Delete Selected
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
