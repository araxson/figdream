import { CustomersDashboard } from "@/core/customers/components";
import { getCustomers, getCustomerMetrics } from "@/core/customers/dal/customers-queries";
import { ErrorBoundary } from "@/core/ui/components/error-boundary";

export default async function DashboardCustomersPage() {
  // Fetch initial data server-side for better performance
  const [customers, metrics] = await Promise.all([
    getCustomers(),
    getCustomerMetrics()
  ]);

  return (
    <ErrorBoundary>
      <CustomersDashboard
        initialCustomers={customers}
        initialMetrics={metrics}
        role="owner"
      />
    </ErrorBoundary>
  );
}
