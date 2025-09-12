'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
  ShoppingBag,
  Store,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Palette,
  Building
} from 'lucide-react'
import { toast } from 'sonner'

interface Salon {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  salon_id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  salon?: Salon
  serviceCount?: number
}

interface CategoriesClientProps {
  categories: Category[]
  salons: Salon[]
  counts: {
    total: number
    active: number
    services: number
    salons: number
  }
  currentSalonId?: string
}

// Icon options for categories
const ICON_OPTIONS = [
  { value: 'tag', label: 'Tag', icon: Tag },
  { value: 'shopping-bag', label: 'Shopping Bag', icon: ShoppingBag },
  { value: 'layers', label: 'Layers', icon: Layers },
  { value: 'palette', label: 'Palette', icon: Palette }
]

export function CategoriesClient({ 
  categories: initialCategories, 
  salons,
  counts,
  currentSalonId
}: CategoriesClientProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSalon, setSelectedSalon] = useState(currentSalonId || '')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    salon_id: currentSalonId || '',
    name: '',
    description: '',
    icon: 'tag',
    is_active: true,
    display_order: 0
  })

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = !searchQuery || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSalon = !selectedSalon || category.salon_id === selectedSalon
    
    return matchesSearch && matchesSalon
  })

  const handleSubmit = async () => {
    if (!formData.salon_id) {
      toast.error('Please select a salon')
      return
    }

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
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save category')
      }
      
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
      toast.error(error instanceof Error ? error.message : 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      salon_id: category.salon_id,
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'tag',
      is_active: category.is_active,
      display_order: category.display_order
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
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }
      
      setCategories(prev => prev.filter(c => c.id !== selectedCategory.id))
      toast.success('Category deleted successfully')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete category')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setSelectedCategory(null)
    }
  }

  const handleToggleStatus = async (category: Category) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/categories/${category.id}/toggle-status`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to toggle status')
      
      const { is_active } = await response.json()
      
      setCategories(prev => prev.map(c => 
        c.id === category.id ? { ...c, is_active } : c
      ))
      
      toast.success(`Category ${is_active ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Failed to toggle status')
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (categoryId: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(c => c.id === categoryId)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= categories.length) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      })
      
      if (!response.ok) throw new Error('Failed to reorder')
      
      // Swap categories in the list
      const newCategories = [...categories]
      const temp = newCategories[index]
      newCategories[index] = newCategories[newIndex]
      newCategories[newIndex] = temp
      
      // Update display orders
      newCategories[index].display_order = index
      newCategories[newIndex].display_order = newIndex
      
      setCategories(newCategories)
      toast.success('Category reordered')
    } catch (error) {
      console.error('Error reordering:', error)
      toast.error('Failed to reorder category')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedCategory(null)
    setFormData({
      salon_id: currentSalonId || '',
      name: '',
      description: '',
      icon: 'tag',
      is_active: true,
      display_order: categories.length
    })
  }

  const getIconComponent = (iconName: string | null) => {
    const iconOption = ICON_OPTIONS.find(opt => opt.value === iconName)
    const IconComponent = iconOption?.icon || Tag
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Categories</h1>
          <p className="text-muted-foreground">
            Manage service categories {currentSalonId ? 'for this salon' : 'across all salons'}
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
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.services}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {currentSalonId ? 'Current Salon' : 'Total Salons'}
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.salons}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {!currentSalonId && (
          <Select value={selectedSalon} onValueChange={setSelectedSalon}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Salons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Salons</SelectItem>
              {salons.map(salon => (
                <SelectItem key={salon.id} value={salon.id}>
                  {salon.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {/* Categories Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              {!currentSalonId && <TableHead>Salon</TableHead>}
              <TableHead>Description</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={currentSalonId ? 7 : 8} className="text-center py-8">
                  <p className="text-muted-foreground">No categories found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleReorder(category.id, 'up')}
                        disabled={index === 0 || loading}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleReorder(category.id, 'down')}
                        disabled={index === filteredCategories.length - 1 || loading}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{getIconComponent(category.icon)}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  {!currentSalonId && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{category.salon?.name}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="max-w-[300px]">
                    <p className="truncate text-sm text-muted-foreground">
                      {category.description || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {category.serviceCount || 0} services
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleToggleStatus(category)}>
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          Toggle Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setSelectedCategory(category)
                            setDeleteDialogOpen(true)
                          }}
                          disabled={category.serviceCount && category.serviceCount > 0}
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
                ? 'Update the category details'
                : 'Add a new service category'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!currentSalonId && (
              <div className="space-y-2">
                <Label htmlFor="salon_id">Salon *</Label>
                <Select
                  value={formData.salon_id}
                  onValueChange={(value) => setFormData({ ...formData, salon_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a salon" />
                  </SelectTrigger>
                  <SelectContent>
                    {salons.map(salon => (
                      <SelectItem key={salon.id} value={salon.id}>
                        {salon.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
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
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Make this category visible
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
            <Button onClick={handleSubmit} disabled={loading || !formData.name || !formData.salon_id}>
              {loading ? 'Saving...' : selectedCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? 
              {selectedCategory?.serviceCount ? (
                <span className="block mt-2 font-semibold text-destructive">
                  This category has {selectedCategory.serviceCount} services and cannot be deleted.
                </span>
              ) : (
                ' This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading || (selectedCategory?.serviceCount && selectedCategory.serviceCount > 0)}
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