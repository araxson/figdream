import { Suspense } from "react";
import { getAppointments } from "../dal/appointments";
import { AppointmentsList } from "./list";
import { AppointmentsStats } from "./stats";
import { AppointmentFilters } from "./filters";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentFilters as FiltersType } from "../dal/appointments";

interface AppointmentsManagementProps {
  salonId?: string;
  customerId?: string;
  staffId?: string;
  initialFilters?: FiltersType;
}

export async function AppointmentsManagement({
  salonId,
  customerId,
  staffId,
  initialFilters = {},
}: AppointmentsManagementProps) {
  // Build filters
  const filters: FiltersType = {
    ...initialFilters,
    ...(salonId && { salon_id: salonId }),
    ...(customerId && { customer_id: customerId }),
    ...(staffId && { staff_id: staffId }),
  };

  // Fetch data
  const appointments = await getAppointments(filters);

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <AppointmentsStats appointments={appointments} />
      </Suspense>

      {/* Filters Section */}
      <Card className="p-4">
        <AppointmentFilters
          filters={filters}
          onFiltersChange={() => {
            // This will be handled by client component wrapper
          }}
        />
      </Card>

      {/* Appointments List */}
      <Suspense fallback={<ListLoadingSkeleton />}>
        <AppointmentsList appointments={appointments} />
      </Suspense>
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
    <Card className="p-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}
