import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash, Package } from "lucide-react";
import type { InventoryItemWithRelations } from "../dal/inventory-types";

interface InventoryListProps {
  items: InventoryItemWithRelations[];
  onEdit?: (item: InventoryItemWithRelations) => void;
  onDelete?: (itemId: string) => void;
  onAdjustStock?: (item: InventoryItemWithRelations) => void;
  isLoading?: boolean;
}

export function InventoryList({
  items,
  onEdit,
  onDelete,
  onAdjustStock,
  isLoading,
}: InventoryListProps) {
  const getStockStatus = (item: InventoryItemWithRelations) => {
    const stock = item.quantity_in_stock;
    const minStock = item.minimum_stock_level || 0;

    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (stock <= minStock) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="default">In Stock</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading inventory...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No inventory items found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div>
                <div className="font-medium">{item.product_name}</div>
                {item.brand && (
                  <div className="text-sm text-muted-foreground">
                    {item.brand}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{item.sku || "-"}</TableCell>
            <TableCell>{item.category || "-"}</TableCell>
            <TableCell>
              <div>
                <div>
                  {item.quantity_in_stock} {item.unit_of_measure || "units"}
                </div>
                {item.minimum_stock_level && (
                  <div className="text-sm text-muted-foreground">
                    Min: {item.minimum_stock_level}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{getStockStatus(item)}</TableCell>
            <TableCell>${item.cost_per_unit?.toFixed(2) || "0.00"}</TableCell>
            <TableCell>${item.sale_price?.toFixed(2) || "0.00"}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onAdjustStock?.(item)}>
                    <Package className="mr-2 h-4 w-4" />
                    Adjust Stock
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(item)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(item.id)}
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
  );
}
