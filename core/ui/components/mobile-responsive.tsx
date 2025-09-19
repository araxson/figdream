"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Menu, type LucideIcon } from "lucide-react";

// Mobile menu component
interface MobileMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  items?: MobileMenuItem[];
}

interface MobileMenuProps {
  items: MobileMenuItem[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

export function MobileMenu({ items, logo, footer }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const renderMenuItem = (item: MobileMenuItem, level = 0) => {
    const hasSubItems = item.items && item.items.length > 0;
    const isExpanded = expandedItems.includes(item.id);

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasSubItems) {
              toggleExpanded(item.id);
            } else if (item.onClick) {
              item.onClick();
              setOpen(false);
            }
          }}
          className={`flex w-full items-center justify-between rounded-lg p-2 text-sm hover:bg-accent ${
            level > 0 ? "pl-8" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </div>
          {hasSubItems && (
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          )}
        </button>
        {hasSubItems && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.items!.map((subItem) => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b p-4">
          {logo && <div className="mb-4">{logo}</div>}
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-1">
            {items.map((item) => renderMenuItem(item))}
          </nav>
        </ScrollArea>
        {footer && <div className="border-t p-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}

// Mobile tab navigation
interface MobileTabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
}

interface MobileTabNavigationProps {
  tabs: MobileTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className,
}: MobileTabNavigationProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden ${className}`}
    >
      <nav className="flex h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {tab.icon && <tab.icon className="h-5 w-5" />}
            <span className="text-xs">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="absolute right-4 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {tab.badge > 99 ? "99+" : tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

// Mobile drawer for actions
interface MobileActionDrawerProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function MobileActionDrawer({
  trigger,
  title,
  description,
  children,
}: MobileActionDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DrawerHeader>
        <div className="p-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}

// Responsive container
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "2xl",
  padding = true,
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`mx-auto ${maxWidthClasses[maxWidth]} ${padding ? "px-4 sm:px-6 lg:px-8" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// Mobile-optimized list
interface MobileListItem {
  id: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
}

interface MobileListProps {
  items: MobileListItem[];
  divided?: boolean;
}

export function MobileList({ items, divided = true }: MobileListProps) {
  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div
          key={item.id}
          onClick={item.onClick}
          className={`flex items-center justify-between p-3 ${
            item.onClick ? "cursor-pointer hover:bg-accent" : ""
          } ${divided && index < items.length - 1 ? "border-b" : ""}`}
        >
          <div className="flex-1 space-y-1">
            <div className="text-sm font-medium">{item.primary}</div>
            {item.secondary && (
              <div className="text-xs text-muted-foreground">
                {item.secondary}
              </div>
            )}
          </div>
          {item.action && <div className="ml-4">{item.action}</div>}
        </div>
      ))}
    </div>
  );
}

// Swipeable tabs for mobile
interface SwipeableTabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
}

export function SwipeableTabs({ tabs, defaultTab }: SwipeableTabsProps) {
  return (
    <Tabs defaultValue={defaultTab || tabs[0]?.id} className="w-full">
      <ScrollArea className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-start rounded-none border-b bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 font-medium text-muted-foreground transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
