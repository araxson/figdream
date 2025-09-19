"use client";

import { Plus, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomersHeaderProps {
  role: "admin" | "owner" | "manager" | "staff";
}

export function CustomersHeader({ role }: CustomersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer relationships and preferences
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers..." className="pl-8 max-w-xs" />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="new">New This Month</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>

        {(role === "admin" || role === "owner" || role === "manager") && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        )}
      </div>
    </div>
  );
}
