"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Star, Clock } from "lucide-react";
import type { SalonWithRelations } from "../types";

interface SalonsMapProps {
  salons: SalonWithRelations[];
}

export function SalonsMap({ salons }: SalonsMapProps) {
  // In a real app, you would integrate with a map provider like Google Maps or Mapbox
  // For now, we'll show a list of locations

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="p-4 space-y-3">
            {salons.map((salon) => (
              <Card key={salon.id} className="cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{salon.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {typeof salon.address === 'object' && salon.address
                          ? `${salon.address.city || ''}, ${salon.address.state || ''}`
                          : typeof salon.address === 'string'
                          ? salon.address
                          : "No address"}
                      </div>
                      <div className="flex items-center gap-2">
                        {salon.is_accepting_bookings && (
                          <Badge variant="default" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Open
                          </Badge>
                        )}
                        {salon.rating_average && salon.rating_average > 0 && (
                          <div className="flex items-center text-xs">
                            <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                            {salon.rating_average.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                    {salon.is_featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
