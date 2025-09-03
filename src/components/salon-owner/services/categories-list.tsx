"use client"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, GripVertical, Package2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, Skeleton } from "@/components/ui"
import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import type { Database } from "@/types/database.types"
type ServiceCategory = Database["public"]["Tables"]["service_categories"]["Row"]
interface CategoriesListProps {
  salonId: string
  onEdit?: (category: ServiceCategory) => void
  onAdd?: () => void
}
export function CategoriesList({ salonId, onEdit, onAdd }: CategoriesListProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()
  useEffect(() => {
    loadCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId])
  const loadCategories = async () => {
    try {
      setLoading(true)
      // Fetch categories with service count
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("service_categories")
        .select("*, services:services(count)")
        .eq("salon_id", salonId)
        .order("display_order", { ascending: true })
      if (categoriesError) throw categoriesError
      setCategories(categoriesData || [])
    } catch (error) {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("service_categories")
        .delete()
        .eq("id", id)
      if (error) throw error
      setCategories(prev => prev.filter(cat => cat.id !== id))
      toast.success("Category deleted successfully")
    } catch (error) {
      toast.error("Failed to delete category")
    } finally {
      setDeleteId(null)
    }
  }
  const handleToggleStatus = async (category: ServiceCategory) => {
    try {
      const newStatus = category.is_active ? false : true
      const { error } = await supabase
        .from("service_categories")
        .update({ is_active: newStatus })
        .eq("id", category.id)
      if (error) throw error
      setCategories(prev => 
        prev.map(cat => 
          cat.id === category.id 
            ? { ...cat, is_active: newStatus }
            : cat
        )
      )
      toast.success(`Category ${newStatus ? "activated" : "deactivated"}`)
    } catch (error) {
      toast.error("Failed to update category status")
    }
  }
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
          <CardDescription>
            Loading categories...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
          <CardDescription>
            Organize your services into categories for easier management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No categories found. Create your first category to get started.
            </p>
            {onAdd && (
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>
                Manage your service categories and organization
              </CardDescription>
            </div>
            {onAdd && (
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Services</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  </TableCell>
                  <TableCell className="font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <span className="text-sm text-muted-foreground truncate">
                      {category.description || "No description"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {(category as Database['public']['Tables']['categories']['Row'] & {services?: Array<{count: number}>}).services?.[0]?.count || 0} services
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={category.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleToggleStatus(category)}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              All services in this category will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}