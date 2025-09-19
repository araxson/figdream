import { Suspense } from "react";
import {
  getStaffMemberByUserId,
  getTimeOffRequests,
} from "../dal/staff-queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/core/shared/ui/components";
import { Plus } from "lucide-react";

export async function TimeOffRequests() {
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

  const requests = await getTimeOffRequests({ staff_id: staff.id });

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Time Off Requests</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Request Time Off
        </Button>
      </div>

      <Suspense fallback={<LoadingState />}>
        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-muted-foreground">No time off requests</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between py-3 border-b"
                  >
                    <div>
                      <p className="font-medium">
                        {request.type?.replace("_", " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.start_date).toLocaleDateString()} -
                        {new Date(request.end_date).toLocaleDateString()}
                      </p>
                      {request.reason && (
                        <p className="text-sm mt-1">{request.reason}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        request.status === "approved"
                          ? "default"
                          : request.status === "rejected"
                            ? "destructive"
                            : request.status === "cancelled"
                              ? "secondary"
                              : "outline"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}
