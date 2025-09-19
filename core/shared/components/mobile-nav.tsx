"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Scissors,
  Home,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Package,
  CreditCard,
  Bell,
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
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "../config/navigation/types";

interface MobileNavProps {
  items: NavigationItem[];
  userRole: string;
}

export function MobileNav({ items, userRole: _userRole }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            FigDream
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="flex flex-col gap-1 p-4">
            {items.map((item) => {
              if (item.type === "separator") {
                return (
                  <div key={item.id} className="py-2">
                    <Separator />
                    {item.label && (
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
      </SheetContent>
    </Sheet>
  );
}

// Import the same getIcon function - in real app, this would be a shared utility
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
