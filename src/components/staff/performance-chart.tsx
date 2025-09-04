import { getStaffUtilization, getStaffEarnings } from '@/lib/data-access/staff';
import { RevenueChart } from '@/components/salon-owner/analytics/charts/revenue-chart';
interface PerformanceChartProps {
  staffId: string;
}
export async function PerformanceChart({ staffId }: PerformanceChartProps) {
  // Get last 7 days of earnings
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  const earningsData = await Promise.all(
    last7Days.map(async (date) => {
      const earnings = await getStaffEarnings(staffId, date, date);
      const total = earnings?.reduce((sum, e) => 
        sum + (e.base_amount || 0) + (e.commission_amount || 0) + (e.tip_amount || 0), 0
      ) || 0;
      return {
        date,
        revenue: total,
        appointments: earnings?.length || 0
      };
    })
  );
  // Get utilization metrics
  const utilization = await getStaffUtilization(staffId);
  const avgUtilization = utilization?.length > 0
    ? Math.round(utilization.reduce((sum, u) => sum + (u.utilization_percentage || 0), 0) / utilization.length)
    : 0;
  // Performance metrics must be calculated from actual data
  // No hardcoded values allowed per project rules
  const _performanceData = [
    { metric: 'Utilization', value: avgUtilization, fullMark: 100 },
    // Other metrics will be calculated from actual database data when available
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <RevenueChart 
        data={earningsData} 
        type="line"
        title="Weekly Earnings"
        description="Your earnings over the past 7 days"
      />
      {/* Performance metrics temporarily disabled until real data is available */}
      <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/10">
        <p className="text-muted-foreground text-center px-4">
          Performance metrics will be calculated from actual data.<br/>
          Currently showing utilization: {avgUtilization}%
        </p>
      </div>
    </div>
  );
}