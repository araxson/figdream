"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  Bell,
  Palette,
  CreditCard,
  Building,
  Users,
  Calendar,
  Globe,
  type LucideIcon,
} from "lucide-react";

interface SettingSection {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  badge?: string;
  content: React.ReactNode;
}

interface SettingsLayoutProps {
  sections: SettingSection[];
  defaultSection?: string;
  showSaveButton?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}

export function SettingsLayout({
  sections,
  defaultSection,
  showSaveButton = true,
  onSave,
  isSaving = false,
}: SettingsLayoutProps) {
  const [activeSection, setActiveSection] = useState(
    defaultSection || sections[0]?.id,
  );
  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        {/* Sidebar Navigation */}
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="mr-2 h-4 w-4" />
                <span>{section.title}</span>
                {section.badge && (
                  <Badge variant="destructive" className="ml-auto">
                    {section.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {currentSection && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <currentSection.icon className="h-5 w-5" />
                  <CardTitle>{currentSection.title}</CardTitle>
                </div>
                {currentSection.description && (
                  <CardDescription>
                    {currentSection.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">{currentSection.content}</div>

                {showSaveButton && onSave && (
                  <>
                    <Separator className="my-6" />
                    <div className="flex justify-end">
                      <Button onClick={onSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Settings section with tabs
interface SettingsSectionWithTabsProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  defaultTab?: string;
}

export function SettingsSectionWithTabs({
  tabs,
  defaultTab,
}: SettingsSectionWithTabsProps) {
  return (
    <Tabs defaultValue={defaultTab || tabs[0]?.id} className="w-full">
      <TabsList
        className={`grid w-full ${tabs.length === 2 ? "grid-cols-2" : tabs.length === 3 ? "grid-cols-3" : tabs.length === 4 ? "grid-cols-4" : tabs.length === 5 ? "grid-cols-5" : "grid-cols-6"}`}
      >
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="space-y-4 mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Settings group component
interface SettingsGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsGroup({
  title,
  description,
  children,
}: SettingsGroupProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
