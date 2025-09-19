"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { getNavigationByRole } from "../config/navigation";
import type { UserRole } from "../config/navigation/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function DashboardLayout({
  children,
  userRole,
  userName,
  userEmail,
  userAvatar,
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const navigationItems = getNavigationByRole(userRole);

  // Load collapsed state from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored) {
      setIsCollapsed(JSON.parse(stored));
    }
  }, []);

  // Save collapsed state to localStorage
  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <Sidebar
          items={navigationItems}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          userRole={userRole}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header with Mobile Nav */}
        <div className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <MobileNav items={navigationItems} userRole={userRole} />
          </div>

          {/* Header Content */}
          <div className="flex-1">
            <Header
              userRole={userRole}
              userName={userName}
              userEmail={userEmail}
              userAvatar={userAvatar}
            />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/10">
          <div className="container mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
