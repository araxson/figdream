"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers } from "lucide-react";
import type { ServiceCategory } from "../types";

interface CategoriesSidebarProps {
  categories: ServiceCategory[];
  onCategorySelect?: (categoryId: string | null) => void;
}

export function CategoriesSidebar({
  categories,
  onCategorySelect,
}: CategoriesSidebarProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    onCategorySelect?.(categoryId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-1">
            <Button
              variant={selectedCategoryId === null ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleCategoryClick(null)}
            >
              All Services
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategoryId === category.id ? "secondary" : "ghost"
                }
                className="w-full justify-between"
                onClick={() => handleCategoryClick(category.id)}
              >
                <span className="truncate">{category.name}</span>
                {category.service_count != null &&
                  category.service_count > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {category.service_count}
                    </Badge>
                  )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
