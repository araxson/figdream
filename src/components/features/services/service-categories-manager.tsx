'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Edit, Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface ServiceCategoriesManagerProps {
  salonId: string;
}

interface ServiceCategory {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  services_count?: number;
  children?: ServiceCategory[];
}

export function ServiceCategoriesManager({ salonId }: ServiceCategoriesManagerProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_category_id: '',
    display_order: 0,
    is_active: true
  });

  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, [salonId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch categories with service count
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select(`
          *,
          services:services(count)
        `)
        .eq('salon_id', salonId)
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Organize into tree structure
      const categoryMap = new Map<string, ServiceCategory>();
      const rootCategories: ServiceCategory[] = [];

      // First pass: create all categories
      categoriesData?.forEach(cat => {
        categoryMap.set(cat.id, {
          ...cat,
          services_count: cat.services?.[0]?.count || 0,
          children: []
        });
      });

      // Second pass: build tree
      categoryMap.forEach(cat => {
        if (cat.parent_category_id && categoryMap.has(cat.parent_category_id)) {
          const parent = categoryMap.get(cat.parent_category_id)!;
          parent.children = parent.children || [];
          parent.children.push(cat);
        } else if (!cat.parent_category_id) {
          rootCategories.push(cat);
        }
      });

      setCategories(rootCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load service categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .insert({
          salon_id: salonId,
          name: formData.name,
          description: formData.description || null,
          parent_category_id: formData.parent_category_id || null,
          display_order: formData.display_order,
          is_active: formData.is_active
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Category created successfully');
      setIsCreateOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;

    try {
      const { error } = await supabase
        .from('service_categories')
        .update({
          name: formData.name,
          description: formData.description || null,
          parent_category_id: formData.parent_category_id || null,
          display_order: formData.display_order,
          is_active: formData.is_active
        })
        .eq('id', selectedCategory.id);

      if (error) throw error;

      toast.success('Category updated successfully');
      setIsEditOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure? This will also affect all services in this category.')) return;

    try {
      const { error } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent_category_id: '',
      display_order: 0,
      is_active: true
    });
    setSelectedCategory(null);
  };

  const openEditDialog = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_category_id: category.parent_category_id || '',
      display_order: category.display_order,
      is_active: category.is_active
    });
    setIsEditOpen(true);
  };

  const renderCategory = (category: ServiceCategory, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="space-y-2">
        <div 
          className={`flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors ${
            level > 0 ? 'ml-8' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleExpanded(category.id)}
              >
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Folder className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                {!category.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                <Badge variant="outline">
                  {category.services_count || 0} services
                </Badge>
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>
                Organize your services into categories for better navigation
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories created yet. Add your first category to organize services.
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(category => renderCategory(category))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Service Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your services
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Hair Services"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
              />
            </div>
            <div>
              <Label htmlFor="parent">Parent Category (Optional)</Label>
              <Select
                value={formData.parent_category_id}
                onValueChange={(value) => setFormData({ ...formData, parent_category_id: value })}
              >
                <SelectTrigger id="parent">
                  <SelectValue placeholder="No parent (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No parent (top-level)</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service Category</DialogTitle>
            <DialogDescription>
              Update category details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-order">Display Order</Label>
              <Input
                id="edit-order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}