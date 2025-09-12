'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, Plus, Edit2, Trash2, Search, ChevronDown, ChevronUp, Eye, EyeOff, Folder, FileText } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface FaqCategory {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  icon?: string;
  created_at: string;
  updated_at: string;
}

interface FaqQuestion {
  id: string;
  salon_id: string;
  category_id: string;
  question: string;
  answer: string;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
  views_count: number;
  helpful_count: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  category?: FaqCategory;
}

const DEFAULT_CATEGORIES = [
  { name: 'General', description: 'General questions about our salon', icon: 'HelpCircle' },
  { name: 'Appointments', description: 'Booking and scheduling questions', icon: 'Calendar' },
  { name: 'Services', description: 'Information about our services', icon: 'Scissors' },
  { name: 'Pricing', description: 'Pricing and payment questions', icon: 'DollarSign' },
  { name: 'Policies', description: 'Cancellation and other policies', icon: 'FileText' },
  { name: 'Products', description: 'Product information and availability', icon: 'Package' }
];

export function FaqManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [questions, setQuestions] = useState<FaqQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'manage' | 'preview'>('manage');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FaqCategory | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<FaqQuestion | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    display_order: 0,
    is_active: true
  });
  const [questionForm, setQuestionForm] = useState({
    category_id: '',
    question: '',
    answer: '',
    display_order: 0,
    is_featured: false,
    is_published: true,
    tags: [] as string[],
    tag_input: ''
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchCategories();
      fetchQuestions();
    }
  }, [salonId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_categories')
        .select('*')
        .eq('salon_id', salonId)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching FAQ categories:', error);
      toast.error('Failed to load FAQ categories');
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('faq_questions')
        .select(`
          *,
          category:faq_categories (
            id,
            name,
            description
          )
        `)
        .eq('salon_id', salonId)
        .order('category_id')
        .order('display_order');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching FAQ questions:', error);
      toast.error('Failed to load FAQ questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const categoryData = {
        salon_id: salonId,
        name: categoryForm.name,
        description: categoryForm.description || null,
        display_order: categoryForm.display_order,
        is_active: categoryForm.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('faq_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('faq_categories')
          .insert({
            ...categoryData,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Category created successfully');
      }

      setIsCategoryDialogOpen(false);
      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleSaveQuestion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const questionData = {
        salon_id: salonId,
        category_id: questionForm.category_id,
        question: questionForm.question,
        answer: questionForm.answer,
        display_order: questionForm.display_order,
        is_featured: questionForm.is_featured,
        is_published: questionForm.is_published,
        tags: questionForm.tags.length > 0 ? questionForm.tags : null,
        updated_at: new Date().toISOString()
      };

      if (editingQuestion) {
        const { error } = await supabase
          .from('faq_questions')
          .update(questionData)
          .eq('id', editingQuestion.id);

        if (error) throw error;
        toast.success('Question updated successfully');
      } else {
        const { error } = await supabase
          .from('faq_questions')
          .insert({
            ...questionData,
            views_count: 0,
            helpful_count: 0,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Question created successfully');
      }

      setIsQuestionDialogOpen(false);
      resetQuestionForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all questions in this category.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('faq_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Category deleted successfully');
      fetchCategories();
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('faq_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const togglePublished = async (question: FaqQuestion) => {
    try {
      const { error } = await supabase
        .from('faq_questions')
        .update({ is_published: !question.is_published })
        .eq('id', question.id);

      if (error) throw error;

      toast.success(`Question ${question.is_published ? 'unpublished' : 'published'}`);
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    }
  };

  const toggleFeatured = async (question: FaqQuestion) => {
    try {
      const { error } = await supabase
        .from('faq_questions')
        .update({ is_featured: !question.is_featured })
        .eq('id', question.id);

      if (error) throw error;

      toast.success(`Question ${question.is_featured ? 'unfeatured' : 'featured'}`);
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    }
  };

  const initializeDefaultCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const categoriesToInsert = DEFAULT_CATEGORIES.map((cat, index) => ({
        salon_id: salonId,
        name: cat.name,
        description: cat.description,
        display_order: index,
        is_active: true,
        icon: cat.icon,
        created_at: new Date().toISOString(),
        created_by: user.id
      }));

      const { error } = await supabase
        .from('faq_categories')
        .insert(categoriesToInsert);

      if (error) throw error;

      toast.success('Default categories created');
      fetchCategories();
    } catch (error) {
      console.error('Error creating default categories:', error);
      toast.error('Failed to create default categories');
    }
  };

  const addTag = () => {
    if (questionForm.tag_input && !questionForm.tags.includes(questionForm.tag_input)) {
      setQuestionForm({
        ...questionForm,
        tags: [...questionForm.tags, questionForm.tag_input],
        tag_input: ''
      });
    }
  };

  const removeTag = (tag: string) => {
    setQuestionForm({
      ...questionForm,
      tags: questionForm.tags.filter(t => t !== tag)
    });
  };

  const openCategoryDialog = (category?: FaqCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        display_order: category.display_order,
        is_active: category.is_active
      });
    } else {
      setEditingCategory(null);
      resetCategoryForm();
    }
    setIsCategoryDialogOpen(true);
  };

  const openQuestionDialog = (question?: FaqQuestion) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        category_id: question.category_id,
        question: question.question,
        answer: question.answer,
        display_order: question.display_order,
        is_featured: question.is_featured,
        is_published: question.is_published,
        tags: question.tags || [],
        tag_input: ''
      });
    } else {
      setEditingQuestion(null);
      resetQuestionForm();
    }
    setIsQuestionDialogOpen(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      display_order: 0,
      is_active: true
    });
    setEditingCategory(null);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      category_id: categories[0]?.id || '',
      question: '',
      answer: '',
      display_order: 0,
      is_featured: false,
      is_published: true,
      tags: [],
      tag_input: ''
    });
    setEditingQuestion(null);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = searchTerm === '' || 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || q.category_id === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedQuestions = categories.map(category => ({
    category,
    questions: filteredQuestions.filter(q => q.category_id === category.id)
  }));

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {categories.length} categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.is_published).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Visible to customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.is_featured).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Highlighted questions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Active categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>FAQ Management</CardTitle>
              <CardDescription>
                Manage frequently asked questions for customers
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {categories.length === 0 && (
                <Button variant="outline" onClick={initializeDefaultCategories}>
                  Create Default Categories
                </Button>
              )}
              <Button variant="outline" onClick={() => openCategoryDialog()}>
                <Folder className="mr-2 h-4 w-4" />
                Add Category
              </Button>
              <Button onClick={() => openQuestionDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'manage' | 'preview')}>
            <TabsList className="mb-4">
              <TabsTrigger value="manage">Manage</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="manage">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No FAQ questions found</p>
                  <p className="text-sm mt-2">Add your first question to help customers</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{question.question}</div>
                            <div className="text-sm text-muted-foreground">
                              {question.answer.substring(0, 100)}...
                            </div>
                            {question.tags && question.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {question.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {question.category?.name || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {question.is_published ? (
                              <Badge variant="default">
                                <Eye className="h-3 w-3 mr-1" />
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Draft
                              </Badge>
                            )}
                            {question.is_featured && (
                              <Badge variant="default">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{question.views_count} views</div>
                            <div>{question.helpful_count} helpful</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePublished(question)}
                            >
                              {question.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFeatured(question)}
                            >
                              <ChevronUp className={`h-4 w-4 ${question.is_featured ? 'text-primary' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openQuestionDialog(question)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
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

            <TabsContent value="preview">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-lg font-medium mb-4">Customer View Preview</h3>
                {groupedQuestions.filter(g => g.questions.length > 0).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No published questions to preview</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {groupedQuestions
                      .filter(g => g.questions.filter(q => q.is_published).length > 0)
                      .map(({ category, questions }) => (
                        <div key={category.id} className="mb-6">
                          <h4 className="font-medium mb-3">{category.name}</h4>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {category.description}
                            </p>
                          )}
                          {questions
                            .filter(q => q.is_published)
                            .map((question) => (
                              <AccordionItem key={question.id} value={question.id}>
                                <AccordionTrigger>
                                  <div className="flex items-start gap-2 text-left">
                                    {question.is_featured && (
                                      <Badge variant="default" className="mt-0.5">
                                        Featured
                                      </Badge>
                                    )}
                                    <span>{question.question}</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="pt-2 pb-4 px-1">
                                    <p className="text-sm text-muted-foreground">
                                      {question.answer}
                                    </p>
                                    {question.tags && question.tags.length > 0 && (
                                      <div className="flex gap-1 mt-3">
                                        {question.tags.map(tag => (
                                          <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                        </div>
                      ))}
                  </Accordion>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add FAQ Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details' : 'Create a new FAQ category'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Appointments"
              />
            </div>
            <div>
              <Label htmlFor="cat-desc">Description (Optional)</Label>
              <Textarea
                id="cat-desc"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="cat-order">Display Order</Label>
              <Input
                id="cat-order"
                type="number"
                value={categoryForm.display_order}
                onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="cat-active"
                checked={categoryForm.is_active}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_active: checked })}
              />
              <Label htmlFor="cat-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add FAQ Question'}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion ? 'Update question details' : 'Create a new FAQ question'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="q-category">Category</Label>
              <Select
                value={questionForm.category_id}
                onValueChange={(value) => setQuestionForm({ ...questionForm, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="q-question">Question</Label>
              <Input
                id="q-question"
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                placeholder="What is your cancellation policy?"
              />
            </div>
            <div>
              <Label htmlFor="q-answer">Answer</Label>
              <Textarea
                id="q-answer"
                value={questionForm.answer}
                onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                placeholder="Provide a detailed answer..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="q-tags">Tags (Optional)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="q-tags"
                  value={questionForm.tag_input}
                  onChange={(e) => setQuestionForm({ ...questionForm, tag_input: e.target.value })}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
              {questionForm.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {questionForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        className="ml-1 hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="q-order">Display Order</Label>
              <Input
                id="q-order"
                type="number"
                value={questionForm.display_order}
                onChange={(e) => setQuestionForm({ ...questionForm, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="q-featured"
                  checked={questionForm.is_featured}
                  onCheckedChange={(checked) => setQuestionForm({ ...questionForm, is_featured: checked })}
                />
                <Label htmlFor="q-featured">Featured</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="q-published"
                  checked={questionForm.is_published}
                  onCheckedChange={(checked) => setQuestionForm({ ...questionForm, is_published: checked })}
                />
                <Label htmlFor="q-published">Published</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion}>
              {editingQuestion ? 'Update' : 'Create'} Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}