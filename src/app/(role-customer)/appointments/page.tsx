import { createClient } from '@/lib/database/supabase/server';
import { getCustomerByUserId, getCustomerAppointments } from '@/lib/data-access/customers';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  Progress,
  AspectRatio,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  DollarSign, 
  ChevronRight, 
  Star, 
  Phone, 
  Mail, 
  Filter,
  SortDesc,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CustomerAppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/customer');
  }

  const customer = await getCustomerByUserId(user.id);
  
  if (!customer) {
    redirect('/register/customer');
  }

  const appointments = await getCustomerAppointments(customer.id);

  // Categorize appointments
  const now = new Date();
  const upcomingAppointments = appointments?.filter(apt => 
    new Date(apt.appointment_date) >= now && 
    apt.status !== 'cancelled'
  ).sort((a, b) => 
    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
  ) || [];
  
  const pastAppointments = appointments?.filter(apt => 
    new Date(apt.appointment_date) < now || 
    apt.status === 'completed'
  ).sort((a, b) => 
    new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
  ) || [];
  
  const cancelledAppointments = appointments?.filter(apt => 
    apt.status === 'cancelled'
  ).sort((a, b) => 
    new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
  ) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      confirmed: 'default',
      pending: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
      no_show: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const AppointmentCard = ({ appointment }: { appointment: any }) => {
    const appointmentDate = new Date(appointment.appointment_date);
    const now = new Date();
    const isUpcoming = appointmentDate >= now;
    const daysDifference = Math.ceil((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className="group hover:shadow-md transition-all duration-200">
            <CardContent className="p-0">
              <ResizablePanelGroup direction="horizontal" className="rounded-lg overflow-hidden">
                <ResizablePanel defaultSize={25} minSize={20}>
                  <AspectRatio ratio={4/3} className="bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {appointmentDate.getDate()}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          {appointmentDate.toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointmentDate.getFullYear()}
                        </p>
                      </div>
                      {isUpcoming && daysDifference <= 7 && (
                        <Progress 
                          value={Math.max(0, 100 - (daysDifference * 14))} 
                          className="w-full mt-2 h-1" 
                        />
                      )}
                    </div>
                  </AspectRatio>
                </ResizablePanel>
                
                <ResizableHandle />
                
                <ResizablePanel defaultSize={75}>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <p className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors">
                              {appointmentDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Appointment Details</h4>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Date: {appointmentDate.toLocaleDateString()}</p>
                                <p>Time: {appointment.start_time} - {appointment.end_time}</p>
                                {isUpcoming && (
                                  <p className="text-green-600 font-medium">
                                    {daysDifference === 0 ? 'Today' : `In ${daysDifference} days`}
                                  </p>
                                )}
                                {appointment.notes && (
                                  <p className="italic">Notes: {appointment.notes}</p>
                                )}
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        
                        <div className="flex items-center gap-4 mt-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{appointment.start_time} - {appointment.end_time}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Appointment duration: {appointment.duration || '60'} minutes</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {appointment.staff_profiles?.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">
                                {appointment.staff_profiles.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        
                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>Appointment Actions</DrawerTitle>
                              <DrawerDescription>
                                Manage your appointment for {appointmentDate.toLocaleDateString()}
                              </DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 space-y-2">
                              <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`/customer/appointments/${appointment.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </Button>
                              {isUpcoming && appointment.status !== 'cancelled' && (
                                <>
                                  <Button variant="outline" className="w-full justify-start">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Reschedule
                                  </Button>
                                  <Button variant="outline" className="w-full justify-start text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Cancel Appointment
                                  </Button>
                                </>
                              )}
                            </div>
                            <DrawerFooter>
                              <DrawerClose asChild>
                                <Button variant="outline">Close</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    </div>

                    <Collapsible>
                      <div className="space-y-3">
                        {appointment.salons && (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-start gap-2 cursor-pointer hover:bg-muted/50 rounded p-2 -m-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="text-sm flex-1">
                                  <p className="font-medium">{appointment.salons.name}</p>
                                  <p className="text-muted-foreground">
                                    {appointment.salons.address}, {appointment.salons.city}
                                  </p>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">{appointment.salons.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.salons.address}<br/>
                                  {appointment.salons.city}, {appointment.salons.state} {appointment.salons.zip_code}
                                </p>
                                {appointment.salons.phone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3 w-3" />
                                    <span>{appointment.salons.phone}</span>
                                  </div>
                                )}
                                {appointment.salons.email && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3 w-3" />
                                    <span>{appointment.salons.email}</span>
                                  </div>
                                )}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        )}

                        {appointment.staff_profiles && (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-2 -m-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm flex-1">
                                  <span className="font-medium">
                                    {appointment.staff_profiles.display_name || 
                                     appointment.staff_profiles.profiles?.full_name || 
                                     'Not assigned'}
                                  </span>
                                </span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Stylist Details</h4>
                                <p className="text-sm">
                                  {appointment.staff_profiles.display_name || 
                                   appointment.staff_profiles.profiles?.full_name}
                                </p>
                                {appointment.staff_profiles.specialties && (
                                  <p className="text-sm text-muted-foreground">
                                    Specialties: {appointment.staff_profiles.specialties.join(', ')}
                                  </p>
                                )}
                                {appointment.staff_profiles.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium">
                                      {appointment.staff_profiles.rating} ({appointment.staff_profiles.review_count || 0} reviews)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        )}

                        {appointment.appointment_services && appointment.appointment_services.length > 0 && (
                          <CollapsibleTrigger asChild>
                            <div className="cursor-pointer">
                              <p className="text-sm font-medium mb-2 hover:text-blue-600 transition-colors">
                                Services ({appointment.appointment_services.length})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {appointment.appointment_services.slice(0, 2).map((service: any) => (
                                  <Badge key={service.service_id} variant="secondary">
                                    {service.services?.name}
                                    {service.price && ` - $${service.price}`}
                                  </Badge>
                                ))}
                                {appointment.appointment_services.length > 2 && (
                                  <Badge variant="outline">
                                    +{appointment.appointment_services.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                        )}
                        
                        <CollapsibleContent className="space-y-2">
                          {appointment.appointment_services?.slice(2).map((service: any) => (
                            <Badge key={service.service_id} variant="secondary">
                              {service.services?.name}
                              {service.price && ` - $${service.price}`}
                            </Badge>
                          ))}
                        </CollapsibleContent>
                      </div>
                    </Collapsible>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          Total: ${appointment.total_amount || '0.00'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy appointment details</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/customer/appointments/${appointment.id}`}>
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem asChild>
            <Link href={`/customer/appointments/${appointment.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </ContextMenuItem>
          {isUpcoming && appointment.status !== 'cancelled' && (
            <>
              <ContextMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Reschedule
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel
              </ContextMenuItem>
            </>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Copy className="mr-2 h-4 w-4" />
            Copy Details
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/customer">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Appointments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your salon appointments
            </p>
          </div>
          
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter appointments by date, status, or salon</p>
                  </TooltipContent>
                </Tooltip>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SortDesc className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sort by date, price, or salon</p>
                  </TooltipContent>
                </Tooltip>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Button asChild>
                    <Link href="/book">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book New Appointment
                    </Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Button asChild>
                  <Link href="/book">Book Your First Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {pastAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No past appointments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledAppointments.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {cancelledAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No cancelled appointments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </TooltipProvider>
  );
}