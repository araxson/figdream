"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SecurityIncident } from "../dal/audit-logs-types";
import { AlertTriangle, Shield, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SecurityIncidentsProps {
  incidents: SecurityIncident[];
}

export function SecurityIncidents({ incidents }: SecurityIncidentsProps) {
  const getSeverityBadge = (
    severity: string,
  ): "destructive" | "outline" | "secondary" | "default" => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "outline";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (incidents.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Active Security Incidents</AlertTitle>
      <AlertDescription className="mt-4">
        <div className="space-y-3">
          {incidents.map((incident) => (
            <Card key={incident.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <CardTitle className="text-base">
                      {incident.incident_type.replace(/_/g, " ")}
                    </CardTitle>
                    <Badge variant={getSeverityBadge(incident.severity)}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    Resolve
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {incident.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Detected{" "}
                    {formatDistanceToNow(new Date(incident.detected_at), {
                      addSuffix: true,
                    })}
                  </div>
                  {incident.user_id && (
                    <div>User: {incident.user_id.slice(0, 8)}...</div>
                  )}
                  {incident.ip_address && <div>IP: {incident.ip_address}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
