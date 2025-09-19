"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  Home,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Package,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  Scissors,
  Clock,
  Star,
  DollarSign,
  FileText,
  UserCheck,
  TrendingUp,
  MessageSquare,
  Shield,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import type { NavigationItem } from "../config/navigation/types";

interface SidebarProps {
  items: NavigationItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userRole: string;
}

export function Sidebar({
  items,
  isCollapsed,
  onToggleCollapse,
  userRole: _userRole,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex h-full flex-col border-r bg-background",
          isCollapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        {/* Logo and Collapse Button */}
        <div className="flex h-14 items-center justify-between border-b px-3">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Scissors className="h-5 w-5" />
              <span>FigDream</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", isCollapsed && "mx-auto")}
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              if (item.type === "separator") {
                return (
                  <div key={item.id} className="py-2">
                    <Separator />
                    {!isCollapsed && item.label && (
                      <p className="mt-2 mb-1 px-2 text-xs font-medium text-muted-foreground">
                        {item.label}
                      </p>
                    )}
                  </div>
                );
              }

              const Icon = getIcon(item.icon);
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          size="icon"
                          className={cn(
                            "h-10 w-10",
                            isActive && "bg-secondary",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="sr-only">{item.label}</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="flex items-center gap-4"
                    >
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive && "bg-secondary",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="border-t p-3">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="ghost" className="w-full justify-start gap-3">
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function getIcon(name: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    home: Home,
    users: Users,
    calendar: Calendar,
    chart: BarChart3,
    settings: Settings,
    package: Package,
    creditCard: CreditCard,
    bell: Bell,
    scissors: Scissors,
    clock: Clock,
    star: Star,
    dollar: DollarSign,
    file: FileText,
    userCheck: UserCheck,
    trending: TrendingUp,
    message: MessageSquare,
    shield: Shield,
    briefcase: Briefcase,
  };
  return icons[name] || Home;
}
