"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  InventoryItemInsert,
  InventoryItemUpdate,
} from "../dal/inventory-types";

interface InventoryFormProps {
  item?: InventoryItemUpdate;
  salonId: string;
  onSubmit: (data: InventoryItemInsert | InventoryItemUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InventoryForm({
  item,
  salonId,
  onSubmit,
  onCancel,
  isLoading,
}: InventoryFormProps) {
  const [formData, setFormData] = useState<
    InventoryItemInsert | InventoryItemUpdate
  >(
    item || {
      salon_id: salonId,
      product_name: "",
      sku: "",
      barcode: "",
      category: "",
      brand: "",
      description: "",
      quantity_in_stock: 0,
      minimum_stock_level: 0,
      maximum_stock_level: 0,
      reorder_point: 0,
      unit_of_measure: "units",
      cost_per_unit: 0,
      sale_price: 0,
      supplier_name: "",
      location: "",
      is_active: true,
    },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="product_name">Product Name *</Label>
          <Input
            id="product_name"
            value={formData.product_name}
            onChange={(e) => handleChange("product_name", e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formData.sku || ""}
            onChange={(e) => handleChange("sku", e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            value={formData.barcode || ""}
            onChange={(e) => handleChange("barcode", e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category || ""}
            onChange={(e) => handleChange("category", e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand || ""}
            onChange={(e) => handleChange("brand", e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="quantity_in_stock">Current Stock *</Label>
          <Input
            id="quantity_in_stock"
            type="number"
            value={formData.quantity_in_stock}
            onChange={(e) =>
              handleChange("quantity_in_stock", parseInt(e.target.value))
            }
            required
            disabled={isLoading}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="unit_of_measure">Unit of Measure</Label>
          <Select
            value={formData.unit_of_measure || "units"}
            onValueChange={(value) => handleChange("unit_of_measure", value)}
            disabled={isLoading}
          >
            <SelectTrigger id="unit_of_measure">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="units">Units</SelectItem>
              <SelectItem value="pieces">Pieces</SelectItem>
              <SelectItem value="bottles">Bottles</SelectItem>
              <SelectItem value="boxes">Boxes</SelectItem>
              <SelectItem value="kg">Kilograms</SelectItem>
              <SelectItem value="g">Grams</SelectItem>
              <SelectItem value="l">Liters</SelectItem>
              <SelectItem value="ml">Milliliters</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="minimum_stock_level">Minimum Stock Level</Label>
          <Input
            id="minimum_stock_level"
            type="number"
            value={formData.minimum_stock_level || 0}
            onChange={(e) =>
              handleChange("minimum_stock_level", parseInt(e.target.value))
            }
            disabled={isLoading}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="reorder_point">Reorder Point</Label>
          <Input
            id="reorder_point"
            type="number"
            value={formData.reorder_point || 0}
            onChange={(e) =>
              handleChange("reorder_point", parseInt(e.target.value))
            }
            disabled={isLoading}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
          <Input
            id="cost_per_unit"
            type="number"
            step="0.01"
            value={formData.cost_per_unit || 0}
            onChange={(e) =>
              handleChange("cost_per_unit", parseFloat(e.target.value))
            }
            disabled={isLoading}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="sale_price">Sale Price ($)</Label>
          <Input
            id="sale_price"
            type="number"
            step="0.01"
            value={formData.sale_price || 0}
            onChange={(e) =>
              handleChange("sale_price", parseFloat(e.target.value))
            }
            disabled={isLoading}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="supplier_name">Supplier Name</Label>
          <Input
            id="supplier_name"
            value={formData.supplier_name || ""}
            onChange={(e) => handleChange("supplier_name", e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="location">Storage Location</Label>
          <Input
            id="location"
            value={formData.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="col-span-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active ?? true}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : item ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
