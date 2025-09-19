"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { schedulesData } from "../dal/schedules-types";

interface schedulesListProps {
  items: schedulesData[];
}

export function schedulesList({ items }: schedulesListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
        <p className="text-muted-foreground">
          Get started by creating your first schedules
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.name || "Unnamed"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {item.description || "No description"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
