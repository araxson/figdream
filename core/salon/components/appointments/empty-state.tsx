"use client";

import { EmptyState } from "@/core/shared/ui/components";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface AppointmentsEmptyStateProps {
  userRole?: "customer" | "staff" | "owner" | "admin";
}

export function AppointmentsEmptyState({
  userRole = "customer",
}: AppointmentsEmptyStateProps) {
  const router = useRouter();

  const getEmptyStateConfig = () => {
    switch (userRole) {
      case "customer":
        return {
          title: "No appointments yet",
          description: "Book your first appointment to get started",
          action: {
            label: "Book Appointment",
            onClick: () => router.push("/book"),
          },
        };
      case "staff":
        return {
          title: "No appointments scheduled",
          description:
            "Your calendar is clear. New appointments will appear here.",
          action: undefined,
        };
      case "owner":
      case "admin":
        return {
          title: "No appointments found",
          description:
            "Create a new appointment or wait for customers to book.",
          action: {
            label: "Create Appointment",
            onClick: () => router.push("/appointments/new"),
          },
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <EmptyState
      icon={Calendar}
      title={config.title}
      description={config.description}
      action={config.action}
    />
  );
}
