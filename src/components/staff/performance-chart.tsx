import { getStaffUtilization, getStaffEarnings } from '@/lib/data-access/staff';
import { RevenueChart } from '@/components/salon-owner/analytics/revenue-chart';
import { PerformanceMetrics } from '@/components/salon-owner/analytics/performance-metrics';
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
  const performanceData = [
    { metric: 'Utilization', value: avgUtilization, fullMark: 100 },
    { metric: 'Bookings', value: 85, fullMark: 100 },
    { metric: 'Client Satisfaction', value: 95, fullMark: 100 },
    { metric: 'Revenue', value: 78, fullMark: 100 },
    { metric: 'Efficiency', value: 88, fullMark: 100 },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <RevenueChart 
        data={earningsData} 
        type="line"
        title="Weekly Earnings"
        description="Your earnings over the past 7 days"
      />
      <PerformanceMetrics 
        data={performanceData}
        type="radar"
        title="Performance Overview"
        description="Your key performance metrics"
      />
    </div>
  );
}