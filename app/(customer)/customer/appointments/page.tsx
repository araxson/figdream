import { AppointmentHistory } from "@/core/customer/components";

export default function CustomerAppointmentsPage() {
  return <AppointmentHistory
    appointments={[]}
    onViewDetails={(id) => console.log('View:', id)}
  />;
}
