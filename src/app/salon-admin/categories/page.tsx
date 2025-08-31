'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/database/supabase/client';
import type { Database } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Folder, 
  FolderOpen, 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  Package,
  Tag,
  Layers,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Hash,
  Palette,
  FileText,
  Search,
  Filter,
  X,
  Save,
  RefreshCw,
  ArrowUpDown,
  MoreVertical
} from 'lucide-react';

// ULTRA-TYPES: Comprehensive type definitions
type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

interface CategoryWithServices extends ServiceCategory {
  services?: Service[];
  services_count?: number;
  expanded?: boolean;
}

interface DragItem {
  id: string;
  index: number;
  type: 'category';
}

// ULTRA-CONSTANTS: Icon and color presets for categories
const CATEGORY_ICONS = [
  { value: 'scissors', label: 'Scissors', icon: '✂️' },
  { value: 'brush', label: 'Brush', icon: '🖌️' },
  { value: 'spray', label: 'Spray', icon: '💨' },
  { value: 'nail', label: 'Nail', icon: '💅' },
  { value: 'face', label: 'Face', icon: '😊' },
  { value: 'spa', label: 'Spa', icon: '🧖' },
  { value: 'makeup', label: 'Makeup', icon: '💄' },
  { value: 'hair', label: 'Hair', icon: '💇' }
];

const CATEGORY_COLORS = [
  { value: '#FF6B6B', label: 'Red' },
  { value: '#4ECDC4', label: 'Teal' },
  { value: '#45B7D1', label: 'Blue' },
  { value: '#96CEB4', label: 'Green' },
  { value: '#FFEAA7', label: 'Yellow' },
  { value: '#DDA0DD', label: 'Plum' },
  { value: '#98D8C8', label: 'Mint' },
  { value: '#F8B500', label: 'Orange' }
];

export default function ServiceCategoriesPage() {
  // ULTRA-STATE: Comprehensive state management
  const [categories, setCategories] = useState<CategoryWithServices[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [uncategorizedServices, setUncategorizedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithServices | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithServices | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('categories');
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  // ULTRA-FORM: Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#4ECDC4',
    display_order: 0,
    is_active: true
  });

  // ULTRA-FETCH: Load categories and services
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch categories with services
      const { data: categoriesData, error: catError } = await supabase
        .from('service_categories')
        .select(`
          *,
          services (
            id,
            name,
            description,
            price,
            duration,
            is_active
          )
        `)
        .order('display_order', { ascending: true });

      if (catError) throw catError;

      // Process categories with service counts
      const processedCategories = (categoriesData || []).map(cat => ({
        ...cat,
        services_count: cat.services?.length || 0,
        expanded: false
      }));

      setCategories(processedCategories);

      // Fetch all services for assignment
      const { data: servicesData, error: servError } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (servError) throw servError;
      setServices(servicesData || []);

      // Identify uncategorized services
      const uncategorized = (servicesData || []).filter(s => !s.category_id);
      setUncategorizedServices(uncategorized);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load categories and services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ULTRA-HANDLER: Create or update category
  const handleSaveCategory = async () => {
    try {
      const supabase = createClient();

      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description || null,
        icon: categoryForm.icon || null,
        color: categoryForm.color || null,
        display_order: categoryForm.display_order,
        is_active: categoryForm.is_active
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('service_categories')
          .update({
            ...categoryData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        // Get max display order for new category
        const maxOrder = Math.max(...categories.map(c => c.display_order || 0), 0);

        const { error } = await supabase
          .from('service_categories')
          .insert({
            ...categoryData,
            display_order: maxOrder + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Category created successfully');
      }

      setShowCategoryDialog(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  // ULTRA-HANDLER: Delete category with reassignment option
  const handleDeleteCategory = async (category: CategoryWithServices) => {
    if (category.services_count && category.services_count > 0) {
      const reassignTo = prompt(
        `This category has ${category.services_count} services. Enter another category ID to reassign them to, or cancel:`
      );
      
      if (!reassignTo) return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;

      toast.success('Category deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  // ULTRA-HANDLER: Assign services to category
  const handleAssignServices = async () => {
    if (!selectedCategory || selectedServices.length === 0) {
      toast.error('Please select a category and services');
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('services')
        .update({ 
          category_id: selectedCategory.id,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedServices);

      if (error) throw error;

      toast.success(`${selectedServices.length} services assigned to ${selectedCategory.name}`);
      setSelectedServices([]);
      loadData();
    } catch (error) {
      console.error('Error assigning services:', error);
      toast.error('Failed to assign services');
    }
  };

  // ULTRA-HANDLER: Remove service from category
  const handleRemoveService = async (serviceId: string, categoryId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('services')
        .update({ 
          category_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId);

      if (error) throw error;

      toast.success('Service removed from category');
      loadData();
    } catch (error) {
      console.error('Error removing service:', error);
      toast.error('Failed to remove service');
    }
  };

  // ULTRA-HANDLER: Reorder categories (drag-drop)
  const handleReorderCategories = async (fromIndex: number, toIndex: number) => {
    const newCategories = [...categories];
    const [removed] = newCategories.splice(fromIndex, 1);
    newCategories.splice(toIndex, 0, removed);

    // Update display orders
    const updates = newCategories.map((cat, index) => ({
      id: cat.id,
      display_order: index + 1
    }));

    setCategories(newCategories);

    try {
      const supabase = createClient();

      // Update all categories with new orders
      for (const update of updates) {
        await supabase
          .from('service_categories')
          .update({ 
            display_order: update.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);
      }

      toast.success('Categories reordered successfully');
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast.error('Failed to reorder categories');
      loadData(); // Reload to restore original order
    }
  };

  // ULTRA-FILTER: Filter categories by search
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ULTRA-HEADER: Page title and actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Folder className="h-6 w-6" />
            Service Categories
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize your services into categories for better navigation
          </p>
        </div>
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              setCategoryForm({
                name: '',
                description: '',
                icon: '',
                color: '#4ECDC4',
                display_order: 0,
                is_active: true
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit' : 'Create'} Category</DialogTitle>
              <DialogDescription>
                Configure category details and appearance
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Category Name</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Hair Services"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon</Label>
                  <Select value={categoryForm.icon} onValueChange={(value) => setCategoryForm(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_ICONS.map(icon => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <span className="flex items-center gap-2">
                            <span>{icon.icon}</span>
                            <span>{icon.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Color</Label>
                  <Select value={categoryForm.color} onValueChange={(value) => setCategoryForm(prev => ({ ...prev, color: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_COLORS.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <span className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: color.value }}
                            />
                            <span>{color.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={categoryForm.is_active}
                  onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCategory}>
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ULTRA-STATS: Category overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {categories.filter(c => c.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uncategorized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uncategorizedServices.length}</div>
            <p className="text-xs text-yellow-600 mt-1">
              Services need categorization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Services/Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length > 0 
                ? Math.round(services.filter(s => s.category_id).length / categories.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Distribution metric
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ULTRA-TABS: Categories and services management */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="services">Service Assignment</TabsTrigger>
            <TabsTrigger value="uncategorized">
              Uncategorized ({uncategorizedServices.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
            <Button variant="outline" size="icon" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category, index) => (
                  <TableRow 
                    key={category.id}
                    draggable
                    onDragStart={() => setDraggedItem({ id: category.id, index, type: 'category' })}
                    onDragEnd={() => setDraggedItem(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedItem && draggedItem.type === 'category') {
                        handleReorderCategories(draggedItem.index, index);
                      }
                    }}
                    className="cursor-move"
                  >
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {category.icon && (
                          <span>{CATEGORY_ICONS.find(i => i.value === category.icon)?.icon}</span>
                        )}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.color && (
                            <div 
                              className="w-12 h-1 rounded mt-1"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground truncate">
                        {category.description || 'No description'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {category.services_count || 0} services
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryForm({
                              name: category.name,
                              description: category.description || '',
                              icon: category.icon || '',
                              color: category.color || '#4ECDC4',
                              display_order: category.display_order || 0,
                              is_active: category.is_active
                            });
                            setShowCategoryDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assign Services to Categories</CardTitle>
              <CardDescription>
                Select services and assign them to a category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select 
                    value={selectedCategory?.id || ''} 
                    onValueChange={(value) => {
                      const cat = categories.find(c => c.id === value);
                      setSelectedCategory(cat || null);
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select target category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={handleAssignServices}
                    disabled={!selectedCategory || selectedServices.length === 0}
                  >
                    Assign {selectedServices.length} Service(s)
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Select Services</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {services.map(service => (
                      <label 
                        key={service.id}
                        className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedServices(prev => [...prev, service.id]);
                            } else {
                              setSelectedServices(prev => prev.filter(id => id !== service.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {service.name}
                          {service.category_id && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {categories.find(c => c.id === service.category_id)?.name}
                            </Badge>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uncategorized" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uncategorized Services</CardTitle>
              <CardDescription>
                These services need to be assigned to a category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uncategorizedServices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>All services are categorized!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uncategorizedServices.map(service => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>${service.price}</TableCell>
                        <TableCell>{service.duration} min</TableCell>
                        <TableCell>
                          <Select 
                            onValueChange={(categoryId) => {
                              handleAssignServices();
                              // Auto-assign this service to selected category
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}