"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mail,
  MessageSquare,
  Users,
  Calendar,
  Clock,
  Settings,
  Send,
  AlertTriangle,
  CheckCircle,
  Eye,
  MousePointer,
  TestTube,
  Zap,
  DollarSign,
  ChevronRight,
  FileText,
  Target,
} from "lucide-react";
import type { CampaignData } from "../../dal/campaigns-types";

interface ReviewAndSendProps {
  data: Partial<CampaignData>;
  onSend: () => Promise<void>;
}

export function ReviewAndSend({ data, onSend }: ReviewAndSendProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!isConfirmed) return;

    setIsSending(true);
    setSendError(null);

    try {
      await onSend();
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Failed to send campaign");
    } finally {
      setIsSending(false);
    }
  };

  const getScheduleDescription = () => {
    if (data.schedule?.type === "immediate") {
      return "Send immediately";
    } else if (data.schedule?.type === "scheduled") {
      const date = data.schedule.send_at ? new Date(data.schedule.send_at) : null;
      return date
        ? `Scheduled for ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
        : "Schedule not set";
    } else if (data.schedule?.type === "recurring") {
      return `Recurring ${data.schedule.recurring?.frequency}`;
    }
    return "Not configured";
  };

  const getAudienceDescription = () => {
    if (data.audience?.type === "all") {
      return "All customers";
    } else if (data.audience?.type === "segment") {
      const count = data.audience.segments?.length || 0;
      return `${count} segment${count === 1 ? "" : "s"} selected`;
    } else if (data.audience?.type === "custom") {
      const count = data.audience.custom_list?.length || 0;
      return `${count} custom recipient${count === 1 ? "" : "s"}`;
    }
    return "Not configured";
  };

  const estimatedCost = () => {
    const recipients = data.audience?.estimated_reach || 0;
    if (data.type === "email") {
      return (recipients * 0.001).toFixed(2); // $0.001 per email
    } else if (data.type === "sms") {
      return (recipients * 0.01).toFixed(2); // $0.01 per SMS
    }
    return "0.00";
  };

  const warnings = [];
  const recommendations = [];

  // Check for warnings
  if (!data.audience?.estimated_reach || data.audience.estimated_reach === 0) {
    warnings.push("No recipients selected");
  }
  if (data.settings?.test_mode) {
    warnings.push("Test mode is enabled - campaign will only be sent to test recipients");
  }
  if (!data.content || data.content.length < 10) {
    warnings.push("Campaign content is very short");
  }
  if (data.type === "email" && !data.settings?.unsubscribe_link) {
    warnings.push("Unsubscribe link not included (required for marketing emails)");
  }

  // Add recommendations
  if (!data.settings?.track_opens && data.type === "email") {
    recommendations.push("Enable open tracking to monitor engagement");
  }
  if (!data.settings?.track_clicks && data.type === "email") {
    recommendations.push("Enable click tracking to measure conversions");
  }
  if (data.schedule?.type === "immediate") {
    recommendations.push("Consider scheduling for optimal engagement times");
  }
  if (!data.settings?.ab_testing?.enabled && data.type === "email") {
    recommendations.push("Try A/B testing to optimize subject lines");
  }

  return (
    <div className="space-y-6">
      {/* Campaign Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
          <CardDescription>Review your campaign details before sending</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center mb-3">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Campaign Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{data.name || "Untitled Campaign"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <div className="flex items-center gap-2">
                  {data.type === "email" ? (
                    <>
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Email</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">SMS</span>
                    </>
                  )}
                </div>
              </div>
              {data.type === "email" && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Subject</p>
                  <p className="font-medium">{data.subject || "No subject"}</p>
                </div>
              )}
              {data.description && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Description</p>
                  <p className="font-medium">{data.description}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Content Preview */}
          <div>
            <div className="flex items-center mb-3">
              <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Content Preview</h3>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <ScrollArea className="h-32">
                  <p className="text-sm whitespace-pre-wrap">
                    {data.content?.substring(0, 500) || "No content"}
                    {data.content && data.content.length > 500 && "..."}
                  </p>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Audience */}
          <div>
            <div className="flex items-center mb-3">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Audience</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{getAudienceDescription()}</p>
                <p className="text-sm text-muted-foreground">
                  Estimated reach: {data.audience?.estimated_reach?.toLocaleString() || 0}{" "}
                  recipients
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                <Target className="mr-2 h-4 w-4" />
                {data.audience?.estimated_reach?.toLocaleString() || 0}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          <div>
            <div className="flex items-center mb-3">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Schedule</h3>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">{getScheduleDescription()}</p>
              {data.schedule?.type === "immediate" ? (
                <Badge variant="default">
                  <Zap className="mr-1 h-3 w-3" />
                  Ready to Send
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Calendar className="mr-1 h-3 w-3" />
                  Scheduled
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div>
            <div className="flex items-center mb-3">
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Settings</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {data.type === "email" && (
                <>
                  <div className="flex items-center">
                    {data.settings?.track_opens ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>Open tracking</span>
                  </div>
                  <div className="flex items-center">
                    {data.settings?.track_clicks ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>Click tracking</span>
                  </div>
                  <div className="flex items-center">
                    {data.settings?.unsubscribe_link ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                    )}
                    <span>Unsubscribe link</span>
                  </div>
                </>
              )}
              {data.settings?.test_mode && (
                <div className="flex items-center col-span-2">
                  <TestTube className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="font-medium">Test mode enabled</span>
                </div>
              )}
              {data.settings?.ab_testing?.enabled && (
                <div className="flex items-center col-span-2">
                  <Zap className="mr-2 h-4 w-4 text-purple-600" />
                  <span className="font-medium">A/B testing enabled</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Cost */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            Estimated Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">${estimatedCost()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {data.audience?.estimated_reach?.toLocaleString() || 0} recipients
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>
                {data.type === "email" ? "$0.001" : "$0.01"} per {data.type === "email" ? "email" : "SMS"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warnings</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Send Error */}
      {sendError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Send Failed</AlertTitle>
          <AlertDescription>{sendError}</AlertDescription>
        </Alert>
      )}

      {/* Confirmation */}
      <Card className={isConfirmed ? "border-primary" : ""}>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="confirm"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
              disabled={isSending}
            />
            <div className="space-y-1">
              <Label htmlFor="confirm" className="cursor-pointer">
                I confirm that I have reviewed all campaign details and want to send this campaign
              </Label>
              <p className="text-sm text-muted-foreground">
                {data.settings?.test_mode
                  ? "This will send the campaign to test recipients only."
                  : data.schedule?.type === "immediate"
                  ? "This will immediately send the campaign to all selected recipients."
                  : "This will schedule the campaign to be sent at the specified time."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSend}
          disabled={!isConfirmed || isSending || warnings.includes("No recipients selected")}
          className="min-w-[200px]"
        >
          {isSending ? (
            <>Sending...</>
          ) : data.schedule?.type === "immediate" ? (
            <>
              <Send className="mr-2 h-5 w-5" />
              Send Campaign Now
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Campaign
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {data.settings?.test_mode ? (
            <>
              <TestTube className="inline mr-1 h-3 w-3" />
              Test mode is enabled. Only test recipients will receive this campaign.
            </>
          ) : (
            <>
              <ChevronRight className="inline mr-1 h-3 w-3" />
              Once sent, campaigns cannot be cancelled or modified.
            </>
          )}
        </p>
      </div>
    </div>
  );
}