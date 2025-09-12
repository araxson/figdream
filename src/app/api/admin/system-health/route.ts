import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '24h';

    // Check authentication and admin role
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Calculate time range
    const now = new Date();
    let fromDate = new Date();
    switch (timeRange) {
      case '1h':
        fromDate.setHours(now.getHours() - 1);
        break;
      case '24h':
        fromDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        fromDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        fromDate.setDate(now.getDate() - 30);
        break;
      default:
        fromDate.setDate(now.getDate() - 1);
    }

    // Fetch system health metrics
    const [systemMetrics, errorLogs, alertHistory, performanceTrends, apiUsage] = await Promise.all([
      // System health metrics
      supabase
        .from('system_health_metrics')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100),

      // Recent error logs
      supabase
        .from('error_logs')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(50),

      // Recent alerts
      supabase
        .from('alert_history')
        .select('*')
        .gte('triggered_at', fromDate.toISOString())
        .order('triggered_at', { ascending: false })
        .limit(20),

      // Performance trends
      supabase
        .from('performance_trends')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100),

      // API usage stats
      supabase
        .from('api_usage')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100)
    ]);

    // Get database statistics
    const { data: dbStats } = await supabase
      .rpc('get_database_stats', {})
      .single();

    // Get current active users count
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', fromDate.toISOString());

    // Get appointments statistics
    const { count: appointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fromDate.toISOString());

    // Calculate aggregated metrics
    const aggregatedMetrics = {
      system: {
        uptime: calculateUptime(systemMetrics.data || []),
        responseTime: calculateAverageResponseTime(performanceTrends.data || []),
        errorRate: calculateErrorRate(errorLogs.data || [], apiUsage.data || []),
        activeUsers: activeUsers || 0,
        appointmentsToday: appointmentsCount || 0
      },
      database: dbStats || {},
      alerts: {
        total: alertHistory.data?.length || 0,
        critical: alertHistory.data?.filter((a: any) => a.severity === 'critical').length || 0,
        warning: alertHistory.data?.filter((a: any) => a.severity === 'warning').length || 0
      },
      errors: {
        total: errorLogs.data?.length || 0,
        byType: groupErrorsByType(errorLogs.data || [])
      },
      performance: {
        trends: performanceTrends.data || [],
        apiUsage: apiUsage.data || []
      }
    };

    return NextResponse.json({
      metrics: aggregatedMetrics,
      rawData: {
        systemMetrics: systemMetrics.data || [],
        errorLogs: errorLogs.data || [],
        alerts: alertHistory.data || [],
        performanceTrends: performanceTrends.data || [],
        apiUsage: apiUsage.data || []
      }
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system health data' },
      { status: 500 }
    );
  }
}

function calculateUptime(metrics: any[]): number {
  if (!metrics.length) return 100;
  const totalTime = metrics.length;
  const upTime = metrics.filter(m => m.status === 'healthy').length;
  return Math.round((upTime / totalTime) * 100);
}

function calculateAverageResponseTime(trends: any[]): number {
  if (!trends.length) return 0;
  const avgTime = trends.reduce((acc, t) => acc + (t.response_time || 0), 0) / trends.length;
  return Math.round(avgTime);
}

function calculateErrorRate(errors: any[], usage: any[]): number {
  if (!usage.length) return 0;
  const totalRequests = usage.reduce((acc, u) => acc + (u.request_count || 0), 0);
  if (totalRequests === 0) return 0;
  return Math.round((errors.length / totalRequests) * 100 * 100) / 100;
}

function groupErrorsByType(errors: any[]): Record<string, number> {
  return errors.reduce((acc, error) => {
    const type = error.error_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}