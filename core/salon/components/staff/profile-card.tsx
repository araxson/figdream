'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Calendar, Clock, Award, Languages, MapPin, Phone, Mail, Edit, Trash2, Eye } from 'lucide-react';
import type { StaffProfileWithDetails } from '../types';

interface StaffProfileCardProps {
  staff: StaffProfileWithDetails;
  onEdit?: (staff: StaffProfileWithDetails) => void;
  onDelete?: (id: string) => void;
  onView?: (staff: StaffProfileWithDetails) => void;
  showActions?: boolean;
}

export function StaffProfileCard({ staff, onEdit, onDelete, onView, showActions = true }: StaffProfileCardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'on_break':
        return 'secondary';
      case 'off_duty':
        return 'outline';
      case 'on_vacation':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getEmploymentTypeBadge = (type: string) => {
    switch (type) {
      case 'full_time':
        return 'Full-Time';
      case 'part_time':
        return 'Part-Time';
      case 'contract':
        return 'Contract';
      case 'freelance':
        return 'Freelance';
      default:
        return type;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={staff.profile_image_url || staff.user?.avatar_url} alt={staff.user?.full_name} />
              <AvatarFallback>{staff.user?.full_name?.charAt(0) || 'S'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{staff.user?.full_name || 'Staff Member'}</CardTitle>
              <CardDescription>{staff.title}</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusColor(staff.status)}>{staff.status}</Badge>
                <Badge variant="outline">{getEmploymentTypeBadge(staff.employment_type)}</Badge>
                {staff.is_featured && <Badge variant="default">Featured</Badge>}
                {staff.is_bookable && <Badge variant="secondary">Bookable</Badge>}
              </div>
            </div>
          </div>
          {showActions && (
            <div className="flex gap-2">
              {onView && (
                <Button variant="ghost" size="icon" onClick={() => onView(staff)}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(staff)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={() => onDelete(staff.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Experience</span>
                <span className="font-medium">{staff.experience_years} years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Commission Rate</span>
                <span className="font-medium">{staff.commission_rate}%</span>
              </div>
              {staff.hourly_rate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hourly Rate</span>
                  <span className="font-medium">${staff.hourly_rate}/hr</span>
                </div>
              )}
            </div>

            {staff.specializations && staff.specializations.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {staff.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>
            )}

            {staff.languages && staff.languages.length > 0 && (
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{staff.languages.join(', ')}</span>
              </div>
            )}

            {staff.bio && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bio</p>
                <p className="text-sm">{staff.bio}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{staff.rating_average?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-muted-foreground">({staff.rating_count} reviews)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Appointments</span>
                <span className="font-medium">{staff.total_appointments || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue Generated</span>
                <span className="font-medium">${staff.total_revenue || 0}</span>
              </div>
            </div>

            {staff.performance && (
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Utilization Rate</span>
                    <span className="text-sm font-medium">{staff.performance.utilization_rate}%</span>
                  </div>
                  <Progress value={staff.performance.utilization_rate} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Customer Retention</span>
                    <span className="text-sm font-medium">{staff.performance.customer_retention_rate}%</span>
                  </div>
                  <Progress value={staff.performance.customer_retention_rate} />
                </div>
              </div>
            )}

            {staff.certifications && staff.certifications.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                <div className="space-y-1">
                  {(staff.certifications as any[]).map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Award className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{cert.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            {staff.schedules && staff.schedules.length > 0 ? (
              <div className="space-y-2">
                {staff.schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm capitalize">{schedule.day_of_week}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>{schedule.start_time} - {schedule.end_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No schedule set</p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Hired: {new Date(staff.hired_at).toLocaleDateString()}</span>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="space-y-3">
              {staff.user?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{staff.user.email}</span>
                </div>
              )}
              {staff.user?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{staff.user.phone}</span>
                </div>
              )}
            </div>

            {staff.settings?.emergency_contact && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2">Emergency Contact</p>
                <div className="space-y-1 text-sm">
                  <p>Name: {(staff.settings.emergency_contact as any).name}</p>
                  <p>Phone: {(staff.settings.emergency_contact as any).phone}</p>
                  <p>Relationship: {(staff.settings.emergency_contact as any).relationship}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {staff.upcoming_time_off && staff.upcoming_time_off.length > 0 && (
            <Badge variant="outline">
              Time off: {staff.upcoming_time_off[0].start_date} - {staff.upcoming_time_off[0].end_date}
            </Badge>
          )}
        </div>
        {onView && (
          <Button variant="outline" size="sm" onClick={() => onView(staff)}>
            View Full Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}