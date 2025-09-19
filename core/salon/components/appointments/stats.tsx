import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, DollarSign } from "lucide-react";
import type { AppointmentWithRelations } from "@/core/appointments/types";

interface AppointmentsStatsProps {
  appointments: AppointmentWithRelations[];
}

export function AppointmentsStats({ appointments }: AppointmentsStatsProps) {
  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAppointments = appointments.filter((apt) => {
    if (!apt.start_time) return false;
    const aptDate = new Date(apt.start_time);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime();
  });

  const confirmedCount = appointments.filter(
    (apt) => apt.status === "confirmed",
  ).length;
  const completedCount = appointments.filter(
    (apt) => apt.status === "completed",
  ).length;
  const totalRevenue = appointments
    .filter((apt) => apt.status === "completed")
    .reduce((sum, apt) => sum + (Number(apt.total_amount) || 0), 0);

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      icon: Calendar,
      description: "Scheduled for today",
    },
    {
      title: "Confirmed",
      value: confirmedCount,
      icon: CheckCircle,
      description: "Ready for service",
    },
    {
      title: "Completed",
      value: completedCount,
      icon: Clock,
      description: "This month",
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "Total this month",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
