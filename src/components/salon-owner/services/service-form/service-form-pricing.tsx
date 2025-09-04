import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { DollarSign } from 'lucide-react'
import type { ServiceFormData } from './service-form-schema'

interface PricingTabProps {
  form: UseFormReturn<ServiceFormData>
}

export function PricingTab({ form }: PricingTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Configuration</CardTitle>
        <CardDescription>
          Set pricing and deposit requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Price</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    {...field} 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="requires_deposit"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Require Deposit</FormLabel>
                  <FormDescription>
                    Customers must pay a deposit to book
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

          {form.watch('requires_deposit') && (
            <div className="ml-4 space-y-4 border-l-2 pl-4">
              <FormField
                control={form.control}
                name="deposit_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Percentage</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[field.value || 20]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={5}
                            max={100}
                            step={5}
                            className="flex-1"
                          />
                          <span className="w-12 text-right">{field.value}%</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deposit_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Or Fixed Deposit Amount</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input 
                          {...field} 
                          type="number" 
                          min="0"
                          step="0.01"
                          placeholder="10.00"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Leave at 0 to use percentage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="enable_dynamic_pricing"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Dynamic Pricing</FormLabel>
                  <FormDescription>
                    Adjust prices based on demand
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

          {form.watch('enable_dynamic_pricing') && (
            <div className="ml-4 space-y-4 border-l-2 pl-4">
              <FormField
                control={form.control}
                name="peak_price_multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peak Time Multiplier</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[field.value || 1.5]}
                          onValueChange={(value) => field.onChange(value[0])}
                          min={1}
                          max={3}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{field.value}x</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Price multiplier during peak hours
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="off_peak_discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Off-Peak Discount</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[field.value || 10]}
                          onValueChange={(value) => field.onChange(value[0])}
                          min={0}
                          max={50}
                          step={5}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{field.value}%</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Discount during quiet periods
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}