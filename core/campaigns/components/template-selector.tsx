"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search,
  FileText,
  Star,
  Clock,
  TrendingUp,
  Mail,
  MessageSquare,
  Bell,
  Calendar,
  Gift,
  Heart,
  ShoppingBag,
  Users,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import type { CampaignTemplate } from "../dal/campaigns-types";

interface TemplateSelectorProps {
  type: "email" | "sms";
  onSelect: (template: CampaignTemplate) => void;
  onClose?: () => void;
}

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All Templates", icon: FileText },
  { id: "welcome", label: "Welcome", icon: Heart },
  { id: "promotions", label: "Promotions", icon: Gift },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "seasonal", label: "Seasonal", icon: Calendar },
  { id: "loyalty", label: "Loyalty", icon: Star },
  { id: "reengagement", label: "Re-engagement", icon: Users },
];

// Mock templates - in production these would come from the API
const MOCK_TEMPLATES: CampaignTemplate[] = [
  {
    id: "t1",
    name: "Welcome New Customer",
    description: "Warm welcome email for first-time customers",
    type: "email",
    category: "welcome",
    subject: "Welcome to {{salon_name}}! 🎉",
    content: `Dear {{customer_name}},

Welcome to {{salon_name}}! We're thrilled to have you as our newest member.

As a special thank you for joining us, enjoy 20% off your first visit when you book within the next 7 days.

We can't wait to pamper you!

Best regards,
The {{salon_name}} Team`,
    html_content: "",
    variables: [
      { key: "customer_name", label: "Customer Name", type: "text", required: true },
      { key: "salon_name", label: "Salon Name", type: "text", required: true },
    ],
    is_active: true,
    is_system: true,
    usage_count: 523,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t2",
    name: "Appointment Reminder",
    description: "Remind customers about upcoming appointments",
    type: "sms",
    category: "reminders",
    content: "Hi {{customer_name}}! Reminder: You have an appointment at {{salon_name}} on {{date}} at {{time}}. Reply Y to confirm or C to cancel.",
    variables: [
      { key: "customer_name", label: "Customer Name", type: "text", required: true },
      { key: "salon_name", label: "Salon Name", type: "text", required: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "time", label: "Time", type: "text", required: true },
    ],
    is_active: true,
    is_system: true,
    usage_count: 1245,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t3",
    name: "Birthday Discount",
    description: "Birthday wishes with special offer",
    type: "email",
    category: "promotions",
    subject: "🎂 Happy Birthday {{customer_name}}!",
    content: `Happy Birthday {{customer_name}}!

Your special day deserves special treatment!

Enjoy {{discount}}% off any service this month as our birthday gift to you.

Book your birthday pamper session today!

With love,
{{salon_name}}`,
    html_content: "",
    variables: [
      { key: "customer_name", label: "Customer Name", type: "text", required: true },
      { key: "salon_name", label: "Salon Name", type: "text", required: true },
      { key: "discount", label: "Discount %", type: "number", default_value: 25 },
    ],
    is_active: true,
    is_system: true,
    usage_count: 342,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t4",
    name: "Summer Sale",
    description: "Seasonal promotion for summer services",
    type: "email",
    category: "seasonal",
    subject: "☀️ Summer Sale - {{discount}}% Off!",
    content: `Get ready for summer with our exclusive offers!

Enjoy {{discount}}% off on all our summer specials:
- Beach-ready hair treatments
- Glowing skin facials
- Perfect summer manicures

Offer valid until {{end_date}}.

Book now: {{booking_link}}`,
    html_content: "",
    variables: [
      { key: "discount", label: "Discount %", type: "number", default_value: 20 },
      { key: "end_date", label: "End Date", type: "date", required: true },
      { key: "booking_link", label: "Booking Link", type: "text", required: true },
    ],
    is_active: true,
    is_system: true,
    usage_count: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t5",
    name: "We Miss You",
    description: "Re-engage customers who haven't visited recently",
    type: "email",
    category: "reengagement",
    subject: "We miss you at {{salon_name}} 💕",
    content: `Hi {{customer_name}},

It's been a while since your last visit, and we miss you!

Come back and enjoy {{discount}}% off your next service. We've added some exciting new treatments we think you'll love.

Your exclusive comeback code: {{promo_code}}

Hope to see you soon!
{{salon_name}}`,
    html_content: "",
    variables: [
      { key: "customer_name", label: "Customer Name", type: "text", required: true },
      { key: "salon_name", label: "Salon Name", type: "text", required: true },
      { key: "discount", label: "Discount %", type: "number", default_value: 15 },
      { key: "promo_code", label: "Promo Code", type: "text", required: true },
    ],
    is_active: true,
    is_system: true,
    usage_count: 234,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t6",
    name: "Loyalty Reward",
    description: "Reward loyal customers with special perks",
    type: "sms",
    category: "loyalty",
    content: "{{customer_name}}, you've earned {{points}} loyalty points! Redeem for {{reward}} on your next visit to {{salon_name}}. Book: {{link}}",
    variables: [
      { key: "customer_name", label: "Customer Name", type: "text", required: true },
      { key: "points", label: "Points", type: "number", required: true },
      { key: "reward", label: "Reward", type: "text", required: true },
      { key: "salon_name", label: "Salon Name", type: "text", required: true },
      { key: "link", label: "Booking Link", type: "text", required: true },
    ],
    is_active: true,
    is_system: true,
    usage_count: 412,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function TemplateSelector({ type, onSelect, onClose }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<CampaignTemplate | null>(null);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);

  useEffect(() => {
    // Filter templates by type
    const filteredTemplates = MOCK_TEMPLATES.filter(t => t.type === type);
    setTemplates(filteredTemplates);
  }, [type]);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "welcome":
        return Heart;
      case "promotions":
        return Gift;
      case "reminders":
        return Bell;
      case "seasonal":
        return Calendar;
      case "loyalty":
        return Star;
      case "reengagement":
        return Users;
      default:
        return FileText;
    }
  };

  const getPopularityBadge = (usageCount: number) => {
    if (usageCount > 1000) return { label: "Most Popular", variant: "default" as const };
    if (usageCount > 500) return { label: "Popular", variant: "secondary" as const };
    if (usageCount > 100) return { label: "Trending", variant: "outline" as const };
    return null;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Choose a Template</h2>
          <p className="text-muted-foreground mt-1">
            Start with a professionally designed template or create from scratch
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 h-auto">
            {TEMPLATE_CATEGORIES.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex flex-col gap-1 h-auto py-2"
              >
                <category.icon className="h-4 w-4" />
                <span className="text-xs">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {/* Blank Template Option */}
            <Card
              className="mb-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() =>
                onSelect({
                  id: "blank",
                  name: "Blank Template",
                  type,
                  category: "custom",
                  content: "",
                  variables: [],
                  is_active: true,
                  is_system: false,
                  usage_count: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
              }
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Start from Scratch</h3>
                      <p className="text-sm text-muted-foreground">
                        Create a custom {type === "email" ? "email" : "SMS"} from a blank canvas
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Choose</Button>
                </div>
              </CardContent>
            </Card>

            {/* Template Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => {
                const Icon = getCategoryIcon(template.category);
                const popularity = getPopularityBadge(template.usage_count);

                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        {popularity && (
                          <Badge variant={popularity.variant} className="text-xs">
                            {popularity.label}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base mt-3">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Used {template.usage_count} times
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.variables.length} variables
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No templates found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or category filters
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Subject (for emails) */}
            {previewTemplate?.type === "email" && previewTemplate.subject && (
              <div>
                <Label className="text-sm font-medium">Subject Line</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{previewTemplate.subject}</p>
              </div>
            )}

            {/* Content */}
            <div>
              <Label className="text-sm font-medium">Content</Label>
              <div className="mt-1 p-4 bg-muted rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {previewTemplate?.content}
                </pre>
              </div>
            </div>

            {/* Variables */}
            {previewTemplate?.variables && previewTemplate.variables.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Personalization Variables</Label>
                <div className="mt-2 space-y-2">
                  {previewTemplate.variables.map((variable) => (
                    <div key={variable.key} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-background px-2 py-1 rounded">
                          {variable.key}
                        </code>
                        <span className="text-sm">{variable.label}</span>
                      </div>
                      {variable.required && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (previewTemplate) {
                    onSelect(previewTemplate);
                    setPreviewTemplate(null);
                  }
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Use This Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}