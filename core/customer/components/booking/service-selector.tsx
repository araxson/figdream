"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Clock, DollarSign } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Service, CategoryWithServices } from "@/core/services/dal/services-types";

interface ServiceSelectorProps {
  categories: CategoryWithServices[];
  selectedServices: string[];
  onServiceToggle: (serviceId: string) => void;
  multiSelect?: boolean;
  showPricing?: boolean;
  showDuration?: boolean;
}

export function ServiceSelector({
  categories,
  selectedServices,
  onServiceToggle,
  multiSelect = false,
  showPricing = true,
  showDuration = true,
}: ServiceSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((c) => c.id),
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ""}`;
    }
    return `${mins}min`;
  };

  const totalDuration = selectedServices.reduce((total, serviceId) => {
    const service = categories
      .flatMap((c) => c.services || [])
      .find((s) => s?.id === serviceId);
    return total + (service?.duration_minutes || 0);
  }, 0);

  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = categories
      .flatMap((c) => c.services || [])
      .find((s) => s?.id === serviceId);
    return total + (service?.current_price || service?.base_price || 0);
  }, 0);

  const ServiceItem = ({ service }: { service: Service }) => {
    const isSelected = selectedServices.includes(service.id);

    return (
      <Card
        className={`cursor-pointer transition-colors ${
          isSelected ? "border-primary bg-accent" : "hover:border-primary/50"
        }`}
        onClick={() => onServiceToggle(service.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {multiSelect ? (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onServiceToggle(service.id)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <RadioGroupItem
                value={service.id}
                checked={isSelected}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium cursor-pointer">
                      {service.name}
                    </Label>
                    {service.is_featured && (
                      <Badge variant="secondary" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                {showDuration && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(service.duration_minutes)}</span>
                  </div>
                )}
                {showPricing && (
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-3 w-3" />
                    <span>${service.current_price || service.base_price}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Accordion
        type="multiple"
        value={expandedCategories}
        onValueChange={setExpandedCategories}
      >
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-2">
                <span className="font-medium">{category.name}</span>
                <Badge variant="outline" className="ml-2">
                  {category.services?.length || 0} services
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {multiSelect ? (
                <div className="space-y-2 pt-2">
                  {category.services?.map((service) => (
                    <ServiceItem key={service.id} service={service} />
                  )) || []}
                </div>
              ) : (
                <RadioGroup
                  value={selectedServices[0] || ""}
                  onValueChange={(value) => onServiceToggle(value)}
                >
                  <div className="space-y-2 pt-2">
                    {category.services?.map((service) => (
                      <ServiceItem key={service.id} service={service} />
                    )) || []}
                  </div>
                </RadioGroup>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Summary */}
      {selectedServices.length > 0 && (
        <Card className="bg-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Selected Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Services:</span>
                <span className="font-medium">{selectedServices.length}</span>
              </div>
              {showDuration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Duration:</span>
                  <span className="font-medium">
                    {formatDuration(totalDuration)}
                  </span>
                </div>
              )}
              {showPricing && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-lg font-bold">${totalPrice}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
