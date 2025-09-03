'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  // Switch,
} from '@/components/ui'
import { Plus, X, Filter, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
interface SegmentCondition {
  id: string
  field: string
  operator: string
  value: string | number
  conjunction: 'AND' | 'OR'
}
interface RecipientSegmentBuilderProps {
  salonId: string
  customers: Array<Record<string, unknown>>
}
const fieldOptions = [
  { value: 'lifetime_revenue', label: 'Lifetime Revenue' },
  { value: 'lifetime_appointments', label: 'Total Appointments' },
  { value: 'average_ticket_size', label: 'Average Ticket Size' },
  { value: 'days_since_last_visit', label: 'Days Since Last Visit' },
  { value: 'created_at', label: 'Customer Since' },
  { value: 'date_of_birth', label: 'Birthday' },
  { value: 'marketing_opt_in', label: 'Email Opt-in' },
  { value: 'sms_opt_in', label: 'SMS Opt-in' },
  { value: 'preferred_services', label: 'Preferred Services' },
  { value: 'preferred_staff', label: 'Preferred Staff' },
]
const operatorOptions: Record<string, { value: string; label: string }[]> = {
  lifetime_revenue: [
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater than or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less than or equal' },
    { value: 'eq', label: 'Equals' },
  ],
  lifetime_appointments: [
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater than or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less than or equal' },
    { value: 'eq', label: 'Equals' },
  ],
  average_ticket_size: [
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater than or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less than or equal' },
    { value: 'eq', label: 'Equals' },
  ],
  days_since_last_visit: [
    { value: 'gt', label: 'More than' },
    { value: 'lt', label: 'Less than' },
    { value: 'eq', label: 'Exactly' },
    { value: 'between', label: 'Between' },
  ],
  created_at: [
    { value: 'after', label: 'After' },
    { value: 'before', label: 'Before' },
    { value: 'between', label: 'Between' },
  ],
  date_of_birth: [
    { value: 'month_eq', label: 'Birthday month is' },
    { value: 'day_eq', label: 'Birthday day is' },
  ],
  marketing_opt_in: [
    { value: 'eq', label: 'Is' },
  ],
  sms_opt_in: [
    { value: 'eq', label: 'Is' },
  ],
}
export function RecipientSegmentBuilder({ salonId, customers }: RecipientSegmentBuilderProps) {
  const router = useRouter()
  const [segmentName, setSegmentName] = useState('')
  const [conditions, setConditions] = useState<SegmentCondition[]>([
    { id: '1', field: 'lifetime_revenue', operator: 'gt', value: 100, conjunction: 'AND' }
  ])
  const [previewResults, setPreviewResults] = useState<Array<Record<string, unknown>>>([])
  const [isSaving, setIsSaving] = useState(false)
  const addCondition = () => {
    const newCondition: SegmentCondition = {
      id: Date.now().toString(),
      field: 'lifetime_revenue',
      operator: 'gt',
      value: 0,
      conjunction: 'AND'
    }
    setConditions([...conditions, newCondition])
  }
  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id))
  }
  const updateCondition = (id: string, updates: Partial<SegmentCondition>) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ))
  }
  const evaluateCondition = (customer: Record<string, unknown>, condition: SegmentCondition): boolean => {
    const { field, operator, value } = condition
    // Get the field value from customer or analytics
    let fieldValue: unknown
    if (field.startsWith('lifetime_') || field.startsWith('average_') || field === 'days_since_last_visit') {
      fieldValue = customer.customer_analytics?.[field]
    } else {
      fieldValue = customer[field]
    }
    // Handle different operators
    switch (operator) {
      case 'gt':
        return fieldValue > value
      case 'gte':
        return fieldValue >= value
      case 'lt':
        return fieldValue < value
      case 'lte':
        return fieldValue <= value
      case 'eq':
        return fieldValue === value
      case 'after':
        return new Date(fieldValue) > new Date(value as string)
      case 'before':
        return new Date(fieldValue) < new Date(value as string)
      case 'month_eq':
        return fieldValue && new Date(fieldValue).getMonth() === Number(value)
      case 'day_eq':
        return fieldValue && new Date(fieldValue).getDate() === Number(value)
      default:
        return false
    }
  }
  const previewSegment = () => {
    if (conditions.length === 0) {
      setPreviewResults([])
      return
    }
    const results = customers.filter(customer => {
      let result = evaluateCondition(customer, conditions[0])
      for (let i = 1; i < conditions.length; i++) {
        const condition = conditions[i]
        const conditionResult = evaluateCondition(customer, condition)
        if (condition.conjunction === 'AND') {
          result = result && conditionResult
        } else {
          result = result || conditionResult
        }
      }
      return result
    })
    setPreviewResults(results)
    toast.success(`Found ${results.length} customers matching criteria`)
  }
  const saveSegment = async () => {
    if (!segmentName) {
      toast.error('Please enter a segment name')
      return
    }
    setIsSaving(true)
    try {
      const supabase = createClient()
      // Save the segment definition
      const { data: segment, error: segmentError } = await supabase
        .from('customer_segments')
        .insert({
          salon_id: salonId,
          name: segmentName,
          description: `Custom segment with ${conditions.length} conditions`,
          criteria: conditions,
          customer_count: previewResults.length,
        })
        .select()
        .single()
      if (segmentError) throw segmentError
      // Save the segment members
      if (segment && previewResults.length > 0) {
        const members = previewResults.map(customer => ({
          segment_id: segment.id,
          customer_id: customer.id,
        }))
        const { error: membersError } = await supabase
          .from('segment_members')
          .insert(members)
        if (membersError) throw membersError
      }
      toast.success(`Segment "${segmentName}" saved with ${previewResults.length} customers`)
      setSegmentName('')
      setConditions([{ id: '1', field: 'lifetime_revenue', operator: 'gt', value: 100, conjunction: 'AND' }])
      setPreviewResults([])
      router.refresh()
    } catch (_error) {
      toast.error('Failed to save segment')
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Custom Segment Builder</CardTitle>
          <CardDescription>
            Create custom customer segments based on specific criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="segment-name">Segment Name</Label>
            <Input
              id="segment-name"
              placeholder="e.g., High-value frequent visitors"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Conditions</Label>
              <Button variant="outline" size="sm" onClick={addCondition}>
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>
            {conditions.map((condition, index) => (
              <div key={condition.id} className="space-y-3 p-4 border rounded-lg">
                {index > 0 && (
                  <RadioGroup
                    value={condition.conjunction}
                    onValueChange={(value) => updateCondition(condition.id, { conjunction: value as 'AND' | 'OR' })}
                    className="flex gap-4 mb-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="AND" id={`and-${condition.id}`} />
                      <label htmlFor={`and-${condition.id}`}>AND</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="OR" id={`or-${condition.id}`} />
                      <label htmlFor={`or-${condition.id}`}>OR</label>
                    </div>
                  </RadioGroup>
                )}
                <div className="grid gap-3 md:grid-cols-4">
                  <Select
                    value={condition.field}
                    onValueChange={(value) => {
                      updateCondition(condition.id, { 
                        field: value,
                        operator: operatorOptions[value]?.[0]?.value || 'eq'
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorOptions[condition.field]?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {condition.field === 'marketing_opt_in' || condition.field === 'sms_opt_in' ? (
                    <Select
                      value={condition.value.toString()}
                      onValueChange={(value) => updateCondition(condition.id, { value: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : condition.field === 'date_of_birth' && condition.operator === 'month_eq' ? (
                    <Select
                      value={condition.value.toString()}
                      onValueChange={(value) => updateCondition(condition.id, { value: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December']
                          .map((month, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={condition.field.includes('date') ? 'date' : 'number'}
                      value={condition.value}
                      onChange={(e) => updateCondition(condition.id, { 
                        value: e.target.type === 'number' ? Number(e.target.value) : e.target.value 
                      })}
                      placeholder="Value"
                    />
                  )}
                  {conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(condition.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={previewSegment} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Preview Segment
            </Button>
            {previewResults.length > 0 && (
              <Button onClick={saveSegment} disabled={isSaving}>
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Segment
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {previewResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Results</CardTitle>
            <CardDescription>
              {previewResults.length} customers match your criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {previewResults.slice(0, 10).map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{customer.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{customer.profiles?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {customer.customer_analytics?.lifetime_revenue && (
                      <Badge variant="secondary">
                        ${customer.customer_analytics.lifetime_revenue}
                      </Badge>
                    )}
                    {customer.customer_analytics?.lifetime_appointments && (
                      <Badge variant="outline">
                        {customer.customer_analytics.lifetime_appointments} visits
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {previewResults.length > 10 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  And {previewResults.length - 10} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}