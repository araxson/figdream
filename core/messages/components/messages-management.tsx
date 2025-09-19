"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesView } from "./messages-view";
import { Badge } from "@/components/ui/badge";

interface MessagesManagementProps {
  role?: "admin" | "owner" | "manager" | "staff";
}

export function MessagesManagement({
  role = "staff",
}: MessagesManagementProps) {
  const [unreadCount] = useState({
    all: 0,
    customers: 0,
    team: 0,
    system: 0,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Manage conversations with customers and team members
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            All Messages
            {unreadCount.all > 0 && (
              <Badge variant="secondary">{unreadCount.all}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            Customers
            {unreadCount.customers > 0 && (
              <Badge variant="secondary">{unreadCount.customers}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            Team
            {unreadCount.team > 0 && (
              <Badge variant="secondary">{unreadCount.team}</Badge>
            )}
          </TabsTrigger>
          {role === "admin" && (
            <TabsTrigger value="system" className="gap-2">
              System
              {unreadCount.system > 0 && (
                <Badge variant="secondary">{unreadCount.system}</Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all">
          <MessagesView />
        </TabsContent>

        <TabsContent value="customers">
          <MessagesView />
        </TabsContent>

        <TabsContent value="team">
          <MessagesView />
        </TabsContent>

        {role === "admin" && (
          <TabsContent value="system">
            <MessagesView />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
