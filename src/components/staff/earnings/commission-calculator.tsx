"use client"
import { useState } from "react"
import { Calculator, DollarSign, TrendingUp } from "lucide-react"
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Slider,
  Badge,
  Separator
} from "@/components/ui"

interface CommissionCalculatorProps {
  defaultCommissionRate?: number
  defaultTipPercentage?: number
}
export function CommissionCalculator({
  defaultCommissionRate = 40,
  defaultTipPercentage = 20,
}: CommissionCalculatorProps) {
  const [servicePrice, setServicePrice] = useState(100)
  const [commissionRate, setCommissionRate] = useState(defaultCommissionRate)
  const [tipPercentage, setTipPercentage] = useState(defaultTipPercentage)
  const [numberOfServices, setNumberOfServices] = useState(1)
  // Calculate earnings
  const baseAmount = servicePrice * numberOfServices
  const commissionAmount = (baseAmount * commissionRate) / 100
  const tipAmount = (baseAmount * tipPercentage) / 100
  const totalEarnings = commissionAmount + tipAmount
  // Calculate projections
  const dailyEarnings = totalEarnings
  const weeklyEarnings = dailyEarnings * 5 // Assuming 5 working days
  const monthlyEarnings = weeklyEarnings * 4 // Assuming 4 weeks
  const yearlyEarnings = monthlyEarnings * 12
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Commission Calculator</CardTitle>
              <CardDescription>
                Calculate your potential earnings from services
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="service-price">Service Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="service-price"
                  type="number"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(Number(e.target.value))}
                  className="pl-9"
                  min={0}
                  step={10}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="num-services">Number of Services</Label>
              <Input
                id="num-services"
                type="number"
                value={numberOfServices}
                onChange={(e) => setNumberOfServices(Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="commission-rate">Commission Rate</Label>
                <Badge variant="secondary">{commissionRate}%</Badge>
              </div>
              <Slider
                id="commission-rate"
                value={[commissionRate]}
                onValueChange={([value]) => setCommissionRate(value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tip-percentage">Expected Tip</Label>
                <Badge variant="secondary">{tipPercentage}%</Badge>
              </div>
              <Slider
                id="tip-percentage"
                value={[tipPercentage]}
                onValueChange={([value]) => setTipPercentage(value)}
                min={0}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium">Earnings Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Service Total</span>
                <span>{formatCurrency(baseAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Commission ({commissionRate}%)
                </span>
                <span className="font-medium">
                  {formatCurrency(commissionAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Tips ({tipPercentage}%)
                </span>
                <span className="font-medium">
                  {formatCurrency(tipAmount)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Earnings</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(totalEarnings)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Earnings Projections</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Per Service</p>
              <p className="text-2xl font-bold">{formatCurrency(dailyEarnings)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Weekly (5 days)</p>
              <p className="text-2xl font-bold">{formatCurrency(weeklyEarnings)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly</p>
              <p className="text-2xl font-bold">{formatCurrency(monthlyEarnings)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Yearly</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(yearlyEarnings)}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Note:</span> These projections are estimates based on 
              {" "}{numberOfServices} service(s) per day, 5 working days per week, and 4 weeks per month. 
              Actual earnings may vary.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
