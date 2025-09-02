import { redirect } from "next/navigation"
import { getUserContext, getSettings } from "@/lib/data-access/unified"
import { SettingsForm } from "@/components/shared/settings/settings-form"
import { createClient } from "@/lib/database/supabase/server"

export default async function CustomerSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const context = await getUserContext(user.id)
  if (!context || context.role !== "customer") redirect("/error-403")

  const preferences = await getSettings(context)

  return (
    <SettingsForm
      userRole="customer"
      notifications={{
        email_reminders: preferences?.email_reminders ?? true,
        sms_reminders: preferences?.sms_reminders ?? true,
        marketing_emails: preferences?.marketing_emails ?? false,
        appointment_reminders_hours: preferences?.appointment_reminders_hours ?? 24,
        push_notifications: preferences?.push_notifications ?? true,
        newsletter: preferences?.newsletter ?? false
      }}
      privacy={{
        allow_online_booking: preferences?.allow_online_booking ?? true,
        show_in_reviews: preferences?.show_in_reviews ?? true,
        profile_visibility: preferences?.profile_visibility ?? "public",
        data_sharing: preferences?.data_sharing ?? false
      }}
      general={{
        language: preferences?.language ?? "en",
        timezone: preferences?.timezone ?? "America/New_York",
        date_format: preferences?.date_format ?? "MM/DD/YYYY",
        time_format: preferences?.time_format ?? "12h",
        theme: preferences?.theme ?? "system",
        currency: preferences?.currency ?? "USD"
      }}
    />
  )
}