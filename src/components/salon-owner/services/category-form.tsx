"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Package2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, Textarea, Button, Switch } from "@/components/ui"
import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import type { Database } from "@/types/database.types"
type ServiceCategory = Database["public"]["Tables"]["service_categories"]["Row"]
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
})
type CategoryFormValues = z.infer<typeof categorySchema>
interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: ServiceCategory | null
  salonId: string
  onSuccess?: () => void
}
export function CategoryForm({
  open,
  onOpenChange,
  category,
  salonId,
  onSuccess,
}: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      is_active: category?.is_active ?? true,
      display_order: category?.display_order || 0,
    },
  })
  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setLoading(true)
      if (category) {
        // Update existing category
        const { error } = await supabase
          .from("service_categories")
          .update({
            name: values.name,
            description: values.description,
            is_active: values.is_active,
            display_order: values.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq("id", category.id)
        if (error) throw error
        toast.success("Category updated successfully")
      } else {
        // Create new category
        const { error } = await supabase
          .from("service_categories")
          .insert({
            salon_id: salonId,
            name: values.name,
            description: values.description,
            is_active: values.is_active,
            display_order: values.display_order,
          })
        if (error) throw error
        toast.success("Category created successfully")
      }
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(category ? "Failed to update category" : "Failed to create category")
    } finally {
      setLoading(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            <DialogTitle>
              {category ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {category
              ? "Update the category details below"
              : "Add a new service category to organize your services"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Hair Services, Nail Services" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this category..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Lower numbers appear first in the list
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Active categories are visible to customers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category ? "Update" : "Create"} Category
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}