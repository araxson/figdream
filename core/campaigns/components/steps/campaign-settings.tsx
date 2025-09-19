"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Eye,
  MousePointer,
  UserX,
  Reply,
  TestTube,
  BarChart,
  Info,
  Mail,
  User,
  Shield,
  Zap,
  Plus,
  X,
} from "lucide-react";
import type { CampaignData, CampaignSettings, ABTestConfig } from "../../dal/campaigns-types";

interface CampaignSettingsProps {
  data: Partial<CampaignData>;
  errors: Record<string, string>;
  onChange: (updates: Partial<CampaignData>) => void;
}

export function CampaignSettings({ data, errors, onChange }: CampaignSettingsProps) {
  const [settings, setSettings] = useState<CampaignSettings>(
    data.settings || {
      track_opens: true,
      track_clicks: true,
      unsubscribe_link: true,
    }
  );
  const [testEmails, setTestEmails] = useState<string[]>(
    settings.test_recipients || []
  );
  const [newTestEmail, setNewTestEmail] = useState("");
  const [abTestEnabled, setAbTestEnabled] = useState(!!settings.ab_testing?.enabled);

  const handleSettingsChange = (updates: Partial<CampaignSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onChange({ settings: newSettings });
  };

  const addTestEmail = () => {
    if (newTestEmail && !testEmails.includes(newTestEmail)) {
      const newEmails = [...testEmails, newTestEmail];
      setTestEmails(newEmails);
      handleSettingsChange({ test_recipients: newEmails });
      setNewTestEmail("");
    }
  };

  const removeTestEmail = (email: string) => {
    const newEmails = testEmails.filter((e) => e !== email);
    setTestEmails(newEmails);
    handleSettingsChange({ test_recipients: newEmails });
  };

  const handleABTestToggle = (enabled: boolean) => {
    setAbTestEnabled(enabled);
    if (enabled) {
      handleSettingsChange({
        ab_testing: {
          enabled: true,
          variants: [
            { id: "A", name: "Variant A", subject: data.subject },
            { id: "B", name: "Variant B", subject: data.subject },
          ],
          test_size: 20,
          winning_metric: "opens",
          test_duration: 4,
        },
      });
    } else {
      handleSettingsChange({ ab_testing: undefined });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tracking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <BarChart className="mr-2 h-4 w-4" />
            Tracking & Analytics
          </CardTitle>
          <CardDescription>
            Configure how you want to track campaign performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.type === "email" && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="track_opens" className="text-base font-normal flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    Track Opens
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Monitor when recipients open your emails
                  </p>
                </div>
                <Switch
                  id="track_opens"
                  checked={settings.track_opens}
                  onCheckedChange={(checked) => handleSettingsChange({ track_opens: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="track_clicks" className="text-base font-normal flex items-center">
                    <MousePointer className="mr-2 h-4 w-4" />
                    Track Clicks
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    See which links recipients click
                  </p>
                </div>
                <Switch
                  id="track_clicks"
                  checked={settings.track_clicks}
                  onCheckedChange={(checked) => handleSettingsChange({ track_clicks: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="unsubscribe_link"
                    className="text-base font-normal flex items-center"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Include Unsubscribe Link
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Required for marketing emails (CAN-SPAM compliance)
                  </p>
                </div>
                <Switch
                  id="unsubscribe_link"
                  checked={settings.unsubscribe_link}
                  onCheckedChange={(checked) => handleSettingsChange({ unsubscribe_link: checked })}
                />
              </div>
            </>
          )}

          {data.type === "sms" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                SMS campaigns automatically include opt-out instructions to comply with regulations.
                Reply STOP will be honored.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sender Settings */}
      {data.type === "email" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Sender Information
            </CardTitle>
            <CardDescription>
              Customize how your email appears to recipients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  placeholder="Your Salon Name"
                  value={settings.from_name || ""}
                  onChange={(e) => handleSettingsChange({ from_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from_email">From Email</Label>
                <Input
                  id="from_email"
                  type="email"
                  placeholder="noreply@yoursalon.com"
                  value={settings.from_email || ""}
                  onChange={(e) => handleSettingsChange({ from_email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reply_to">Reply-To Email</Label>
              <Input
                id="reply_to"
                type="email"
                placeholder="support@yoursalon.com"
                value={settings.reply_to || ""}
                onChange={(e) => handleSettingsChange({ reply_to: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Where replies to this campaign should be sent
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <TestTube className="mr-2 h-4 w-4" />
            Test Campaign
          </CardTitle>
          <CardDescription>Send test messages before launching</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="test_mode" className="text-base font-normal">
                Test Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Send only to test recipients for review
              </p>
            </div>
            <Switch
              id="test_mode"
              checked={settings.test_mode}
              onCheckedChange={(checked) => handleSettingsChange({ test_mode: checked })}
            />
          </div>

          {settings.test_mode && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Test Recipients</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={data.type === "email" ? "test@example.com" : "+1234567890"}
                    value={newTestEmail}
                    onChange={(e) => setNewTestEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTestEmail()}
                  />
                  <Button onClick={addTestEmail} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {testEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="pl-2 pr-1">
                      {email}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 px-1"
                        onClick={() => removeTestEmail(email)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                {testEmails.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add email addresses or phone numbers to receive test messages
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* A/B Testing */}
      {data.type === "email" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Zap className="mr-2 h-4 w-4" />
              A/B Testing
            </CardTitle>
            <CardDescription>Test different versions to optimize performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ab_testing" className="text-base font-normal">
                  Enable A/B Testing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Test subject lines and content variations
                </p>
              </div>
              <Switch
                id="ab_testing"
                checked={abTestEnabled}
                onCheckedChange={handleABTestToggle}
              />
            </div>

            {abTestEnabled && settings.ab_testing && (
              <>
                <Separator />

                {/* Test Size */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Test Group Size</Label>
                    <span className="text-sm font-medium">{settings.ab_testing.test_size}%</span>
                  </div>
                  <Slider
                    value={[settings.ab_testing.test_size]}
                    onValueChange={([value]) =>
                      handleSettingsChange({
                        ab_testing: {
                          ...settings.ab_testing!,
                          test_size: value,
                        },
                      })
                    }
                    min={10}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    {settings.ab_testing.test_size}% of recipients will be in the test.
                    The winning variant will be sent to the remaining{" "}
                    {100 - settings.ab_testing.test_size}%.
                  </p>
                </div>

                {/* Winning Metric */}
                <div className="space-y-2">
                  <Label>Winning Metric</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "opens", label: "Open Rate" },
                      { value: "clicks", label: "Click Rate" },
                      { value: "conversions", label: "Conversions" },
                    ].map((metric) => (
                      <Button
                        key={metric.value}
                        variant={
                          settings.ab_testing?.winning_metric === metric.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          handleSettingsChange({
                            ab_testing: {
                              ...settings.ab_testing!,
                              winning_metric: metric.value as any,
                            },
                          })
                        }
                      >
                        {metric.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Test Duration */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Test Duration</Label>
                    <span className="text-sm font-medium">
                      {settings.ab_testing.test_duration} hours
                    </span>
                  </div>
                  <Slider
                    value={[settings.ab_testing.test_duration]}
                    onValueChange={([value]) =>
                      handleSettingsChange({
                        ab_testing: {
                          ...settings.ab_testing!,
                          test_duration: value,
                        },
                      })
                    }
                    min={1}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    After {settings.ab_testing.test_duration} hours, the winning variant will be
                    automatically selected and sent.
                  </p>
                </div>

                {/* Variants */}
                <div className="space-y-2">
                  <Label>Variants</Label>
                  <div className="space-y-2">
                    {settings.ab_testing.variants.map((variant, index) => (
                      <div
                        key={variant.id}
                        className="flex items-center gap-2 p-2 rounded-lg border"
                      >
                        <Badge variant="outline" className="w-16 justify-center">
                          {variant.name}
                        </Badge>
                        <Input
                          placeholder={`Subject line for ${variant.name}`}
                          value={variant.subject || ""}
                          onChange={(e) => {
                            const newVariants = [...settings.ab_testing!.variants];
                            newVariants[index] = { ...variant, subject: e.target.value };
                            handleSettingsChange({
                              ab_testing: {
                                ...settings.ab_testing!,
                                variants: newVariants,
                              },
                            });
                          }}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Advanced Settings
          </CardTitle>
          <CardDescription>Additional campaign configuration options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {data.type === "email" && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preheader"
                    checked={!!settings.preheader_text}
                    onCheckedChange={(checked) =>
                      handleSettingsChange({
                        preheader_text: checked ? "" : undefined,
                      })
                    }
                  />
                  <Label htmlFor="preheader" className="cursor-pointer">
                    Add preheader text (preview text in inbox)
                  </Label>
                </div>
                {settings.preheader_text !== undefined && (
                  <Input
                    placeholder="This text appears in the inbox preview..."
                    value={settings.preheader_text || ""}
                    onChange={(e) => handleSettingsChange({ preheader_text: e.target.value })}
                    className="ml-6"
                  />
                )}
              </>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="suppress_duplicates"
                checked={settings.suppress_duplicates !== false}
                onCheckedChange={(checked) =>
                  handleSettingsChange({ suppress_duplicates: checked })
                }
              />
              <Label htmlFor="suppress_duplicates" className="cursor-pointer">
                Suppress duplicate sends (prevent sending to same person twice)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="respect_quiet_hours"
                checked={settings.respect_quiet_hours !== false}
                onCheckedChange={(checked) =>
                  handleSettingsChange({ respect_quiet_hours: checked })
                }
              />
              <Label htmlFor="respect_quiet_hours" className="cursor-pointer">
                Respect quiet hours (avoid sending late night/early morning)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Campaign Settings:</strong>
          <div className="mt-2 space-y-1">
            {settings.track_opens && <div>• Open tracking enabled</div>}
            {settings.track_clicks && <div>• Click tracking enabled</div>}
            {settings.unsubscribe_link && <div>• Unsubscribe link included</div>}
            {settings.test_mode && <div>• Test mode active ({testEmails.length} recipients)</div>}
            {abTestEnabled && <div>• A/B testing enabled</div>}
          </div>
        </AlertDescription>
      </Alert>

      {errors.settings && <p className="text-sm text-destructive">{errors.settings}</p>}
    </div>
  );
}