"use client";

import { Plus, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppointmentsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          Manage and track all salon appointments
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>
    </div>
  );
}
