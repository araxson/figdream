import { Suspense } from "react";
import { getStaffMemberByUserId } from "../../dal/staff-queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/core/shared/ui/components";

export async function StaffProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const staff = await getStaffMemberByUserId(user.id);

  if (!staff) {
    return (
      <div className="container py-6">
        <p>Staff profile not found</p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <Suspense fallback={<LoadingState />}>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={staff.user?.avatar_url || ""} />
                <AvatarFallback>
                  {staff.user?.display_name?.slice(0, 2).toUpperCase() || "ST"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{staff.user?.display_name}</CardTitle>
                <p className="text-muted-foreground">{staff.title}</p>
                <div className="flex gap-2 mt-2">
                  {staff.is_featured && <Badge>Featured</Badge>}
                  {staff.is_bookable && (
                    <Badge variant="default">Bookable</Badge>
                  )}
                  <Badge variant="outline">
                    {staff.employment_type?.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Commission Rate</p>
                <p className="font-medium">{staff.commission_rate || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Appointments
                </p>
                <p className="font-medium">{staff.total_appointments || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-medium">
                  {staff.rating_average?.toFixed(1) || "0.0"} (
                  {staff.rating_count || 0} reviews)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="font-medium">
                  ${(staff.total_revenue || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {staff.bio && (
              <div>
                <p className="text-sm text-muted-foreground">Bio</p>
                <p>{staff.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}
