"use client"
import { useState, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui"
import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import type { Database } from "@/types/database.types"
type ServiceCategory = Database["public"]["Tables"]["service_categories"]["Row"]
interface CategoryReorderProps {
  salonId: string
}
interface SortableItemProps {
  category: ServiceCategory & { serviceCount?: number }
}
function SortableItem({ category }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-4"
    >
      <button
        className="cursor-move touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{category.name}</p>
            {category.description && (
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {category.serviceCount !== undefined && (
              <Badge variant="secondary">
                {category.serviceCount} services
              </Badge>
            )}
            <Badge variant={category.is_active ? "default" : "secondary"}>
              {category.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
export function CategoryReorder({ salonId }: CategoryReorderProps) {
  const [categories, setCategories] = useState<(ServiceCategory & { serviceCount?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalOrder, setOriginalOrder] = useState<string[]>([])
  const supabase = createClient()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  )
  useEffect(() => {
    loadCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId])
  const loadCategories = async () => {
    try {
      setLoading(true)
      // Fetch categories with service count
      const { data: categoriesData, error } = await supabase
        .from("service_categories")
        .select(`
          *,
          services:services(count)
        `)
        .eq("salon_id", salonId)
        .order("display_order", { ascending: true })
      if (error) throw error
      const categoriesWithCount = (categoriesData || []).map(cat => ({
        ...cat,
        serviceCount: (cat as Database['public']['Tables']['categories']['Row'] & {services?: Array<{count: number}>}).services?.[0]?.count || 0
      }))
      setCategories(categoriesWithCount)
      setOriginalOrder(categoriesWithCount.map(c => c.id))
    } catch (error) {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    setCategories((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      const newOrder = arrayMove(items, oldIndex, newIndex)
      // Check if order has changed from original
      const currentOrder = newOrder.map(c => c.id)
      setHasChanges(
        JSON.stringify(currentOrder) !== JSON.stringify(originalOrder)
      )
      return newOrder
    })
  }
  const handleSaveOrder = async () => {
    try {
      setSaving(true)
      // Update display_order for all categories
      const updates = categories.map((category, index) => ({
        id: category.id,
        display_order: index,
      }))
      // Batch update all categories
      for (const update of updates) {
        const { error } = await supabase
          .from("service_categories")
          .update({ display_order: update.display_order })
          .eq("id", update.id)
        if (error) throw error
      }
      setOriginalOrder(categories.map(c => c.id))
      setHasChanges(false)
      toast.success("Category order saved successfully")
    } catch (error) {
      toast.error("Failed to save category order")
    } finally {
      setSaving(false)
    }
  }
  const handleReset = () => {
    const originalCategories = [...categories].sort((a, b) => {
      const aIndex = originalOrder.indexOf(a.id)
      const bIndex = originalOrder.indexOf(b.id)
      return aIndex - bIndex
    })
    setCategories(originalCategories)
    setHasChanges(false)
  }
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reorder Categories</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reorder Categories</CardTitle>
          <CardDescription>
            No categories available to reorder
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reorder Categories</CardTitle>
            <CardDescription>
              Drag and drop to change the display order of categories
            </CardDescription>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={saving}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSaveOrder}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Order
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {categories.map((category) => (
                <SortableItem key={category.id} category={category} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  )
}