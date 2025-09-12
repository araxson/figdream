'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Save, Users, Scissors } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Service {
  id: string
  name: string
  category: string
  duration_minutes: number
  price: number
}

interface StaffMember {
  id: string
  user: {
    first_name: string
    last_name: string
  }
  specialties?: string[]
}

interface StaffService {
  staff_id: string
  service_id: string
  proficiency_level?: 'beginner' | 'intermediate' | 'expert'
  custom_price?: number
  custom_duration?: number
}

interface ServiceAssignmentMatrixProps {
  salonId: string
  services: Service[]
  staff: StaffMember[]
  assignments: StaffService[]
}

export function ServiceAssignmentMatrix({
  salonId,
  services,
  staff,
  assignments: initialAssignments
}: ServiceAssignmentMatrixProps) {
  const [assignments, setAssignments] = useState<Map<string, Set<string>>>(new Map())
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [changedStaff, setChangedStaff] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Initialize assignments map
    const assignmentMap = new Map<string, Set<string>>()
    
    staff.forEach(member => {
      const memberServices = new Set<string>()
      initialAssignments
        .filter(a => a.staff_id === member.id)
        .forEach(a => memberServices.add(a.service_id))
      assignmentMap.set(member.id, memberServices)
    })
    
    setAssignments(assignmentMap)
  }, [initialAssignments, staff])

  const handleToggleService = (staffId: string, serviceId: string) => {
    setAssignments(prev => {
      const newMap = new Map(prev)
      const staffServices = newMap.get(staffId) || new Set()
      
      if (staffServices.has(serviceId)) {
        staffServices.delete(serviceId)
      } else {
        staffServices.add(serviceId)
      }
      
      newMap.set(staffId, staffServices)
      return newMap
    })
    
    setChangedStaff(prev => new Set(prev).add(staffId))
  }

  const handleSaveAssignments = async () => {
    if (changedStaff.size === 0) {
      toast({
        title: 'No changes',
        description: 'No assignments have been modified',
      })
      return
    }

    setLoading(true)

    try {
      // Save assignments for each changed staff member
      for (const staffId of changedStaff) {
        const serviceIds = Array.from(assignments.get(staffId) || [])
        
        const response = await fetch('/api/staff/services', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            staff_id: staffId,
            service_ids: serviceIds,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to update services for staff member`)
        }
      }

      toast({
        title: 'Success',
        description: `Updated service assignments for ${changedStaff.size} staff member(s)`,
      })

      setChangedStaff(new Set())
      router.refresh()
    } catch (error) {
      console.error('Error saving assignments:', error)
      toast({
        title: 'Error',
        description: 'Failed to save service assignments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'hair': 'bg-purple-100 text-purple-800',
      'nails': 'bg-pink-100 text-pink-800',
      'facial': 'bg-blue-100 text-blue-800',
      'massage': 'bg-green-100 text-green-800',
      'makeup': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800',
    }
    return colors[category.toLowerCase()] || colors['other']
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Service Assignment Matrix</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button
            onClick={handleSaveAssignments}
            disabled={loading || changedStaff.size === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
            {changedStaff.size > 0 && ` (${changedStaff.size})`}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableCaption>
            Assign services to staff members by checking the appropriate boxes
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background">Service</TableHead>
              <TableHead className="w-[100px]">Category</TableHead>
              <TableHead className="w-[80px]">Duration</TableHead>
              <TableHead className="w-[80px]">Price</TableHead>
              {staff.map(member => (
                <TableHead key={member.id} className="text-center min-w-[120px]">
                  <div className="space-y-1">
                    <div>{member.user.first_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {member.user.last_name}
                    </div>
                    {changedStaff.has(member.id) && (
                      <Badge variant="outline" className="text-xs">
                        Modified
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map(service => (
              <TableRow key={service.id}>
                <TableCell className="font-medium sticky left-0 bg-background">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    {service.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(service.category)} variant="secondary">
                    {service.category}
                  </Badge>
                </TableCell>
                <TableCell>{service.duration_minutes} min</TableCell>
                <TableCell>${service.price}</TableCell>
                {staff.map(member => {
                  const isAssigned = assignments.get(member.id)?.has(service.id) || false
                  
                  return (
                    <TableCell key={`${member.id}-${service.id}`} className="text-center">
                      <Checkbox
                        checked={isAssigned}
                        onCheckedChange={() => handleToggleService(member.id, service.id)}
                        aria-label={`Assign ${service.name} to ${member.user.first_name} ${member.user.last_name}`}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>• Check boxes to assign services to staff members</p>
        <p>• Changes are highlighted and saved when you click "Save Changes"</p>
        <p>• Staff can only perform services they are assigned to</p>
      </div>
    </div>
  )
}