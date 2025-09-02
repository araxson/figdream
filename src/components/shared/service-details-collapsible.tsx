'use client'

import * as React from 'react'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Badge,
  Card,
  CardContent,
} from '@/components/ui'
import { ChevronDown, Clock, DollarSign, Users, Info } from 'lucide-react'

interface ServiceDetails {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  category?: string
  staffCount?: number
  requirements?: string[]
  benefits?: string[]
}

interface ServiceDetailsCollapsibleProps {
  service: ServiceDetails
  defaultOpen?: boolean
  className?: string
}

export function ServiceDetailsCollapsible({
  service,
  defaultOpen = false,
  className
}: ServiceDetailsCollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4">
            <div className="flex items-center gap-4 text-left">
              <div>
                <h3 className="font-semibold">{service.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {service.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    ${service.price}
                  </span>
                  {service.staffCount && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {service.staffCount} staff
                    </span>
                  )}
                </div>
              </div>
              {service.category && (
                <Badge variant="secondary">{service.category}</Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            {service.description && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Description
                </h4>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
            )}
            
            {service.requirements && service.requirements.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Requirements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {service.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {service.benefits && service.benefits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Benefits</h4>
                <ul className="list-disc list-inside space-y-1">
                  {service.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}