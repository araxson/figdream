'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Clock } from 'lucide-react'
import type { AddonsStepProps } from '../wizard-utils/wizard-types'
import { formatPrice } from '../wizard-utils/wizard-helpers'

export function AddonsStep({ state, services, onStateChange }: AddonsStepProps) {
  const toggleAddon = (addon: any) => {
    const isSelected = state.selectedAddons.some(a => a.serviceId === addon.id)

    if (isSelected) {
      onStateChange({
        selectedAddons: state.selectedAddons.filter(a => a.serviceId !== addon.id)
      })
    } else {
      onStateChange({
        selectedAddons: [...state.selectedAddons, {
          serviceId: addon.id!,
          serviceName: addon.name!,
          categoryId: addon.category_id!,
          categoryName: 'Add-ons',
          duration: addon.duration_minutes!,
          price: Number(addon.base_price),
          quantity: 1
        }]
      })
    }
  }

  const addonServices = services.filter(s => s.is_addon)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Add-on Services</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enhance your experience with these optional add-ons
        </p>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {addonServices.map(addon => {
            const isSelected = state.selectedAddons.some(
              a => a.serviceId === addon.id
            )

            return (
              <Card
                key={addon.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => toggleAddon(addon)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isSelected} />
                      <div>
                        <p className="font-medium">{addon.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {addon.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        +{formatPrice(Number(addon.base_price))}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>+{addon.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>

      {state.selectedAddons.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Add-ons are optional. Click next to continue without any add-ons.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}