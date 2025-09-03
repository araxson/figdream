"use client"
import { useState, useEffect } from "react"
import { Package, Plus, X, DollarSign, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Checkbox, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Skeleton } from "@/components/ui"
import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import type { Database } from "@/types/database.types"
type Service = Database["public"]["Tables"]["services"]["Row"]
type ServiceCategory = Database["public"]["Tables"]["service_categories"]["Row"]
interface CategoryServicesProps {
  category: ServiceCategory
  salonId: string
}
export function CategoryServices({ category, salonId }: CategoryServicesProps) {
  const [services, setServices] = useState<Service[]>([])
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()
  useEffect(() => {
    loadServices()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id, salonId])
  const loadServices = async () => {
    try {
      setLoading(true)
      // Load services in this category
      const { data: categoryServices, error: categoryError } = await supabase
        .from("services")
        .select("*")
        .eq("salon_id", salonId)
        .eq("category_id", category.id)
        .order("name")
      if (categoryError) throw categoryError
      // Load all services not in any category
      const { data: unassignedServices, error: unassignedError } = await supabase
        .from("services")
        .select("*")
        .eq("salon_id", salonId)
        .is("category_id", null)
        .order("name")
      if (unassignedError) throw unassignedError
      setServices(categoryServices || [])
      setAvailableServices(unassignedServices || [])
    } catch (error) {
      console.error("Error loading services:", error)
      toast.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }
  const handleAddServices = async () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service")
      return
    }
    try {
      setUpdating(true)
      const { error } = await supabase
        .from("services")
        .update({ category_id: category.id })
        .in("id", selectedServices)
      if (error) throw error
      toast.success(`Added ${selectedServices.length} service(s) to category`)
      setSelectedServices([])
      setAddDialogOpen(false)
      await loadServices()
    } catch (error) {
      console.error("Error adding services:", error)
      toast.error("Failed to add services to category")
    } finally {
      setUpdating(false)
    }
  }
  const handleRemoveService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ category_id: null })
        .eq("id", serviceId)
      if (error) throw error
      toast.success("Service removed from category")
      await loadServices()
    } catch (error) {
      console.error("Error removing service:", error)
      toast.error("Failed to remove service from category")
    }
  }
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}min`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}min`
  }
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services in {category.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
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
              <CardTitle>Services in {category.name}</CardTitle>
              <CardDescription>
                {services.length} service(s) in this category
              </CardDescription>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Services
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No services in this category yet
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Services
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDuration(service.duration)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {service.price.toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveService(service.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Services to {category.name}</DialogTitle>
            <DialogDescription>
              Select services to add to this category
            </DialogDescription>
          </DialogHeader>
          {availableServices.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                No unassigned services available
              </p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedServices([...selectedServices, service.id])
                            } else {
                              setSelectedServices(
                                selectedServices.filter((id) => id !== service.id)
                              )
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell>
                        {formatDuration(service.duration)}
                      </TableCell>
                      <TableCell>${service.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false)
                setSelectedServices([])
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddServices}
              disabled={selectedServices.length === 0 || updating}
            >
              Add {selectedServices.length} Service(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}