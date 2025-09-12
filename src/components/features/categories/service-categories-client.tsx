'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Grid3X3,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react'
import { toast } from 'sonner'

interface ServiceCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  services?: { count: number }[]
}

interface ServiceCategoriesClientProps {
  categories: ServiceCategory[]
  counts: {
    total: number
    active: number
    inactive: number
    uncategorized: number
  }
}

export function ServiceCategoriesClient({ 
  categories: initialCategories, 
  counts
}: ServiceCategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    display_order: 0,
    is_active: true
  })

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = !searchQuery || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const url = selectedCategory 
        ? `/api/admin/categories/${selectedCategory.id}`
        : '/api/admin/categories'
      
      const response = await fetch(url, {
        method: selectedCategory ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error('Failed to save category')
      
      const { category } = await response.json()
      
      if (selectedCategory) {
        setCategories(prev => prev.map(c => c.id === category.id ? category : c))
        toast.success('Category updated successfully')
      } else {
        setCategories(prev => [...prev, category].sort((a, b) => a.display_order - b.display_order))
        toast.success('Category created successfully')
      }
      
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: ServiceCategory) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      display_order: category.display_order,
      is_active: category.is_active
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedCategory) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete category')
      
      setCategories(prev => prev.filter(c => c.id !== selectedCategory.id))
      toast.success('Category deleted successfully')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setSelectedCategory(null)
    }
  }

  const handleReorder = async (category: ServiceCategory, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === category.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex < 0 || newIndex >= categories.length) return
    
    const newCategories = [...categories]
    const swapCategory = newCategories[newIndex]
    
    // Swap display orders
    const tempOrder = category.display_order
    category.display_order = swapCategory.display_order
    swapCategory.display_order = tempOrder
    
    // Swap positions in array
    newCategories[currentIndex] = swapCategory
    newCategories[newIndex] = category
    
    setCategories(newCategories)
    
    // Update both categories in backend
    try {
      await Promise.all([
        fetch(`/api/admin/categories/${category.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: category.display_order })
        }),
        fetch(`/api/admin/categories/${swapCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: swapCategory.display_order })
        })
      ])
    } catch (error) {
      console.error('Error reordering categories:', error)
      toast.error('Failed to reorder categories')
    }
  }

  const resetForm = () => {
    setSelectedCategory(null)
    setFormData({
      name: '',
      description: '',
      icon: '',
      display_order: categories.length,
      is_active: true
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Categories</h1>
          <p className="text-muted-foreground">
            Organize services into categories for better navigation
          </p>
        </div>
        <Button onClick={() => {
          resetForm()
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.inactive}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uncategorized</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.uncategorized}</div>
            <p className="text-xs text-muted-foreground">Services without category</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Categories</CardTitle>
                <CardDescription>
                  Manage service categories and their display order
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Grid3X3 className="h-3 w-3" />
                {filteredCategories.length} categories
              </Badge>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Grid3X3 className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No categories found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category, index) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleReorder(category, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleReorder(category, 'down')}
                            disabled={index === filteredCategories.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{category.name}</div>
                        {category.icon && (
                          <div className="text-sm text-muted-foreground">{category.icon}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate">
                          {category.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {category.services?.[0]?.count || 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedCategory(category)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory 
                ? 'Update the category information'
                : 'Add a new service category to organize your services'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Hair Services"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., ✂️ or icon name"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Show this category to customers
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.name}>
              {loading ? 'Saving...' : selectedCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? 
              {selectedCategory?.services?.[0]?.count ? (
                <span className="block mt-2 font-semibold">
                  Warning: This category has {selectedCategory.services[0].count} services associated with it.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}