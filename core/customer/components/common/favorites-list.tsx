"use client";

import { Heart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FavoriteWithDetails } from "../dal/favorites-types";

interface FavoritesListProps {
  favorites: FavoriteWithDetails[];
  onToggle?: (favorite: FavoriteWithDetails) => void;
}

export function FavoritesList({ favorites, onToggle }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
        <p className="text-muted-foreground">
          Start adding your favorite salons, staff, and services
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {favorites.map((favorite) => (
        <Card key={favorite.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  {favorite.salon?.name ||
                    favorite.staff?.title ||
                    favorite.service?.name ||
                    "Unnamed"}
                </CardTitle>
                <CardDescription className="mt-1">
                  {favorite.salon && <Badge variant="outline">Salon</Badge>}
                  {favorite.staff && <Badge variant="outline">Staff</Badge>}
                  {favorite.service && <Badge variant="outline">Service</Badge>}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggle?.(favorite)}
              >
                <Heart className="w-4 h-4 fill-destructive text-destructive" />
              </Button>
            </div>
          </CardHeader>
          {favorite.notes && (
            <CardContent>
              <p className="text-sm text-muted-foreground">{favorite.notes}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
