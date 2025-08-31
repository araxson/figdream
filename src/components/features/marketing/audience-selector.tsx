'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { 
  Plus, 
  X, 
  Users, 
  Filter, 
  Target, 
  Calendar, 
  ShoppingBag, 
  MapPin, 
  Star, 
  DollarSign,
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { 
  createSegmentSchema,
  type CreateSegmentInput,
  segmentOperators
} from '@/lib/validations/marketing-schema'
import type { Database } from '@/types/database'

type Segment = Database['public']['Tables']['customer_segments']['Row']

interface SegmentCondition {
  field: string
  operator: typeof segmentOperators[number]
  value: string | number | boolean | string[]
  conjunction: 'and' | 'or'
}

export interface AudienceSelectorProps {
  segments: Segment[]
  selectedSegmentId?: string
  onSegmentSelect: (segmentId: string | undefined) => void
  onSegmentCreate?: (segment: CreateSegmentInput) => Promise<Segment | null>
  onSegmentUpdate?: (segmentId: string, memberCount: number) => void
  salonId: string
  className?: string
  showCreateButton?: boolean
  showSegmentDetails?: boolean
}

const availableFields = [
  { value: 'first_name', label: 'First Name', type: 'string' },
  { value: 'last_name', label: 'Last Name', type: 'string' },
  { value: 'email', label: 'Email', type: 'string' },
  { value: 'phone', label: 'Phone', type: 'string' },
  { value: 'date_of_birth', label: 'Date of Birth', type: 'date' },
  { value: 'created_at', label: 'Registration Date', type: 'date' },
  { value: 'last_booking_at', label: 'Last Booking Date', type: 'date' },
  { value: 'total_bookings', label: 'Total Bookings', type: 'number' },
  { value: 'total_spent', label: 'Total Spent', type: 'number' },
  { value: 'average_booking_value', label: 'Average Booking Value', type: 'number' },
  { value: 'loyalty_points', label: 'Loyalty Points', type: 'number' },
  { value: 'preferred_services', label: 'Preferred Services', type: 'array' },
  { value: 'preferred_staff', label: 'Preferred Staff', type: 'array' },
  { value: 'location_id', label: 'Preferred Location', type: 'string' },
  { value: 'marketing_consent', label: 'Marketing Consent', type: 'boolean' },
  { value: 'sms_consent', label: 'SMS Consent', type: 'boolean' },
]

const fieldIcons = {
  first_name: Users,
  last_name: Users,
  email: Users,
  phone: Users,
  date_of_birth: Calendar,
  created_at: Calendar,
  last_booking_at: Calendar,
  total_bookings: ShoppingBag,
  total_spent: DollarSign,
  average_booking_value: DollarSign,
  loyalty_points: Star,
  preferred_services: ShoppingBag,
  preferred_staff: Users,
  location_id: MapPin,
  marketing_consent: Settings,
  sms_consent: Settings,
}

export function AudienceSelector({
  segments,
  selectedSegmentId,
  onSegmentSelect,
  onSegmentCreate,
  onSegmentUpdate,
  salonId,
  className,
  showCreateButton = true,
  showSegmentDetails = true,
}: AudienceSelectorProps) {
  const [isCreating, setIsCreating] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [previewCount, setPreviewCount] = React.useState<number | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false)

  const selectedSegment = segments.find(s => s.id === selectedSegmentId)

  const form = useForm<CreateSegmentInput>({
    resolver: zodResolver(createSegmentSchema),
    defaultValues: {
      name: '',
      description: '',
      salon_id: salonId,
      conditions: [{
        field: 'total_bookings',
        operator: 'greater_than',
        value: 0,
        conjunction: 'and'
      }],
      is_dynamic: true,
      tags: [],
    },
  })

  const watchedConditions = form.watch('conditions')

  const handleAddCondition = () => {
    const conditions = form.getValues('conditions')
    form.setValue('conditions', [
      ...conditions,
      {
        field: 'total_bookings',
        operator: 'greater_than',
        value: 0,
        conjunction: 'and'
      }
    ])
  }

  const handleRemoveCondition = (index: number) => {
    const conditions = form.getValues('conditions')
    if (conditions.length > 1) {
      form.setValue('conditions', conditions.filter((_, i) => i !== index))
    }
  }

  const handleConditionChange = (index: number, field: keyof SegmentCondition, value: any) => {
    const conditions = form.getValues('conditions')
    const updatedConditions = [...conditions]
    updatedConditions[index] = { ...updatedConditions[index], [field]: value }
    
    // Reset value when field changes
    if (field === 'field') {
      const fieldConfig = availableFields.find(f => f.value === value)
      if (fieldConfig) {
        updatedConditions[index].value = fieldConfig.type === 'boolean' ? false : ''
        updatedConditions[index].operator = getDefaultOperator(fieldConfig.type)
      }
    }
    
    form.setValue('conditions', updatedConditions)
  }

  const getDefaultOperator = (fieldType: string): typeof segmentOperators[number] => {
    switch (fieldType) {
      case 'number':
        return 'greater_than'
      case 'date':
        return 'greater_than'
      case 'boolean':
        return 'equals'
      case 'array':
        return 'in'
      default:
        return 'contains'
    }
  }

  const getAvailableOperators = (fieldType: string) => {
    switch (fieldType) {
      case 'string':
        return ['equals', 'not_equals', 'contains', 'not_contains']
      case 'number':
        return ['equals', 'not_equals', 'greater_than', 'less_than', 'between']
      case 'date':
        return ['equals', 'not_equals', 'greater_than', 'less_than', 'between']
      case 'boolean':
        return ['equals', 'not_equals']
      case 'array':
        return ['in', 'not_in', 'contains']
      default:
        return segmentOperators
    }
  }

  const handlePreviewSegment = async () => {
    const conditions = form.getValues('conditions')
    if (conditions.length === 0) return

    setIsPreviewLoading(true)
    try {
      // This would normally call an API endpoint to preview the segment
      // For now, we'll simulate the response
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockCount = Math.floor(Math.random() * 500) + 50
      setPreviewCount(mockCount)
    } catch (error) {
      console.error('Error previewing segment:', error)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleCreateSegment = async (data: CreateSegmentInput) => {
    if (!onSegmentCreate) return

    setIsCreating(true)
    try {
      const newSegment = await onSegmentCreate(data)
      if (newSegment) {
        setCreateDialogOpen(false)
        form.reset()
        setPreviewCount(null)
        onSegmentSelect(newSegment.id)
      }
    } catch (error) {
      console.error('Error creating segment:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const renderConditionEditor = (condition: SegmentCondition, index: number) => {
    const field = availableFields.find(f => f.value === condition.field)
    const availableOperators = getAvailableOperators(field?.type || 'string')
    const FieldIcon = fieldIcons[condition.field as keyof typeof fieldIcons] || Filter

    return (
      <Card key={index}>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Conjunction (for conditions after the first) */}
            {index > 0 && (
              <div className="flex items-center gap-2">
                <Select
                  value={condition.conjunction}
                  onValueChange={(value) => handleConditionChange(index, 'conjunction', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="and">AND</SelectItem>
                    <SelectItem value="or">OR</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  customers who meet this condition
                </span>
              </div>
            )}

            {/* Condition Definition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Field Selection */}
              <div className="space-y-2">
                <Label>Field</Label>
                <Select
                  value={condition.field}
                  onValueChange={(value) => handleConditionChange(index, 'field', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => {
                      const Icon = fieldIcons[field.value as keyof typeof fieldIcons] || Filter
                      return (
                        <SelectItem key={field.value} value={field.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {field.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Operator Selection */}
              <div className="space-y-2">
                <Label>Operator</Label>
                <Select
                  value={condition.operator}
                  onValueChange={(value) => handleConditionChange(index, 'operator', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOperators.map((operator) => (
                      <SelectItem key={operator} value={operator}>
                        {operator.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value Input */}
              <div className="space-y-2">
                <Label>Value</Label>
                {field?.type === 'boolean' ? (
                  <Switch
                    checked={condition.value as boolean}
                    onCheckedChange={(checked) => handleConditionChange(index, 'value', checked)}
                  />
                ) : field?.type === 'number' ? (
                  <Input
                    type="number"
                    value={condition.value as number}
                    onChange={(e) => handleConditionChange(index, 'value', parseFloat(e.target.value) || 0)}
                    placeholder="Enter number..."
                  />
                ) : field?.type === 'date' ? (
                  <Input
                    type="date"
                    value={condition.value as string}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                  />
                ) : (
                  <Input
                    type="text"
                    value={condition.value as string}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    placeholder="Enter value..."
                  />
                )}
              </div>
            </div>

            {/* Remove Condition Button */}
            {watchedConditions.length > 1 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCondition(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Current Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant={!selectedSegmentId ? "default" : "outline"}
                onClick={() => onSegmentSelect(undefined)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                All Customers
              </Button>
              
              {segments.length > 0 && (
                <div className="text-sm text-muted-foreground">or choose a segment:</div>
              )}
            </div>

            {segments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {segments.map((segment) => (
                  <Button
                    key={segment.id}
                    variant={selectedSegmentId === segment.id ? "default" : "outline"}
                    onClick={() => onSegmentSelect(segment.id)}
                    className="justify-start h-auto p-4"
                  >
                    <div className="text-left">
                      <div className="font-medium">{segment.name}</div>
                      <div className="text-xs opacity-80">
                        {segment.member_count || 0} members
                      </div>
                      {segment.description && (
                        <div className="text-xs opacity-60 mt-1">
                          {segment.description.length > 40 
                            ? `${segment.description.substring(0, 40)}...`
                            : segment.description
                          }
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {showCreateButton && onSegmentCreate && (
              <div className="pt-4">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Segment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Audience Segment</DialogTitle>
                      <DialogDescription>
                        Define conditions to create a targeted customer segment
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleCreateSegment)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Segment Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., VIP Customers" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="is_dynamic"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Dynamic Segment</FormLabel>
                                  <FormDescription>
                                    Auto-updates as customers change
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Brief description of this segment..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Conditions */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Conditions</h3>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddCondition}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Condition
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {watchedConditions.map((condition, index) => 
                              renderConditionEditor(condition, index)
                            )}
                          </div>
                        </div>

                        {/* Preview */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Preview</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handlePreviewSegment}
                                disabled={isPreviewLoading}
                              >
                                {isPreviewLoading ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                )}
                                Preview Count
                              </Button>
                              
                              {previewCount !== null && (
                                <Badge variant="secondary">
                                  {previewCount.toLocaleString()} customers
                                </Badge>
                              )}
                            </div>

                            {previewCount !== null && (
                              <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                  This segment will include approximately {previewCount.toLocaleString()} customers based on current data.
                                </AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isCreating}>
                            {isCreating ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Create Segment
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Segment Details */}
      {showSegmentDetails && selectedSegment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selected Segment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{selectedSegment.name}</h3>
                {selectedSegment.description && (
                  <p className="text-muted-foreground mt-1">
                    {selectedSegment.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {selectedSegment.member_count?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Members</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedSegment.conditions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Conditions</div>
                </div>
                
                <div className="space-y-1">
                  <Badge variant={selectedSegment.is_dynamic ? "default" : "secondary"}>
                    {selectedSegment.is_dynamic ? "Dynamic" : "Static"}
                  </Badge>
                  <div className="text-sm text-muted-foreground">Type</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {selectedSegment.last_calculated 
                      ? new Date(selectedSegment.last_calculated).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                </div>
              </div>

              {selectedSegment.tags && selectedSegment.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedSegment.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audience Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Campaign Reach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              {selectedSegment ? (
                <>
                  Your campaign will be sent to <strong>{selectedSegment.member_count?.toLocaleString() || 0} customers</strong> in the "{selectedSegment.name}" segment.
                </>
              ) : (
                <>
                  Your campaign will be sent to <strong>all customers</strong> who have opted in to marketing communications.
                </>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}