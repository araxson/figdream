import { Suspense } from "react";
import { getSalons } from "../dal/salons-queries";
import { SalonsList } from "./list";
import { SalonsHeader } from "./header";
import { SalonsStats } from "./stats";
import { SalonsMap } from "./map";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalonFilters } from "../types";

interface SalonsManagementProps {
  filters?: SalonFilters;
  role?: "admin" | "owner" | "customer";
}

export async function SalonsManagement({
  filters = {},
  role = "admin",
}: SalonsManagementProps) {
  const salons = await getSalons(filters);

  return (
    <div className="space-y-6">
      <SalonsHeader />

      <Suspense fallback={<StatsLoadingSkeleton />}>
        <SalonsStats salons={salons} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <Suspense fallback={<ListLoadingSkeleton />}>
              <SalonsList salons={salons} />
            </Suspense>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Suspense fallback={<MapLoadingSkeleton />}>
            <SalonsMap salons={salons} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </Card>
      ))}
    </div>
  );
}

function ListLoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function MapLoadingSkeleton() {
  return (
    <Card className="h-[400px] flex items-center justify-center">
      <Skeleton className="h-full w-full" />
    </Card>
  );
}
