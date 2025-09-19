import { Suspense } from "react";
import { getServices, getServiceCategories } from "../dal/services-queries";
import { ServicesList } from "./list";
import { ServicesHeader } from "./header";
import { ServicesStats } from "./stats";
import { CategoriesSidebar } from "./categories";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ServiceFilters } from "../types";

interface ServicesManagementProps {
  filters?: ServiceFilters;
  role?: "admin" | "staff" | "customer";
}

export async function ServicesManagement({
  filters = {},
  role = "admin",
}: ServicesManagementProps) {
  const [services, categories] = await Promise.all([
    getServices(filters),
    getServiceCategories(filters.salon_id),
  ]);

  // Compute stats from services
  const stats = {
    totalServices: services.length,
    activeServices: services.filter((s) => s.is_active).length,
    featuredServices: services.filter((s) => s.is_featured).length,
    averagePrice:
      services.reduce((sum, s) => sum + (s.base_price || 0), 0) /
      (services.length || 1),
    averageDuration:
      services.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) /
      (services.length || 1),
    totalRevenue: 0, // This would come from actual booking data
    totalBookings: 0, // This would come from actual booking data
  };

  return (
    <div className="space-y-6">
      <ServicesHeader />

      <Suspense fallback={<StatsLoadingSkeleton />}>
        <ServicesStats stats={stats} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Suspense fallback={<CategoriesLoadingSkeleton />}>
            <CategoriesSidebar categories={categories} />
          </Suspense>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <Suspense fallback={<ListLoadingSkeleton />}>
              <ServicesList services={services} />
            </Suspense>
          </Card>
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

function CategoriesLoadingSkeleton() {
  return (
    <Card className="p-4">
      <Skeleton className="h-6 w-32 mb-4" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full mb-2" />
      ))}
    </Card>
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
