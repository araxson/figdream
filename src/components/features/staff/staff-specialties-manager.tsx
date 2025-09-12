'use client';

import { useState, useEffect } from 'react';
import { Award, Plus, Edit2, Trash2, Search, Star, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

interface StaffSpecialty {
  id: string;
  staff_id: string;
  salon_id: string;
  specialty_name: string;
  proficiency_level: number; // 1-5
  years_experience: number;
  certification?: string;
  certification_date?: string;
  certification_expiry?: string;
  is_primary: boolean;
  is_featured: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  staff?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role?: string;
  };
}

const SPECIALTY_CATEGORIES = [
  'Hair Cutting',
  'Hair Coloring',
  'Hair Styling',
  'Chemical Treatments',
  'Extensions',
  'Makeup',
  'Nail Art',
  'Skin Care',
  'Massage Therapy',
  'Barbering',
  'Braiding',
  'Waxing',
  'Eyebrow & Lashes',
  'Special Occasions'
];

const PROFICIENCY_LEVELS = [
  { value: 1, label: 'Beginner', color: 'gray' },
  { value: 2, label: 'Intermediate', color: 'blue' },
  { value: 3, label: 'Advanced', color: 'green' },
  { value: 4, label: 'Expert', color: 'yellow' },
  { value: 5, label: 'Master', color: 'purple' }
];

export function StaffSpecialtiesManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [specialties, setSpecialties] = useState<StaffSpecialty[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<StaffSpecialty | null>(null);
  const [formData, setFormData] = useState({
    staff_id: '',
    specialty_name: '',
    proficiency_level: 3,
    years_experience: 0,
    certification: '',
    certification_date: '',
    certification_expiry: '',
    is_primary: false,
    is_featured: false,
    description: ''
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchSpecialties();
      fetchStaff();
    }
  }, [salonId]);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('staff_specialties')
        .select(`
          *,
          staff (
            id,
            full_name,
            email,
            avatar_url,
            role
          )
        `)
        .eq('salon_id', salonId)
        .order('is_featured', { ascending: false })
        .order('proficiency_level', { ascending: false });

      if (error) throw error;
      setSpecialties(data || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      toast.error('Failed to load staff specialties');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (error) throw error;
      setStaffList(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If setting as primary, unset other primary specialties for this staff member
      if (formData.is_primary && formData.staff_id) {
        await supabase
          .from('staff_specialties')
          .update({ is_primary: false })
          .eq('staff_id', formData.staff_id)
          .eq('salon_id', salonId);
      }

      const specialtyData = {
        salon_id: salonId,
        staff_id: formData.staff_id,
        specialty_name: formData.specialty_name,
        proficiency_level: formData.proficiency_level,
        years_experience: formData.years_experience,
        certification: formData.certification || null,
        certification_date: formData.certification_date || null,
        certification_expiry: formData.certification_expiry || null,
        is_primary: formData.is_primary,
        is_featured: formData.is_featured,
        description: formData.description || null,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      };

      if (editingSpecialty) {
        const { error } = await supabase
          .from('staff_specialties')
          .update(specialtyData)
          .eq('id', editingSpecialty.id);

        if (error) throw error;
        toast.success('Specialty updated successfully');
      } else {
        const { error } = await supabase
          .from('staff_specialties')
          .insert({
            ...specialtyData,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Specialty added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSpecialties();
    } catch (error) {
      console.error('Error saving specialty:', error);
      toast.error('Failed to save specialty');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this specialty?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('staff_specialties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Specialty deleted successfully');
      fetchSpecialties();
    } catch (error) {
      console.error('Error deleting specialty:', error);
      toast.error('Failed to delete specialty');
    }
  };

  const toggleFeatured = async (specialty: StaffSpecialty) => {
    try {
      const { error } = await supabase
        .from('staff_specialties')
        .update({ is_featured: !specialty.is_featured })
        .eq('id', specialty.id);

      if (error) throw error;

      toast.success(`Specialty ${specialty.is_featured ? 'unfeatured' : 'featured'}`);
      fetchSpecialties();
    } catch (error) {
      console.error('Error updating specialty:', error);
      toast.error('Failed to update specialty');
    }
  };

  const openDialog = (specialty?: StaffSpecialty) => {
    if (specialty) {
      setEditingSpecialty(specialty);
      setFormData({
        staff_id: specialty.staff_id,
        specialty_name: specialty.specialty_name,
        proficiency_level: specialty.proficiency_level,
        years_experience: specialty.years_experience,
        certification: specialty.certification || '',
        certification_date: specialty.certification_date || '',
        certification_expiry: specialty.certification_expiry || '',
        is_primary: specialty.is_primary,
        is_featured: specialty.is_featured,
        description: specialty.description || ''
      });
    } else {
      setEditingSpecialty(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      staff_id: '',
      specialty_name: '',
      proficiency_level: 3,
      years_experience: 0,
      certification: '',
      certification_date: '',
      certification_expiry: '',
      is_primary: false,
      is_featured: false,
      description: ''
    });
    setEditingSpecialty(null);
  };

  const getProficiencyLabel = (level: number) => {
    return PROFICIENCY_LEVELS.find(l => l.value === level)?.label || 'Unknown';
  };

  const getProficiencyColor = (level: number) => {
    const proficiency = PROFICIENCY_LEVELS.find(l => l.value === level);
    switch (proficiency?.color) {
      case 'gray': return 'secondary';
      case 'blue': return 'default';
      case 'green': return 'default';
      case 'yellow': return 'default';
      case 'purple': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredSpecialties = specialties.filter(specialty => {
    const matchesSearch = searchTerm === '' || 
      specialty.specialty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.staff?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStaff = filterStaff === 'all' || specialty.staff_id === filterStaff;
    
    return matchesSearch && matchesStaff;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Specialties</CardTitle>
              <CardDescription>
                Manage staff skills, certifications, and specializations
              </CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Specialty
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search specialties or staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterStaff} onValueChange={setFilterStaff}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredSpecialties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No specialties found</p>
              <p className="text-sm mt-2">Add staff specialties to showcase expertise</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Proficiency</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpecialties.map((specialty) => (
                  <TableRow key={specialty.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={specialty.staff?.avatar_url} />
                          <AvatarFallback>
                            {specialty.staff?.full_name ? getInitials(specialty.staff.full_name) : 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {specialty.staff?.full_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {specialty.staff?.role}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {specialty.specialty_name}
                        {specialty.is_primary && (
                          <Badge className="ml-2" variant="default">Primary</Badge>
                        )}
                      </div>
                      {specialty.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {specialty.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={getProficiencyColor(specialty.proficiency_level)}>
                          {getProficiencyLabel(specialty.proficiency_level)}
                        </Badge>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < specialty.proficiency_level
                                  ? 'fill-primary text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {specialty.years_experience} years
                      </div>
                    </TableCell>
                    <TableCell>
                      {specialty.certification ? (
                        <div>
                          <div className="text-sm font-medium">
                            {specialty.certification}
                          </div>
                          {specialty.certification_expiry && (
                            <div className="text-xs text-muted-foreground">
                              Expires: {new Date(specialty.certification_expiry).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {specialty.is_featured && (
                        <Badge variant="default">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeatured(specialty)}
                          title={specialty.is_featured ? 'Unfeature' : 'Feature'}
                        >
                          <Star className={`h-4 w-4 ${specialty.is_featured ? 'fill-primary' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(specialty)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(specialty.id)}
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
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSpecialty ? 'Edit Specialty' : 'Add Staff Specialty'}
            </DialogTitle>
            <DialogDescription>
              {editingSpecialty ? 'Update specialty details' : 'Add a new specialty for a staff member'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staff">Staff Member</Label>
                <Select
                  value={formData.staff_id}
                  onValueChange={(value) => setFormData({ ...formData, staff_id: value })}
                  disabled={!!editingSpecialty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={formData.specialty_name}
                  onValueChange={(value) => setFormData({ ...formData, specialty_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or type specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTY_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="proficiency">Proficiency Level: {getProficiencyLabel(formData.proficiency_level)}</Label>
              <Slider
                id="proficiency"
                min={1}
                max={5}
                step={1}
                value={[formData.proficiency_level]}
                onValueChange={(value) => setFormData({ ...formData, proficiency_level: value[0] })}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                {PROFICIENCY_LEVELS.map((level) => (
                  <span key={level.value}>{level.label}</span>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="certification">Certification (Optional)</Label>
              <Input
                id="certification"
                value={formData.certification}
                onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                placeholder="e.g., Master Colorist Certification"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cert-date">Certification Date</Label>
                <Input
                  id="cert-date"
                  type="date"
                  value={formData.certification_date}
                  onChange={(e) => setFormData({ ...formData, certification_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cert-expiry">Expiry Date</Label>
                <Input
                  id="cert-expiry"
                  type="date"
                  value={formData.certification_expiry}
                  onChange={(e) => setFormData({ ...formData, certification_expiry: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about this specialty..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                />
                <Label htmlFor="primary">Primary Specialty</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSpecialty ? 'Update' : 'Add'} Specialty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}