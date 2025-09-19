"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database, Edit, Trash, Plus } from "lucide-react";
import type { DataChangeWithUser } from "../types";

interface DataChangesProps {
  changes: DataChangeWithUser[];
  onSelectChange?: (change: DataChangeWithUser) => void;
}

export function DataChanges({ changes, onSelectChange }: DataChangesProps) {
  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case "INSERT":
        return <Plus className="h-4 w-4" />;
      case "UPDATE":
        return <Edit className="h-4 w-4" />;
      case "DELETE":
        return <Trash className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case "INSERT":
        return "default";
      case "UPDATE":
        return "secondary";
      case "DELETE":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Operation</TableHead>
          <TableHead>Table</TableHead>
          <TableHead>Record ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {changes.map((change) => (
          <TableRow
            key={change.id}
            className="cursor-pointer"
            onClick={() => onSelectChange?.(change)}
          >
            <TableCell>
              <Badge variant={getOperationColor(change.operation)}>
                <span className="flex items-center gap-1">
                  {getOperationIcon(change.operation)}
                  {change.operation}
                </span>
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-sm">
              {change.table_name}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {change.record_id}
            </TableCell>
            <TableCell>{change.user?.display_name || "System"}</TableCell>
            <TableCell className="font-mono text-xs">
              {change.client_ip || "N/A"}
            </TableCell>
            <TableCell className="text-sm">
              {new Date(change.changed_at).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
