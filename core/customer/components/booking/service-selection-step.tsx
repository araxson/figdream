'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, Plus, Minus } from 'lucide-react'
import type { ServiceStepProps } from '../wizard-utils/wizard-types'
import { formatPrice } from '../wizard-utils/wizard-helpers'

export function ServiceSelectionStep({
  state,
  categories,
  services,
  serviceQuantities,
  onToggleService,
  onUpdateQuantity
}: ServiceStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Select Services</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the services you'd like to book
        </p>
      </div>

      <Tabs defaultValue={categories[0]?.id} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {categories.slice(0, 3).map(category => (
            <TabsTrigger key={category.id} value={category.id!}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id!}>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {services
                  .filter(s => s.category_id === category.id)
                  .map(service => {
                    const isSelected = state.selectedServices.some(
                      s => s.serviceId === service.id
                    )
                    const quantity = serviceQuantities.get(service.id!) || 1

                    return (
                      <Card
                        key={service.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => onToggleService(service, category)}
                                />
                                <Label
                                  htmlFor={service.id}
                                  className="cursor-pointer"
                                >
                                  <div>
                                    <p className="font-medium">{service.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {service.description}
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold">
                                {formatPrice(Number(service.base_price))}
                              </p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{service.duration_minutes} min</span>
                              </div>
                              {isSelected && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onUpdateQuantity(service.id!, quantity - 1)
                                    }}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">{quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onUpdateQuantity(service.id!, quantity + 1)
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}