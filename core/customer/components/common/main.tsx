/**
 * Loyalty Program Main Component
 * Primary orchestrator for loyalty program management
 */

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { LoyaltyDashboard } from "./dashboard";
import { LoyaltyProgramSettings } from "./settings";
import { LoyaltyMembersList } from "./members-list";
import { LoyaltyTransactionsList } from "./transactions-list";
import { LoyaltyAnalytics } from "./analytics";
import { useLoyaltyProgram } from "../hooks";
import { LoyaltyEmptyState } from "./empty-state";
import { LoyaltyLoadingState } from "./loading";
import { LoyaltyErrorBoundary } from "./error-boundary";

interface LoyaltyProgramMainProps {
  salonId: string;
}

export function LoyaltyProgramMain({ salonId }: LoyaltyProgramMainProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: program, isLoading, error } = useLoyaltyProgram(salonId);

  if (isLoading) return <LoyaltyLoadingState />;
  if (error) return <LoyaltyErrorBoundary error={error} />;
  if (!program) return <LoyaltyEmptyState salonId={salonId} />;

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <LoyaltyDashboard salonId={salonId} />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <LoyaltyMembersList programId={program.id} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <LoyaltyTransactionsList programId={program.id} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <LoyaltyAnalytics salonId={salonId} programId={program.id} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <LoyaltyProgramSettings program={program} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}