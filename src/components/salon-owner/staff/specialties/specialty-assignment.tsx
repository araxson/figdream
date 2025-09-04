"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus, X, Award, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import type { Database } from "@/types/database.types"
type Staff = Database["public"]["Tables"]["staff"]["Row"]
// type StaffSpecialty = Database["public"]["Tables"]["staff_specialties"]["Row"]
interface SpecialtyAssignmentProps {
  staff: Staff
  onUpdate?: () => void
}
export function SpecialtyAssignment({ staff, onUpdate }: SpecialtyAssignmentProps) {
  const [specialties, setSpecialties] = useState<string[]>([])
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const loadSpecialties = useCallback(async () => {
    try {
      setLoading(true)
      // Get staff's current specialties
      const { data: staffSpecialties, error: staffError } = await supabase
        .from("staff_specialties")
        .select("specialty")
        .eq("staff_id", staff.id)
      if (staffError) throw staffError
      const currentSpecialties = staffSpecialties?.map(s => s.specialty) || []
      setSpecialties(currentSpecialties)
      // Get all unique specialties from the salon
      const { data: allSpecialties, error: allError } = await supabase
        .from("staff_specialties")
        .select(`
          specialty,
          staff!inner(salon_id)
        `)
        .eq("staff.salon_id", staff.salon_id)
      if (allError) throw allError
      const uniqueSpecialties = Array.from(
        new Set(allSpecialties?.map(s => s.specialty) || [])
      ).filter(s => !currentSpecialties.includes(s))
      setAvailableSpecialties(uniqueSpecialties.sort())
    } catch (_error) {
      toast.error("Failed to load specialties")
    } finally {
      setLoading(false)
    }
  }, [staff.id, staff.salon_id, supabase])

  useEffect(() => {
    loadSpecialties()
  }, [loadSpecialties])
  const handleAddSpecialty = async () => {
    if (!selectedSpecialty) {
      toast.error("Please select a specialty")
      return
    }
    try {
      setSaving(true)
      const { error } = await supabase
        .from("staff_specialties")
        .insert({
          staff_id: staff.id,
          specialty: selectedSpecialty,
        })
      if (error) throw error
      setSpecialties([...specialties, selectedSpecialty])
      setAvailableSpecialties(availableSpecialties.filter(s => s !== selectedSpecialty))
      setSelectedSpecialty("")
      setAddDialogOpen(false)
      toast.success("Specialty added successfully")
      onUpdate?.()
    } catch (_error) {
      toast.error("Failed to add specialty")
    } finally {
      setSaving(false)
    }
  }
  const handleRemoveSpecialty = async (specialty: string) => {
    try {
      const { error } = await supabase
        .from("staff_specialties")
        .delete()
        .eq("staff_id", staff.id)
        .eq("specialty", specialty)
      if (error) throw error
      setSpecialties(specialties.filter(s => s !== specialty))
      setAvailableSpecialties([...availableSpecialties, specialty].sort())
      toast.success("Specialty removed successfully")
      onUpdate?.()
    } catch (_error) {
      toast.error("Failed to remove specialty")
    }
  }
  const getInitials = () => {
    return `${staff.first_name?.[0] || ""}${staff.last_name?.[0] || ""}`.toUpperCase()
  }
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Specialties</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={staff.avatar_url || undefined} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {staff.first_name} {staff.last_name}
                </CardTitle>
                <CardDescription>
                  {specialties.length} specialt{specialties.length !== 1 ? "ies" : "y"}
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              disabled={availableSpecialties.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {specialties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Award className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                No specialties assigned
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddDialogOpen(true)}
              >
                Add First Specialty
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <Badge
                  key={specialty}
                  variant="secondary"
                  className="pl-2 pr-1 py-1"
                >
                  <Award className="mr-1 h-3 w-3" />
                  {specialty}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveSpecialty(specialty)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Specialty</DialogTitle>
            <DialogDescription>
              Assign a specialty to {staff.first_name} {staff.last_name}
            </DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput 
              placeholder="Search specialties..." 
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            />
            <CommandEmpty>
              No specialties found. You can create a new one.
            </CommandEmpty>
            <CommandGroup>
              {availableSpecialties.map((specialty) => (
                <CommandItem
                  key={specialty}
                  value={specialty}
                  onSelect={() => setSelectedSpecialty(specialty)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedSpecialty === specialty ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {specialty}
                </CommandItem>
              ))}
              {selectedSpecialty && 
               !availableSpecialties.includes(selectedSpecialty) && 
               !specialties.includes(selectedSpecialty) && (
                <CommandItem
                  value={selectedSpecialty}
                  onSelect={() => setSelectedSpecialty(selectedSpecialty)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create &quot;{selectedSpecialty}&quot;
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false)
                setSelectedSpecialty("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSpecialty}
              disabled={!selectedSpecialty || saving}
            >
              Add Specialty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}