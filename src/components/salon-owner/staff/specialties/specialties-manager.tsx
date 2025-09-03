"use client"
import { useState, useEffect } from "react"
import { Plus, X, Award, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Label, Skeleton } from "@/components/ui"
import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import type { Database } from "@/types/database.types"
type StaffSpecialty = Database["public"]["Tables"]["staff_specialties"]["Row"]
type Staff = Database["public"]["Tables"]["staff"]["Row"]
interface SpecialtiesManagerProps {
  salonId: string
}
export function SpecialtiesManager({ salonId }: SpecialtiesManagerProps) {
  const [specialties, setSpecialties] = useState<string[]>([])
  const [staffSpecialties, setStaffSpecialties] = useState<(StaffSpecialty & { staff: Staff })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newSpecialty, setNewSpecialty] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const supabase = createClient()
  useEffect(() => {
    loadSpecialties()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId])
  const loadSpecialties = async () => {
    try {
      setLoading(true)
      // Get all unique specialties for this salon
      const { data: specialtiesData, error: specialtiesError } = await supabase
        .from("staff_specialties")
        .select(`
          specialty,
          staff!inner(
            id,
            first_name,
            last_name,
            salon_id
          )
        `)
        .eq("staff.salon_id", salonId)
      if (specialtiesError) throw specialtiesError
      // Extract unique specialties
      const uniqueSpecialties = Array.from(
        new Set(specialtiesData?.map(s => s.specialty) || [])
      ).sort()
      setSpecialties(uniqueSpecialties)
      setStaffSpecialties((specialtiesData as StaffSpecialty[]) || [])
    } catch (error) {
      toast.error("Failed to load specialties")
    } finally {
      setLoading(false)
    }
  }
  const handleAddSpecialty = async () => {
    if (!newSpecialty.trim()) {
      toast.error("Please enter a specialty name")
      return
    }
    // Check if specialty already exists
    if (specialties.includes(newSpecialty.trim())) {
      toast.error("This specialty already exists")
      return
    }
    // Just add to local state - actual assignment happens per staff member
    setSpecialties([...specialties, newSpecialty.trim()].sort())
    setNewSpecialty("")
    setAddDialogOpen(false)
    toast.success("Specialty added successfully")
  }
  const handleRemoveSpecialty = async (specialty: string) => {
    try {
      // Remove all instances of this specialty from staff
      const staffWithSpecialty = staffSpecialties.filter(s => s.specialty === specialty)
      for (const staffSpec of staffWithSpecialty) {
        const { error } = await supabase
          .from("staff_specialties")
          .delete()
          .eq("staff_id", staffSpec.staff_id)
          .eq("specialty", specialty)
        if (error) throw error
      }
      setSpecialties(specialties.filter(s => s !== specialty))
      setStaffSpecialties(staffSpecialties.filter(s => s.specialty !== specialty))
      toast.success("Specialty removed successfully")
    } catch (error) {
      toast.error("Failed to remove specialty")
    }
  }
  const getStaffCountForSpecialty = (specialty: string) => {
    const uniqueStaff = new Set(
      staffSpecialties
        .filter(s => s.specialty === specialty)
        .map(s => s.staff_id)
    )
    return uniqueStaff.size
  }
  const filteredSpecialties = specialties.filter(specialty =>
    specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Specialties</CardTitle>
          <CardDescription>Loading specialties...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(5)].map((_, i) => (
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
              <CardTitle>Manage Specialties</CardTitle>
              <CardDescription>
                Define and manage staff specialties for your salon
              </CardDescription>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Specialty
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {filteredSpecialties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Award className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No specialties found matching your search"
                  : "No specialties defined yet"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Specialty
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSpecialties.map((specialty) => {
                const staffCount = getStaffCountForSpecialty(specialty)
                return (
                  <div
                    key={specialty}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{specialty}</p>
                        <p className="text-sm text-muted-foreground">
                          {staffCount} staff member{staffCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSpecialty(specialty)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Specialty</DialogTitle>
            <DialogDescription>
              Create a new specialty that can be assigned to staff members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty Name</Label>
              <Input
                id="specialty"
                placeholder="e.g., Color Specialist, Bridal Makeup"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddSpecialty()
                  }
                }}
              />
            </div>
            {specialties.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {specialties.slice(0, 10).map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                  {specialties.length > 10 && (
                    <Badge variant="outline">
                      +{specialties.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false)
                setNewSpecialty("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSpecialty}>
              Add Specialty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}