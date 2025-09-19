import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, DollarSign, Heart } from "lucide-react";

interface SalonCardProps {
  salon: {
    id: string;
    name: string;
    image?: string;
    address: string;
    rating: number;
    reviewCount: number;
    priceRange: "$" | "$$" | "$$$" | "$$$$";
    openNow?: boolean;
    distance?: number;
    specialties?: string[];
    isFavorite?: boolean;
  };
  onViewDetails?: (id: string) => void;
  onBook?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export function SalonCard({
  salon,
  onViewDetails,
  onBook,
  onToggleFavorite,
}: SalonCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative bg-muted">
        {salon.image ? (
          <img
            src={salon.image}
            alt={salon.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {salon.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Favorite button */}
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur"
            onClick={() => onToggleFavorite(salon.id)}
          >
            <Heart
              className={`h-4 w-4 ${
                salon.isFavorite ? "fill-destructive text-destructive" : ""
              }`}
            />
          </Button>
        )}

        {/* Open status */}
        {salon.openNow !== undefined && (
          <Badge
            variant={salon.openNow ? "default" : "secondary"}
            className="absolute top-2 left-2"
          >
            {salon.openNow ? "Open" : "Closed"}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{salon.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span>{salon.address}</span>
              {salon.distance && (
                <span className="text-xs">• {salon.distance} mi</span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Rating and reviews */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-medium">{salon.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({salon.reviewCount} reviews)
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{salon.priceRange}</span>
          </div>
        </div>

        {/* Specialties */}
        {salon.specialties && salon.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {salon.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {salon.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{salon.specialties.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {onViewDetails && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(salon.id)}
          >
            View Details
          </Button>
        )}
        {onBook && (
          <Button className="flex-1" onClick={() => onBook(salon.id)}>
            Book Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
