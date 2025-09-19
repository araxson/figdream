import { Suspense } from "react";
import { getCustomers, getCustomerMetrics } from "../dal/customers-queries";
import { CustomersHeader } from "./header";
import { CustomersStats } from "./stats";
import { CustomersList } from "./list";
import { LoadingState } from "@/core/ui/components";
import type { CustomerFilters } from "../dal/customers-types";

interface CustomersManagementProps {
  role: "admin" | "owner" | "manager" | "staff";
  filters?: CustomerFilters;
}

export async function CustomersManagement({
  role,
  filters = {},
}: CustomersManagementProps) {
  const [customers, metrics] = await Promise.all([
    getCustomers(filters),
    getCustomerMetrics(filters.salon_id),
  ]);

  return (
    <div className="space-y-6">
      <CustomersHeader role={role} />

      <Suspense fallback={<LoadingState />}>
        <CustomersStats metrics={metrics} />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <CustomersList customers={customers} role={role} />
      </Suspense>
    </div>
  );
}
