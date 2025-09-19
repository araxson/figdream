import { DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OnboardingData } from "./types"

interface CompensationStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

export function CompensationStep({ data, errors, onChange }: CompensationStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compensation Settings</CardTitle>
        <CardDescription>
          Configure payment and commission details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Commission Rate */}
        <div className="space-y-2">
          <Label>Commission Rate: {data.commission_rate}%</Label>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[data.commission_rate]}
            onValueChange={(value) => onChange({ commission_rate: value[0] })}
          />
        </div>

        {/* Hourly Rate */}
        <div className="space-y-2">
          <Label htmlFor="hourly_rate">Hourly Rate</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="hourly_rate"
              type="number"
              min="0"
              step="0.01"
              value={data.hourly_rate}
              onChange={(e) => onChange({ hourly_rate: parseFloat(e.target.value) || 0 })}
              className="pl-9"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select
            value={data.payment_method}
            onValueChange={(value) => onChange({ payment_method: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}