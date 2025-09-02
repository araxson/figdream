'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  CardContent,
  Badge,
  RadioGroup,
  RadioGroupItem,
  Label,
  Checkbox,
} from '@/components/ui'
import { Clock, Users, TrendingUp, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'

interface BreakPattern {
  id: string
  name: string
  description: string
  breaks: {
    time: string
    duration: number
    type: 'lunch' | 'rest' | 'other'
  }[]
}

const breakPatterns: BreakPattern[] = [
  {
    id: 'standard',
    name: 'Standard Pattern',
    description: 'One lunch break and two rest breaks',
    breaks: [
      { time: '10:30', duration: 15, type: 'rest' },
      { time: '13:00', duration: 60, type: 'lunch' },
      { time: '15:30', duration: 15, type: 'rest' }
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal Pattern',
    description: 'Just a lunch break',
    breaks: [
      { time: '13:00', duration: 30, type: 'lunch' }
    ]
  },
  {
    id: 'extended',
    name: 'Extended Pattern',
    description: 'Longer lunch with morning and afternoon breaks',
    breaks: [
      { time: '10:00', duration: 20, type: 'rest' },
      { time: '12:30', duration: 90, type: 'lunch' },
      { time: '16:00', duration: 20, type: 'rest' }
    ]
  },
  {
    id: 'flexible',
    name: 'Flexible Pattern',
    description: 'Multiple short breaks throughout the day',
    breaks: [
      { time: '10:00', duration: 10, type: 'rest' },
      { time: '12:00', duration: 30, type: 'lunch' },
      { time: '14:00', duration: 10, type: 'rest' },
      { time: '16:00', duration: 10, type: 'rest' }
    ]
  }
]

interface BreakPatternsProps {
  staffMembers: any[]
  salonId: string
}

export function BreakPatterns({ staffMembers, salonId }: BreakPatternsProps) {
  const router = useRouter()
  const [selectedPattern, setSelectedPattern] = useState('standard')
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set())
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]))
  const [isApplying, setIsApplying] = useState(false)

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaff(prev => {
      const newSet = new Set(prev)
      if (newSet.has(staffId)) {
        newSet.delete(staffId)
      } else {
        newSet.add(staffId)
      }
      return newSet
    })
  }

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev => {
      const newSet = new Set(prev)
      if (newSet.has(day)) {
        newSet.delete(day)
      } else {
        newSet.add(day)
      }
      return newSet
    })
  }

  const handleApplyPattern = async () => {
    if (selectedStaff.size === 0) {
      toast.error('Please select at least one staff member')
      return
    }
    
    if (selectedDays.size === 0) {
      toast.error('Please select at least one day')
      return
    }

    setIsApplying(true)
    
    try {
      const supabase = createClient()
      const pattern = breakPatterns.find(p => p.id === selectedPattern)
      
      if (!pattern) {
        throw new Error('Invalid pattern selected')
      }

      // Create breaks for each selected staff member and day
      const breaksToInsert: any[] = []
      
      selectedStaff.forEach(staffId => {
        selectedDays.forEach(day => {
          pattern.breaks.forEach(brk => {
            const [hours, minutes] = brk.time.split(':').map(Number)
            const endTime = new Date()
            endTime.setHours(hours, minutes + brk.duration, 0, 0)
            
            breaksToInsert.push({
              staff_id: staffId,
              day_of_week: day,
              start_time: brk.time,
              end_time: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
              duration_minutes: brk.duration,
              break_type: brk.type,
              is_recurring: true,
              is_active: true
            })
          })
        })
      })

      // Insert all breaks
      const { error } = await supabase
        .from('staff_breaks')
        .insert(breaksToInsert)
      
      if (error) throw error
      
      toast.success(`Pattern applied to ${selectedStaff.size} staff members`)
      setSelectedStaff(new Set())
      router.refresh()
    } catch (error) {
      console.error('Error applying pattern:', error)
      toast.error('Failed to apply break pattern')
    } finally {
      setIsApplying(false)
    }
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Pattern Selection */}
      <div>
        <h3 className="font-medium mb-3">Select Pattern</h3>
        <RadioGroup value={selectedPattern} onValueChange={setSelectedPattern}>
          <div className="grid gap-3">
            {breakPatterns.map((pattern) => (
              <Card key={pattern.id} className="cursor-pointer">
                <CardContent className="p-4">
                  <label
                    htmlFor={pattern.id}
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <RadioGroupItem value={pattern.id} id={pattern.id} />
                    <div className="flex-1">
                      <p className="font-medium">{pattern.name}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pattern.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pattern.breaks.map((brk, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {brk.time} ({brk.duration}min)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </label>
                </CardContent>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Day Selection */}
      <div>
        <h3 className="font-medium mb-3">Apply to Days</h3>
        <div className="flex gap-2">
          {dayNames.map((day, index) => (
            <Button
              key={index}
              variant={selectedDays.has(index) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDayToggle(index)}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      {/* Staff Selection */}
      <div>
        <h3 className="font-medium mb-3">Select Staff Members</h3>
        <div className="space-y-2">
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStaff(new Set(staffMembers.map(s => s.id)))}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStaff(new Set())}
            >
              Deselect All
            </Button>
          </div>
          
          <div className="grid gap-2">
            {staffMembers.map((staff) => (
              <Card key={staff.id}>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`staff-${staff.id}`}
                      checked={selectedStaff.has(staff.id)}
                      onCheckedChange={() => handleStaffToggle(staff.id)}
                    />
                    <label
                      htmlFor={`staff-${staff.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="font-medium">
                        {staff.profiles.full_name || 'Staff Member'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Currently has {staff.staff_breaks.length} breaks configured
                      </p>
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="font-medium">Ready to Apply</p>
          <p className="text-sm text-muted-foreground">
            {selectedStaff.size} staff × {selectedDays.size} days = {selectedStaff.size * selectedDays.size * breakPatterns.find(p => p.id === selectedPattern)?.breaks.length || 0} breaks
          </p>
        </div>
        <Button
          onClick={handleApplyPattern}
          disabled={isApplying || selectedStaff.size === 0 || selectedDays.size === 0}
        >
          {isApplying ? 'Applying...' : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Apply Pattern
            </>
          )}
        </Button>
      </div>
    </div>
  )
}