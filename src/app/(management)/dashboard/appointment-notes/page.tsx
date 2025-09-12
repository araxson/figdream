import { Metadata } from 'next';
import { AppointmentNotesManager } from '@/components/features/appointments/appointment-notes-manager';

export const metadata: Metadata = {
  title: 'Appointment Notes | Dashboard',
  description: 'Manage appointment notes and important information',
};

export default function AppointmentNotesPage() {
  return <AppointmentNotesManager />;
}