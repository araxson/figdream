import { redirect } from "next/navigation"
import { getUserContext, getProfile, getAnalytics } from "@/lib/data-access/unified"
import { ProfileForm } from "@/components/shared/profile/profile-form"
import { createClient } from "@/lib/database/supabase/server"

export default async function SalonOwnerProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const context = await getUserContext(user.id)
  if (!context || context.role !== "salon_owner") redirect("/error-403")

  const { profile, salon } = await getProfile(context)
  const analytics = await getAnalytics(context)

  // Get additional stats
  const { count: staffCount } = await supabase
    .from("staff_profiles")
    .select("*", { count: "exact", head: true })
    .eq("salon_id", context.salonId)

  const { count: customerCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("salon_id", context.salonId)

  const stats = [
    { label: "Total Staff", value: staffCount || 0 },
    { label: "Total Customers", value: customerCount || 0 },
    { label: "Total Revenue", value: `$${analytics?.totalRevenue?.toFixed(2) || "0.00"}` },
    { label: "Avg Rating", value: analytics?.averageRating?.toFixed(1) || "0.0" }
  ]

  return (
    <ProfileForm
      userRole="salon_owner"
      profileData={{
        id: profile?.id || "",
        full_name: profile?.full_name,
        email: profile?.email,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        bio: profile?.bio,
        created_at: profile?.created_at || new Date().toISOString(),
        title: "Salon Owner"
      }}
      organizationData={salon ? {
        id: salon.id,
        name: salon.name,
        email: salon.email,
        phone: salon.phone,
        address: salon.address,
        created_at: salon.created_at,
        license_number: salon.license_number
      } : undefined}
      stats={stats}
    />
  )
}