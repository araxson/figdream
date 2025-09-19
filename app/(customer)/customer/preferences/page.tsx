import { PreferencesForm } from '@/core/customer/components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preferences',
  description: 'Manage your booking and notification preferences',
};

export default function PreferencesPage() {
  // Mock preferences - in production, fetch from server
  const mockPreferences = {
    language: 'en',
    timezone: 'America/New_York',
    communication: { email: true, sms: false, push: false },
    notifications: { bookingReminders: true, promotions: false, reviews: true, cancellations: true },
    booking: { preferredTimeSlots: [], notes: '' }
  };

  return (
    <div className="container mx-auto py-8">
      <PreferencesForm
        preferences={mockPreferences}
        onSave={async (data) => {
          // TODO: Implement save logic
          console.log('Saving preferences:', data);
        }}
      />
    </div>
  );
}