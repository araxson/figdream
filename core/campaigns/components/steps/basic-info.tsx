"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, Bell } from "lucide-react";
import type { CampaignData, CampaignType } from "../../dal/campaigns-types";

interface CampaignBasicInfoProps {
  data: Partial<CampaignData>;
  errors: Record<string, string>;
  onChange: (updates: Partial<CampaignData>) => void;
}

export function CampaignBasicInfo({ data, errors, onChange }: CampaignBasicInfoProps) {
  const handleTypeChange = (type: CampaignType) => {
    onChange({ type });
  };

  return (
    <div className="space-y-6">
      {/* Campaign Type Selection */}
      <div className="space-y-3">
        <Label>Campaign Type</Label>
        <RadioGroup
          value={data.type || "email"}
          onValueChange={handleTypeChange as (value: string) => void}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="flex items-center p-4">
                <RadioGroupItem value="email" id="email" className="mr-3" />
                <Label htmlFor="email" className="flex items-center cursor-pointer flex-1">
                  <Mail className="mr-2 h-5 w-5" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-xs text-muted-foreground">
                      Rich content with images
                    </div>
                  </div>
                </Label>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="flex items-center p-4">
                <RadioGroupItem value="sms" id="sms" className="mr-3" />
                <Label htmlFor="sms" className="flex items-center cursor-pointer flex-1">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  <div>
                    <div className="font-medium">SMS</div>
                    <div className="text-xs text-muted-foreground">
                      Quick text messages
                    </div>
                  </div>
                </Label>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="flex items-center p-4">
                <RadioGroupItem value="push" id="push" className="mr-3" />
                <Label htmlFor="push" className="flex items-center cursor-pointer flex-1">
                  <Bell className="mr-2 h-5 w-5" />
                  <div>
                    <div className="font-medium">Push</div>
                    <div className="text-xs text-muted-foreground">
                      Mobile notifications
                    </div>
                  </div>
                </Label>
              </CardContent>
            </Card>
          </div>
        </RadioGroup>
        {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
      </div>

      {/* Campaign Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Campaign Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Summer Sale 2024"
          value={data.name || ""}
          onChange={(e) => onChange({ name: e.target.value })}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        <p className="text-sm text-muted-foreground">
          Internal name to identify this campaign
        </p>
      </div>

      {/* Campaign Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the purpose and goals of this campaign..."
          value={data.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Optional: Add notes about this campaign for your team
        </p>
      </div>

      {/* Email Subject (only for email campaigns) */}
      {data.type === "email" && (
        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject Line *</Label>
          <Input
            id="subject"
            placeholder="e.g., 🌟 Exclusive offer just for you!"
            value={data.subject || ""}
            onChange={(e) => onChange({ subject: e.target.value })}
            className={errors.subject ? "border-destructive" : ""}
          />
          {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
          <p className="text-sm text-muted-foreground">
            This is what recipients will see in their inbox
          </p>
        </div>
      )}

      {/* Campaign Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          placeholder="e.g., promotion, summer, vip"
          value={data.settings?.tags?.join(", ") || ""}
          onChange={(e) =>
            onChange({
              settings: {
                ...data.settings,
                tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
              },
            })
          }
        />
        <p className="text-sm text-muted-foreground">
          Separate tags with commas to organize your campaigns
        </p>
      </div>
    </div>
  );
}