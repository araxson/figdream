import { ServicesManagement } from "@/core/services/components";
import { ErrorBoundary } from "@/core/ui/components/error-boundary";

export default function DashboardServicesPage() {
  return (
    <ErrorBoundary>
      <ServicesManagement />
    </ErrorBoundary>
  );
}
