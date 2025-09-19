'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MoreHorizontal,
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  Filter,
  Download
} from 'lucide-react'
import { ProductForm } from './product-form'
// TODO: Implement these components
// import { ProductDetail } from './product-detail'
// import { StockAdjustmentForm } from '../stock/stock-adjustment-form'

// Placeholder components
const ProductDetail = ({ product, onClose }: any) => (
  <div className="space-y-4">
    <p className="text-muted-foreground">Product details for {product?.name}</p>
    <Button onClick={onClose}>Close</Button>
  </div>
)

const StockAdjustmentForm = ({ product, onClose, onSave }: any) => (
  <div className="space-y-4">
    <p className="text-muted-foreground">Stock adjustment for {product?.name}</p>
    <Button onClick={onClose}>Cancel</Button>
  </div>
)
import type { Product, ProductCategory, Supplier } from '../../types'

interface ProductListProps {
  products: Product[]
  categories: ProductCategory[]
  suppliers: Supplier[]
  salonId: string
}

export function ProductList({ products, categories, suppliers, salonId }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [showProductForm, setShowProductForm] = useState(false)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showStockAdjustment, setShowStockAdjustment] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'sku' | 'stock'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
    const matchesSupplier = selectedSupplier === 'all' || product.supplier_id === selectedSupplier

    let matchesStock = true
    if (stockFilter === 'low') {
      matchesStock = (product.available_stock || 0) <= product.min_stock_level
    } else if (stockFilter === 'out') {
      matchesStock = (product.available_stock || 0) === 0
    } else if (stockFilter === 'in') {
      matchesStock = (product.available_stock || 0) > product.min_stock_level
    }

    return matchesSearch && matchesCategory && matchesSupplier && matchesStock
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let compareValue = 0

    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name)
        break
      case 'sku':
        compareValue = a.sku.localeCompare(b.sku)
        break
      case 'stock':
        compareValue = (a.available_stock || 0) - (b.available_stock || 0)
        break
    }

    return sortOrder === 'asc' ? compareValue : -compareValue
  })

  const handleSort = (column: 'name' | 'sku' | 'stock') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const getStockStatus = (product: Product) => {
    const stock = product.available_stock || 0

    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (stock <= product.min_stock_level) {
      return <Badge variant="warning">Low Stock</Badge>
    } else {
      return <Badge variant="success">In Stock</Badge>
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowProductForm(true)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product)
    setShowStockAdjustment(true)
  }

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      // Call delete action
    }
  }

  const handleExport = () => {
    // Export products to CSV
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => {
                setSelectedProduct(null)
                setShowProductForm(true)
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {sortedProducts.length} of {products.length} products
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('sku')}
                      className="-ml-3"
                    >
                      SKU
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="-ml-3"
                    >
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Retail</TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('stock')}
                    >
                      Stock
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      <div className="py-12">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No products found
                        </p>
                        <Button
                          className="mt-4"
                          onClick={() => {
                            setSelectedProduct(null)
                            setShowProductForm(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Product
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">
                        {product.sku}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                        {product.brand && (
                          <span className="ml-1 text-sm text-muted-foreground">
                            ({product.brand})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{product.category_name || '-'}</TableCell>
                      <TableCell>{product.supplier_name || '-'}</TableCell>
                      <TableCell className="text-right">
                        ${product.cost_price?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.retail_price?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.is_trackable ? (
                          <span className="font-medium">
                            {product.available_stock || 0} / {product.total_stock || 0}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not tracked</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.is_trackable ? getStockStatus(product) : (
                          <Badge variant="secondary">N/A</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            {product.is_trackable && (
                              <DropdownMenuItem onClick={() => handleAdjustStock(product)}>
                                <Package className="mr-2 h-4 w-4" />
                                Adjust Stock
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(product)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? 'Update the product information below.'
                : 'Fill in the details to add a new product to your inventory.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            categories={categories}
            suppliers={suppliers}
            salonId={salonId}
            onClose={() => {
              setShowProductForm(false)
              setSelectedProduct(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onClose={() => {
                setShowProductDetail(false)
                setSelectedProduct(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showStockAdjustment} onOpenChange={setShowStockAdjustment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>
              Update the stock quantity for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <StockAdjustmentForm
              product={selectedProduct}
              salonId={salonId}
              onClose={() => {
                setShowStockAdjustment(false)
                setSelectedProduct(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}