'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, AlertTriangle, TrendingDown, BarChart3, ShoppingCart, Truck, Search, Filter, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Product {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  brand?: string;
  category: string;
  sku: string;
  barcode?: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_point: number;
  unit_cost: number;
  retail_price: number;
  supplier_id?: string;
  supplier_name?: string;
  location?: string;
  expiry_date?: string;
  is_active: boolean;
  track_inventory: boolean;
  allow_backorder: boolean;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  product_id: string;
  type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  reason?: string;
  reference_id?: string; // order id, appointment id, etc.
  performed_by: string;
  created_at: string;
}

interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  delivery_days?: number;
}

const PRODUCT_CATEGORIES = [
  'Hair Care',
  'Skin Care',
  'Nail Care',
  'Styling Products',
  'Color Products',
  'Tools & Equipment',
  'Accessories',
  'Retail Products'
];

export function ProductInventoryManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'inventory' | 'movements' | 'suppliers'>('inventory');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    sku: '',
    barcode: '',
    current_stock: 0,
    minimum_stock: 5,
    maximum_stock: 100,
    reorder_point: 10,
    unit_cost: 0,
    retail_price: 0,
    supplier_id: '',
    location: '',
    expiry_date: '',
    is_active: true,
    track_inventory: true,
    allow_backorder: false
  });
  const [movementData, setMovementData] = useState({
    type: 'in' as StockMovement['type'],
    quantity: 1,
    reason: ''
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiringItems: 0,
    averageTurnover: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchProducts();
      fetchMovements();
      fetchSuppliers();
      fetchStats();
    }
  }, [salonId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:suppliers(name)
        `)
        .eq('salon_id', salonId)
        .order('name');

      if (error) throw error;
      
      const mappedData = data?.map(item => ({
        ...item,
        supplier_name: item.supplier?.name
      })) || [];
      
      setProducts(mappedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(name),
          user:profiles!performed_by(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('salon_id', salonId)
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.retail_price), 0);
      const lowStockItems = products.filter(p => p.current_stock <= p.minimum_stock && p.current_stock > 0).length;
      const outOfStockItems = products.filter(p => p.current_stock === 0).length;
      
      // Check expiring items (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringItems = products.filter(p => 
        p.expiry_date && new Date(p.expiry_date) <= thirtyDaysFromNow
      ).length;
      
      // Calculate turnover (simplified)
      const averageTurnover = movements.filter(m => m.type === 'out').length / (products.length || 1);

      setStats({
        totalProducts,
        totalValue,
        lowStockItems,
        outOfStockItems,
        expiringItems,
        averageTurnover
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const productData = {
        salon_id: salonId,
        name: formData.name,
        description: formData.description || null,
        brand: formData.brand || null,
        category: formData.category,
        sku: formData.sku,
        barcode: formData.barcode || null,
        current_stock: formData.current_stock,
        minimum_stock: formData.minimum_stock,
        maximum_stock: formData.maximum_stock || null,
        reorder_point: formData.reorder_point,
        unit_cost: formData.unit_cost,
        retail_price: formData.retail_price,
        supplier_id: formData.supplier_id || null,
        location: formData.location || null,
        expiry_date: formData.expiry_date || null,
        is_active: formData.is_active,
        track_inventory: formData.track_inventory,
        allow_backorder: formData.allow_backorder,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...productData,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Product added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleStockMovement = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!selectedProduct) return;

      // Calculate new stock
      let newStock = selectedProduct.current_stock;
      if (movementData.type === 'in') {
        newStock += movementData.quantity;
      } else if (movementData.type === 'out' || movementData.type === 'adjustment') {
        newStock -= movementData.quantity;
      }

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          current_stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      // Record movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: selectedProduct.id,
          type: movementData.type,
          quantity: movementData.quantity,
          reason: movementData.reason || null,
          performed_by: user.id,
          created_at: new Date().toISOString()
        });

      if (movementError) throw movementError;

      toast.success('Stock updated successfully');
      setIsMovementDialogOpen(false);
      resetMovementForm();
      fetchProducts();
      fetchMovements();
      fetchStats();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Product deleted successfully');
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const exportInventory = () => {
    try {
      const headers = ['SKU', 'Name', 'Brand', 'Category', 'Stock', 'Min Stock', 'Unit Cost', 'Retail Price', 'Total Value'];
      const rows = filteredProducts.map(p => [
        p.sku,
        p.name,
        p.brand || '',
        p.category,
        p.current_stock,
        p.minimum_stock,
        p.unit_cost,
        p.retail_price,
        p.current_stock * p.retail_price
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Inventory exported successfully');
    } catch (error) {
      console.error('Error exporting inventory:', error);
      toast.error('Failed to export inventory');
    }
  };

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        brand: product.brand || '',
        category: product.category,
        sku: product.sku,
        barcode: product.barcode || '',
        current_stock: product.current_stock,
        minimum_stock: product.minimum_stock,
        maximum_stock: product.maximum_stock || 100,
        reorder_point: product.reorder_point,
        unit_cost: product.unit_cost,
        retail_price: product.retail_price,
        supplier_id: product.supplier_id || '',
        location: product.location || '',
        expiry_date: product.expiry_date ? product.expiry_date.split('T')[0] : '',
        is_active: product.is_active,
        track_inventory: product.track_inventory,
        allow_backorder: product.allow_backorder
      });
    } else {
      setEditingProduct(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const openMovementDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsMovementDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      brand: '',
      category: '',
      sku: '',
      barcode: '',
      current_stock: 0,
      minimum_stock: 5,
      maximum_stock: 100,
      reorder_point: 10,
      unit_cost: 0,
      retail_price: 0,
      supplier_id: '',
      location: '',
      expiry_date: '',
      is_active: true,
      track_inventory: true,
      allow_backorder: false
    });
    setEditingProduct(null);
  };

  const resetMovementForm = () => {
    setMovementData({
      type: 'in',
      quantity: 1,
      reason: ''
    });
    setSelectedProduct(null);
  };

  const getStockStatus = (product: Product) => {
    if (product.current_stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.current_stock <= product.minimum_stock) {
      return <Badge variant="outline" className="text-yellow-600">Low Stock</Badge>;
    } else if (product.current_stock >= (product.maximum_stock || Infinity)) {
      return <Badge variant="secondary">Overstocked</Badge>;
    }
    return <Badge variant="default">In Stock</Badge>;
  };

  const getStockPercentage = (product: Product) => {
    const max = product.maximum_stock || 100;
    return Math.min(100, (product.current_stock / max) * 100);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'low' && product.current_stock <= product.minimum_stock && product.current_stock > 0) ||
      (stockFilter === 'out' && product.current_stock === 0) ||
      (stockFilter === 'over' && product.maximum_stock && product.current_stock >= product.maximum_stock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!currentSalon) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          {isAdmin ? 'Please select a salon from the dropdown above' : 'No salon found'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Inventory value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Need reorder
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Unavailable
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringItems}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageTurnover.toFixed(1)}x</div>
            <p className="text-xs text-muted-foreground">
              Monthly avg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.outOfStockItems > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {stats.outOfStockItems} products out of stock. Consider reordering to avoid service disruptions.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                Manage salon products and stock levels
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportInventory}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="over">Overstocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="movements">Stock Movements</TabsTrigger>
                <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              </TabsList>

              <TabsContent value="inventory" className="mt-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No products found</p>
                    <p className="text-sm mt-2">Add your first product to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Retail Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.brand && (
                                <div className="text-sm text-muted-foreground">
                                  {product.brand}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{product.current_stock}</span>
                                <span className="text-sm text-muted-foreground">/ {product.maximum_stock || '∞'}</span>
                              </div>
                              <Progress value={getStockPercentage(product)} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>{getStockStatus(product)}</TableCell>
                          <TableCell>${product.unit_cost.toFixed(2)}</TableCell>
                          <TableCell>${product.retail_price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openMovementDialog(product)}
                              >
                                Adjust Stock
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDialog(product)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="movements" className="mt-4">
                {movements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No stock movements yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Performed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {format(new Date(movement.created_at), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                          <TableCell>
                            {products.find(p => p.id === movement.product_id)?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              movement.type === 'in' ? 'default' :
                              movement.type === 'out' ? 'secondary' :
                              'outline'
                            }>
                              {movement.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                          </TableCell>
                          <TableCell>{movement.reason || '-'}</TableCell>
                          <TableCell>Staff Member</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="suppliers" className="mt-4">
                {suppliers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No suppliers added</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Payment Terms</TableHead>
                        <TableHead>Products</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.contact_name || '-'}</TableCell>
                          <TableCell>{supplier.email || '-'}</TableCell>
                          <TableCell>{supplier.phone || '-'}</TableCell>
                          <TableCell>{supplier.payment_terms || '-'}</TableCell>
                          <TableCell>
                            {products.filter(p => p.supplier_id === supplier.id).length}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details' : 'Add a new product to inventory'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Shampoo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="L'Oreal"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="PROD-001"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="barcode">Barcode (Optional)</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Storage Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Shelf A-1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="current">Current Stock</Label>
                    <Input
                      id="current"
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum">Minimum Stock</Label>
                    <Input
                      id="minimum"
                      type="number"
                      value={formData.minimum_stock}
                      onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maximum">Maximum Stock</Label>
                    <Input
                      id="maximum"
                      type="number"
                      value={formData.maximum_stock}
                      onChange={(e) => setFormData({ ...formData, maximum_stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reorder">Reorder Point</Label>
                    <Input
                      id="reorder"
                      type="number"
                      value={formData.reorder_point}
                      onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track"
                      checked={formData.track_inventory}
                      onCheckedChange={(checked) => setFormData({ ...formData, track_inventory: checked })}
                    />
                    <Label htmlFor="track">Track Inventory</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="backorder"
                      checked={formData.allow_backorder}
                      onCheckedChange={(checked) => setFormData({ ...formData, allow_backorder: checked })}
                    />
                    <Label htmlFor="backorder">Allow Backorder</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cost">Unit Cost</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.unit_cost}
                      onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Retail Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.retail_price}
                      onChange={(e) => setFormData({ ...formData, retail_price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                {formData.unit_cost > 0 && formData.retail_price > 0 && (
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      Markup: {((formData.retail_price - formData.unit_cost) / formData.unit_cost * 100).toFixed(0)}%
                      <br />
                      Profit Margin: ${(formData.retail_price - formData.unit_cost).toFixed(2)}
                    </AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select
                    value={formData.supplier_id}
                    onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Record stock movement for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedProduct && (
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  Current Stock: {selectedProduct.current_stock} units
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="movement-type">Movement Type</Label>
              <Select
                value={movementData.type}
                onValueChange={(value) => setMovementData({ 
                  ...movementData, 
                  type: value as StockMovement['type']
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In (Add)</SelectItem>
                  <SelectItem value="out">Stock Out (Remove)</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={movementData.quantity}
                onChange={(e) => setMovementData({ ...movementData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={movementData.reason}
                onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                placeholder="Reason for stock movement..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockMovement}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}