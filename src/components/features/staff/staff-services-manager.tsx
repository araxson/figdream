'use client';

import { useState, useEffect } from 'react';
import { Scissors, Plus, Trash2, Search, Users, Star, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

interface StaffService {
  id: string;
  staff_id: string;
  service_id: string;
  salon_id: string;
  is_available: boolean;
  proficiency_level: number; // 1-5
  custom_duration?: number; // Override default service duration
  custom_price?: number; // Override default service price
  experience_years: number;
  certifications?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  staff?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role?: string;
  };
  services?: {
    id: string;
    name: string;
    category: string;
    price: number;
    duration: number;
    description?: string;
  };
}

interface ServiceCategory {
  category: string;
  services: any[];
  staffCount: number;
}

const PROFICIENCY_LEVELS = [
  { value: 1, label: 'Beginner', color: 'gray' },
  { value: 2, label: 'Intermediate', color: 'blue' },
  { value: 3, label: 'Advanced', color: 'green' },
  { value: 4, label: 'Expert', color: 'yellow' },
  { value: 5, label: 'Master', color: 'purple' }
];

export function StaffServicesManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [staffServices, setStaffServices] = useState<StaffService[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'by-staff' | 'by-service'>('by-staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [bulkSettings, setBulkSettings] = useState({
    proficiency_level: 3,
    is_available: true,
    experience_years: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchStaffServices();
      fetchStaff();
      fetchServices();
    }
  }, [salonId]);

  const fetchStaffServices = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('staff_services')
        .select(`
          *,
          staff (
            id,
            full_name,
            email,
            avatar_url,
            role
          ),
          services (
            id,
            name,
            category,
            price,
            duration,
            description
          )
        `)
        .eq('salon_id', salonId)
        .order('staff_id')
        .order('service_id');

      if (error) throw error;
      setStaffServices(data || []);
    } catch (error) {
      console.error('Error fetching staff services:', error);
      toast.error('Failed to load staff services');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name, avatar_url')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setStaffList(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, category, price, duration')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('category')
        .order('name');

      if (error) throw error;
      setServicesList(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedStaffId || selectedServices.length === 0) {
      toast.error('Please select a staff member and at least one service');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check existing assignments
      const { data: existing } = await supabase
        .from('staff_services')
        .select('service_id')
        .eq('salon_id', salonId)
        .eq('staff_id', selectedStaffId)
        .in('service_id', selectedServices);

      const existingServiceIds = existing?.map(e => e.service_id) || [];
      const newServices = selectedServices.filter(id => !existingServiceIds.includes(id));

      if (newServices.length === 0) {
        toast.info('All selected services are already assigned');
        return;
      }

      // Create new assignments
      const assignments = newServices.map(serviceId => ({
        salon_id: salonId,
        staff_id: selectedStaffId,
        service_id: serviceId,
        is_available: bulkSettings.is_available,
        proficiency_level: bulkSettings.proficiency_level,
        experience_years: bulkSettings.experience_years,
        created_at: new Date().toISOString(),
        created_by: user.id
      }));

      const { error } = await supabase
        .from('staff_services')
        .insert(assignments);

      if (error) throw error;

      toast.success(`Assigned ${newServices.length} services to staff member`);
      setIsBulkEditOpen(false);
      resetBulkForm();
      fetchStaffServices();
    } catch (error) {
      console.error('Error assigning services:', error);
      toast.error('Failed to assign services');
    }
  };

  const handleToggleAvailability = async (staffService: StaffService) => {
    try {
      const { error } = await supabase
        .from('staff_services')
        .update({ is_available: !staffService.is_available })
        .eq('id', staffService.id);

      if (error) throw error;

      toast.success('Availability updated');
      fetchStaffServices();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleUpdateProficiency = async (staffService: StaffService, level: number) => {
    try {
      const { error } = await supabase
        .from('staff_services')
        .update({ proficiency_level: level })
        .eq('id', staffService.id);

      if (error) throw error;

      toast.success('Proficiency level updated');
      fetchStaffServices();
    } catch (error) {
      console.error('Error updating proficiency:', error);
      toast.error('Failed to update proficiency');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service assignment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('staff_services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Service assignment removed');
      fetchStaffServices();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  const resetBulkForm = () => {
    setSelectedStaffId('');
    setSelectedServices([]);
    setBulkSettings({
      proficiency_level: 3,
      is_available: true,
      experience_years: 0
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (level: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < level
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  // Group services by staff
  const groupedByStaff = staffList.map(staff => {
    const services = staffServices.filter(ss => ss.staff_id === staff.id);
    return {
      staff,
      services,
      totalServices: services.length,
      availableServices: services.filter(s => s.is_available).length
    };
  });

  // Group services by category
  const serviceCategories: ServiceCategory[] = servicesList.reduce((acc, service) => {
    const existingCategory = acc.find(c => c.category === service.category);
    if (existingCategory) {
      existingCategory.services.push(service);
    } else {
      acc.push({
        category: service.category,
        services: [service],
        staffCount: 0
      });
    }
    return acc;
  }, [] as ServiceCategory[]);

  // Calculate staff count for each service
  serviceCategories.forEach(category => {
    category.services.forEach(service => {
      service.staffCount = staffServices.filter(
        ss => ss.service_id === service.id && ss.is_available
      ).length;
    });
  });

  const filteredStaffGroups = filterStaff === 'all' 
    ? groupedByStaff 
    : groupedByStaff.filter(g => g.staff.id === filterStaff);

  const filteredCategories = filterCategory === 'all'
    ? serviceCategories
    : serviceCategories.filter(c => c.category === filterCategory);

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
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
              <CardTitle>Staff Services</CardTitle>
              <CardDescription>
                Manage which services each staff member can perform
              </CardDescription>
            </div>
            <Button onClick={() => setIsBulkEditOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Assign Services
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'by-staff' | 'by-service')}>
              <TabsList>
                <TabsTrigger value="by-staff">By Staff</TabsTrigger>
                <TabsTrigger value="by-service">By Service</TabsTrigger>
              </TabsList>
            </Tabs>
            {viewMode === 'by-staff' ? (
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
            ) : (
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {[...new Set(servicesList.map(s => s.category))].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {viewMode === 'by-staff' ? (
            <div className="space-y-6">
              {filteredStaffGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No staff members found</p>
                </div>
              ) : (
                filteredStaffGroups.map(({ staff, services, totalServices, availableServices }) => (
                  <Card key={staff.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={staff.avatar_url} />
                            <AvatarFallback>
                              {getInitials(staff.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{staff.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {totalServices} services • {availableServices} available
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStaffId(staff.id);
                            setIsBulkEditOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Services
                        </Button>
                      </div>
                    </CardHeader>
                    {services.length > 0 && (
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Service</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Proficiency</TableHead>
                              <TableHead>Experience</TableHead>
                              <TableHead>Available</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {services.map((staffService) => (
                              <TableRow key={staffService.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {staffService.services?.name}
                                    </div>
                                    {staffService.custom_price && (
                                      <div className="text-sm text-muted-foreground">
                                        Custom: ${staffService.custom_price}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {staffService.services?.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {renderStars(staffService.proficiency_level)}
                                    <Select
                                      value={staffService.proficiency_level.toString()}
                                      onValueChange={(value) => 
                                        handleUpdateProficiency(staffService, parseInt(value))
                                      }
                                    >
                                      <SelectTrigger className="w-[110px] h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {PROFICIENCY_LEVELS.map((level) => (
                                          <SelectItem key={level.value} value={level.value.toString()}>
                                            {level.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {staffService.experience_years} years
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={staffService.is_available}
                                    onCheckedChange={() => handleToggleAvailability(staffService)}
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(staffService.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Scissors className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No services found</p>
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <Card key={category.category}>
                    <CardHeader>
                      <CardTitle className="text-base">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Staff Available</TableHead>
                            <TableHead>Assigned Staff</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.services.map((service) => {
                            const assignedStaff = staffServices
                              .filter(ss => ss.service_id === service.id)
                              .map(ss => ({
                                ...ss.staff,
                                is_available: ss.is_available,
                                proficiency_level: ss.proficiency_level
                              }));
                            
                            return (
                              <TableRow key={service.id}>
                                <TableCell className="font-medium">
                                  {service.name}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {service.price}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {service.duration} min
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={service.staffCount > 0 ? 'default' : 'secondary'}>
                                    {service.staffCount} staff
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex -space-x-2">
                                    {assignedStaff.slice(0, 3).map((staff, index) => (
                                      <Avatar key={staff.id} className="h-6 w-6 border-2 border-background">
                                        <AvatarImage src={staff.avatar_url} />
                                        <AvatarFallback className="text-xs">
                                          {staff.full_name ? getInitials(staff.full_name) : 'S'}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {assignedStaff.length > 3 && (
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
                                        +{assignedStaff.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Assign Dialog */}
      <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Services to Staff</DialogTitle>
            <DialogDescription>
              Select services to assign to a staff member
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="staff">Staff Member</Label>
              <Select
                value={selectedStaffId}
                onValueChange={setSelectedStaffId}
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
              <Label>Select Services</Label>
              <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-4">
                {serviceCategories.map((category) => (
                  <div key={category.category}>
                    <div className="font-medium mb-2">{category.category}</div>
                    <div className="space-y-2 ml-4">
                      {category.services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={service.id}
                            checked={selectedServices.includes(service.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedServices([...selectedServices, service.id]);
                              } else {
                                setSelectedServices(selectedServices.filter(id => id !== service.id));
                              }
                            }}
                          />
                          <Label
                            htmlFor={service.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {service.name} (${service.price}, {service.duration}min)
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="proficiency">Default Proficiency Level</Label>
                <Select
                  value={bulkSettings.proficiency_level.toString()}
                  onValueChange={(value) => setBulkSettings({ 
                    ...bulkSettings, 
                    proficiency_level: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={bulkSettings.experience_years}
                  onChange={(e) => setBulkSettings({ 
                    ...bulkSettings, 
                    experience_years: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={bulkSettings.is_available}
                onCheckedChange={(checked) => setBulkSettings({ 
                  ...bulkSettings, 
                  is_available: checked
                })}
              />
              <Label htmlFor="available">Available for booking</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAssign}>
              Assign {selectedServices.length} Service{selectedServices.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}