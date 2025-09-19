"use client";

import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  UserCheck,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Activity,
  MapPin,
  Tag,
  Award,
  Mail,
  Phone,
  X,
} from "lucide-react";
import type { CampaignData, AudienceConfig, AudienceFilters } from "../../dal/campaigns-types";

interface AudienceSelectorProps {
  data: Partial<CampaignData>;
  errors: Record<string, string>;
  onChange: (updates: Partial<CampaignData>) => void;
}

const PREDEFINED_SEGMENTS = [
  {
    id: "all",
    name: "All Customers",
    description: "Send to your entire customer base",
    icon: Users,
    count: 1250,
  },
  {
    id: "active",
    name: "Active Customers",
    description: "Customers who visited in the last 30 days",
    icon: Activity,
    count: 456,
  },
  {
    id: "vip",
    name: "VIP Customers",
    description: "Top spending customers (>$500)",
    icon: Award,
    count: 89,
  },
  {
    id: "new",
    name: "New Customers",
    description: "Joined in the last 60 days",
    icon: UserCheck,
    count: 123,
  },
  {
    id: "dormant",
    name: "Dormant Customers",
    description: "Haven't visited in 90+ days",
    icon: Calendar,
    count: 234,
  },
];

export function AudienceSelector({ data, errors, onChange }: AudienceSelectorProps) {
  const [audience, setAudience] = useState<AudienceConfig>(
    data.audience || { type: "all" }
  );
  const [filters, setFilters] = useState<AudienceFilters>(audience.filters || {});
  const [estimatedReach, setEstimatedReach] = useState(0);
  const [selectedSegments, setSelectedSegments] = useState<string[]>(
    audience.segments || []
  );
  const [customEmails, setCustomEmails] = useState("");

  useEffect(() => {
    // Calculate estimated reach based on selections
    let reach = 0;
    if (audience.type === "all") {
      reach = 1250;
    } else if (audience.type === "segment") {
      reach = selectedSegments.reduce((total, segmentId) => {
        const segment = PREDEFINED_SEGMENTS.find((s) => s.id === segmentId);
        return total + (segment?.count || 0);
      }, 0);
    } else if (audience.type === "custom") {
      const emails = customEmails.split(",").filter((e) => e.trim());
      reach = emails.length;
    }

    // Apply filter modifiers
    if (filters.has_email === true) reach = Math.floor(reach * 0.95);
    if (filters.has_phone === true) reach = Math.floor(reach * 0.75);
    if (filters.email_opt_in === true) reach = Math.floor(reach * 0.85);
    if (filters.sms_opt_in === true) reach = Math.floor(reach * 0.65);

    setEstimatedReach(reach);
  }, [audience, filters, selectedSegments, customEmails]);

  const handleAudienceTypeChange = (type: "all" | "segment" | "custom") => {
    const newAudience: AudienceConfig = {
      ...audience,
      type,
      estimated_reach: estimatedReach,
    };
    setAudience(newAudience);
    onChange({ audience: newAudience });
  };

  const handleFilterChange = (newFilters: AudienceFilters) => {
    setFilters(newFilters);
    const newAudience: AudienceConfig = {
      ...audience,
      filters: newFilters,
      estimated_reach: estimatedReach,
    };
    setAudience(newAudience);
    onChange({ audience: newAudience });
  };

  const handleSegmentToggle = (segmentId: string) => {
    const newSegments = selectedSegments.includes(segmentId)
      ? selectedSegments.filter((id) => id !== segmentId)
      : [...selectedSegments, segmentId];

    setSelectedSegments(newSegments);
    const newAudience: AudienceConfig = {
      ...audience,
      segments: newSegments,
      estimated_reach: estimatedReach,
    };
    setAudience(newAudience);
    onChange({ audience: newAudience });
  };

  return (
    <div className="space-y-6">
      {/* Audience Type Selection */}
      <div className="space-y-4">
        <RadioGroup
          value={audience.type}
          onValueChange={(value) => handleAudienceTypeChange(value as any)}
        >
          <div className="grid gap-4">
            {/* All Customers */}
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <RadioGroupItem value="all" id="all" className="mt-1 mr-3" />
                  <div className="flex-1">
                    <Label htmlFor="all" className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            All Customers
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Send to your entire customer base
                          </p>
                        </div>
                        <Badge variant="secondary">~1,250 recipients</Badge>
                      </div>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Segment Selection */}
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <RadioGroupItem value="segment" id="segment" className="mt-1 mr-3" />
                  <div className="flex-1">
                    <Label htmlFor="segment" className="cursor-pointer">
                      <div className="font-medium flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        Target Segments
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose specific customer segments
                      </p>
                    </Label>

                    {audience.type === "segment" && (
                      <div className="mt-4 space-y-2">
                        {PREDEFINED_SEGMENTS.map((segment) => (
                          <div
                            key={segment.id}
                            className="flex items-center p-3 rounded-lg border hover:bg-accent cursor-pointer"
                            onClick={() => handleSegmentToggle(segment.id)}
                          >
                            <Checkbox
                              checked={selectedSegments.includes(segment.id)}
                              className="mr-3"
                            />
                            <segment.icon className="mr-3 h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="font-medium">{segment.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {segment.description}
                              </div>
                            </div>
                            <Badge variant="outline">{segment.count}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom List */}
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <RadioGroupItem value="custom" id="custom" className="mt-1 mr-3" />
                  <div className="flex-1">
                    <Label htmlFor="custom" className="cursor-pointer">
                      <div className="font-medium flex items-center">
                        <Search className="mr-2 h-4 w-4" />
                        Custom List
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter specific email addresses or phone numbers
                      </p>
                    </Label>

                    {audience.type === "custom" && (
                      <div className="mt-4">
                        <Textarea
                          placeholder="Enter email addresses or phone numbers, separated by commas..."
                          value={customEmails}
                          onChange={(e) => setCustomEmails(e.target.value)}
                          rows={4}
                          className="font-mono text-sm"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          {customEmails.split(",").filter((e) => e.trim()).length} recipients
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </RadioGroup>
      </div>

      {/* Advanced Filters */}
      {audience.type !== "custom" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Advanced Filters</CardTitle>
            <CardDescription>
              Further refine your audience with additional criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="demographics">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="demographics" className="space-y-4">
                {/* Age Range */}
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="w-24"
                      value={filters.age_range?.min || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          age_range: {
                            ...filters.age_range,
                            min: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      className="w-24"
                      value={filters.age_range?.max || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          age_range: {
                            ...filters.age_range,
                            max: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="flex gap-2">
                    {["Male", "Female", "Other"].map((gender) => (
                      <Button
                        key={gender}
                        variant={filters.gender?.includes(gender) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = filters.gender || [];
                          const newGender = current.includes(gender)
                            ? current.filter((g) => g !== gender)
                            : [...current, gender];
                          handleFilterChange({ ...filters, gender: newGender });
                        }}
                      >
                        {gender}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={filters.location?.[0] || ""}
                    onValueChange={(value) =>
                      handleFilterChange({ ...filters, location: [value] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-york">New York</SelectItem>
                      <SelectItem value="los-angeles">Los Angeles</SelectItem>
                      <SelectItem value="chicago">Chicago</SelectItem>
                      <SelectItem value="houston">Houston</SelectItem>
                      <SelectItem value="miami">Miami</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                {/* Last Visit */}
                <div className="space-y-2">
                  <Label>Last Visit</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={filters.last_visit?.from || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          last_visit: {
                            ...filters.last_visit,
                            from: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      type="date"
                      value={filters.last_visit?.to || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          last_visit: {
                            ...filters.last_visit,
                            to: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Total Spent */}
                <div className="space-y-2">
                  <Label>Total Spent</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <Input
                        type="number"
                        placeholder="Min"
                        className="w-24"
                        value={filters.total_spent?.min || ""}
                        onChange={(e) =>
                          handleFilterChange({
                            ...filters,
                            total_spent: {
                              ...filters.total_spent,
                              min: parseInt(e.target.value) || undefined,
                            },
                          })
                        }
                      />
                    </div>
                    <span className="text-muted-foreground">to</span>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <Input
                        type="number"
                        placeholder="Max"
                        className="w-24"
                        value={filters.total_spent?.max || ""}
                        onChange={(e) =>
                          handleFilterChange({
                            ...filters,
                            total_spent: {
                              ...filters.total_spent,
                              max: parseInt(e.target.value) || undefined,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Visit Count */}
                <div className="space-y-2">
                  <Label>Number of Visits</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      placeholder="Min visits"
                      className="w-32"
                      value={filters.visit_count?.min || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          visit_count: {
                            ...filters.visit_count,
                            min: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      placeholder="Max visits"
                      className="w-32"
                      value={filters.visit_count?.max || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          visit_count: {
                            ...filters.visit_count,
                            max: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-4">
                {/* Contact Information */}
                <div className="space-y-3">
                  <Label>Contact Information</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_email"
                        checked={filters.has_email || false}
                        onCheckedChange={(checked) =>
                          handleFilterChange({ ...filters, has_email: checked as boolean })
                        }
                      />
                      <Label htmlFor="has_email" className="flex items-center cursor-pointer">
                        <Mail className="mr-2 h-4 w-4" />
                        Has email address
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_phone"
                        checked={filters.has_phone || false}
                        onCheckedChange={(checked) =>
                          handleFilterChange({ ...filters, has_phone: checked as boolean })
                        }
                      />
                      <Label htmlFor="has_phone" className="flex items-center cursor-pointer">
                        <Phone className="mr-2 h-4 w-4" />
                        Has phone number
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Loyalty Status */}
                <div className="space-y-2">
                  <Label>Loyalty Status</Label>
                  <div className="flex gap-2">
                    {["Bronze", "Silver", "Gold", "Platinum"].map((status) => (
                      <Button
                        key={status}
                        variant={filters.loyalty_status?.includes(status) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = filters.loyalty_status || [];
                          const newStatus = current.includes(status)
                            ? current.filter((s) => s !== status)
                            : [...current, status];
                          handleFilterChange({ ...filters, loyalty_status: newStatus });
                        }}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                {/* Communication Preferences */}
                <div className="space-y-3">
                  <Label>Communication Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email_opt_in"
                        checked={filters.email_opt_in || false}
                        onCheckedChange={(checked) =>
                          handleFilterChange({ ...filters, email_opt_in: checked as boolean })
                        }
                      />
                      <Label htmlFor="email_opt_in" className="cursor-pointer">
                        Opted in for email marketing
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sms_opt_in"
                        checked={filters.sms_opt_in || false}
                        onCheckedChange={(checked) =>
                          handleFilterChange({ ...filters, sms_opt_in: checked as boolean })
                        }
                      />
                      <Label htmlFor="sms_opt_in" className="cursor-pointer">
                        Opted in for SMS marketing
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Customer Tags</Label>
                  <div className="flex gap-2">
                    {["VIP", "Birthday Month", "New", "Referrer", "Frequent"].map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags?.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = filters.tags || [];
                          const newTags = current.includes(tag)
                            ? current.filter((t) => t !== tag)
                            : [...current, tag];
                          handleFilterChange({ ...filters, tags: newTags });
                        }}
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Audience Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audience Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{estimatedReach.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Estimated recipients</p>
            </div>
            <div className="text-right">
              {Object.keys(filters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    handleFilterChange({});
                  }}
                >
                  Clear filters
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {Object.keys(filters).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {filters.has_email && <Badge variant="secondary">Has Email</Badge>}
                {filters.has_phone && <Badge variant="secondary">Has Phone</Badge>}
                {filters.email_opt_in && <Badge variant="secondary">Email Opt-in</Badge>}
                {filters.sms_opt_in && <Badge variant="secondary">SMS Opt-in</Badge>}
                {filters.gender?.map((g) => (
                  <Badge key={g} variant="secondary">
                    Gender: {g}
                  </Badge>
                ))}
                {filters.age_range && (
                  <Badge variant="secondary">
                    Age: {filters.age_range.min || "0"}-{filters.age_range.max || "100"}
                  </Badge>
                )}
                {filters.visit_count && (
                  <Badge variant="secondary">
                    Visits: {filters.visit_count.min || "0"}+
                  </Badge>
                )}
                {filters.loyalty_status?.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s} Member
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {errors.audience && (
        <p className="text-sm text-destructive">{errors.audience}</p>
      )}
    </div>
  );
}

// Missing import
import { Textarea } from "@/components/ui/textarea";