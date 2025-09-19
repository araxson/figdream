"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Database, Activity } from "lucide-react";
import { AuditLogsList } from "./list";
import { AuditLogsStats } from "./stats";
import { SecurityIncidents } from "./incidents";
import { AuditLogsFilters } from "./filters";
import { DataChanges } from "./data-changes";
import { AuditLogDetail } from "./detail";
import {
  useAuditEvents,
  useSecurityIncidents,
  useDataChanges,
  useAuditStats,
} from "../hooks/use-audit-logs";
import { useExportAuditLogs } from "../hooks/use-audit-logs-mutations";
import type {
  AuditLogFilters,
  AuditEventWithUser,
  SecurityIncidentWithUser,
  DataChangeWithUser,
} from "../types";

interface AuditLogsProps {
  role?: "admin" | "owner" | "staff";
  salonId?: string;
}

export function AuditLogs({ role = "admin", salonId }: AuditLogsProps) {
  const [activeTab, setActiveTab] = useState<
    "events" | "incidents" | "changes"
  >("events");
  const [filters, setFilters] = useState<AuditLogFilters>({
    salonId: salonId,
    limit: 100,
  });
  const [selectedItem, setSelectedItem] = useState<
    AuditEventWithUser | SecurityIncidentWithUser | DataChangeWithUser | null
  >(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Fetch data based on active tab
  const { data: events = [], isLoading: eventsLoading } =
    useAuditEvents(filters);
  const { data: incidents = [], isLoading: _incidentsLoading } =
    useSecurityIncidents({
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: filters.limit,
    });
  const { data: changes = [], isLoading: _changesLoading } = useDataChanges({
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: filters.limit,
  });
  const { data: stats } = useAuditStats(filters.salonId);

  const exportMutation = useExportAuditLogs();

  const handleViewDetails = (
    item: AuditEventWithUser | SecurityIncidentWithUser | DataChangeWithUser,
  ) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleExport = () => {
    exportMutation.mutate({
      filters,
      format: "csv",
    });
  };

  const handleResetFilters = () => {
    setFilters({
      salonId: salonId,
      limit: 100,
    });
  };

  // Check permissions based on role
  const canViewSensitive = role === "admin";
  const canExport = role === "admin" || role === "owner";
  const canViewIncidents = role === "admin";

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Monitor system activity, security events, and data changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
        </div>
      </div>

      {stats && <AuditLogsStats stats={stats} incidents={incidents.length} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AuditLogsFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                View and analyze system events and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(v) =>
                  setActiveTab(v as "events" | "incidents" | "changes")
                }
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="events"
                    className="flex items-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    Events
                  </TabsTrigger>
                  {canViewIncidents && (
                    <TabsTrigger
                      value="incidents"
                      className="flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Incidents
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="changes"
                    className="flex items-center gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Data Changes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="mt-6">
                  <AuditLogsList
                    events={events}
                    onViewDetails={handleViewDetails}
                    onExport={canExport ? handleExport : () => {}}
                    isLoading={eventsLoading}
                  />
                </TabsContent>

                {canViewIncidents && (
                  <TabsContent value="incidents" className="mt-6">
                    <SecurityIncidents incidents={incidents} />
                  </TabsContent>
                )}

                <TabsContent value="changes" className="mt-6">
                  <DataChanges
                    changes={changes}
                    onSelectChange={handleViewDetails}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <AuditLogDetail
        item={selectedItem}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedItem(null);
        }}
      />

      {!canViewSensitive && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some sensitive information may be hidden based on your access level.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
