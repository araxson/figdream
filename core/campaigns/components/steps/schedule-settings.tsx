"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  Clock,
  Calendar,
  Repeat,
  Globe,
  AlertCircle,
  Zap,
  Timer,
} from "lucide-react";
import type { CampaignData, ScheduleConfig } from "../../dal/campaigns-types";

interface ScheduleSettingsProps {
  data: Partial<CampaignData>;
  errors: Record<string, string>;
  onChange: (updates: Partial<CampaignData>) => void;
}

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona Time (AZ)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export function ScheduleSettings({ data, errors, onChange }: ScheduleSettingsProps) {
  const [schedule, setSchedule] = useState<ScheduleConfig>(
    data.schedule || { type: "immediate" }
  );

  const handleScheduleChange = (updates: Partial<ScheduleConfig>) => {
    const newSchedule = { ...schedule, ...updates };
    setSchedule(newSchedule);
    onChange({ schedule: newSchedule });
  };

  const handleScheduleTypeChange = (type: "immediate" | "scheduled" | "recurring") => {
    const newSchedule: ScheduleConfig = { type };

    // Set defaults based on type
    if (type === "scheduled") {
      // Default to tomorrow at 10 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      newSchedule.send_at = tomorrow.toISOString();
      newSchedule.timezone = "America/New_York";
    } else if (type === "recurring") {
      newSchedule.recurring = {
        frequency: "weekly",
        interval: 1,
        days_of_week: [1], // Monday
      };
      newSchedule.timezone = "America/New_York";
    }

    setSchedule(newSchedule);
    onChange({ schedule: newSchedule });
  };

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getNextSendTime = () => {
    if (schedule.type === "immediate") {
      return "Immediately after review";
    } else if (schedule.type === "scheduled" && schedule.send_at) {
      return formatDateTime(schedule.send_at);
    } else if (schedule.type === "recurring" && schedule.recurring) {
      const { frequency, interval, days_of_week } = schedule.recurring;
      if (frequency === "daily") {
        return `Every ${interval === 1 ? "" : interval} day(s) at the specified time`;
      } else if (frequency === "weekly" && days_of_week) {
        const days = days_of_week
          .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
          .join(", ");
        return `Every ${interval === 1 ? "" : interval} week(s) on ${days}`;
      } else if (frequency === "monthly") {
        return `Monthly on day ${schedule.recurring.day_of_month || 1}`;
      }
    }
    return "Not configured";
  };

  return (
    <div className="space-y-6">
      {/* Schedule Type Selection */}
      <RadioGroup
        value={schedule.type}
        onValueChange={(value) => handleScheduleTypeChange(value as any)}
      >
        <div className="grid gap-4">
          {/* Send Immediately */}
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start">
                <RadioGroupItem value="immediate" id="immediate" className="mt-1 mr-3" />
                <div className="flex-1">
                  <Label htmlFor="immediate" className="cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center">
                          <Zap className="mr-2 h-4 w-4" />
                          Send Immediately
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Campaign will be sent as soon as you click send
                        </p>
                      </div>
                      <Badge variant="secondary">Recommended</Badge>
                    </div>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule for Later */}
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start">
                <RadioGroupItem value="scheduled" id="scheduled" className="mt-1 mr-3" />
                <div className="flex-1">
                  <Label htmlFor="scheduled" className="cursor-pointer">
                    <div className="font-medium flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule for Later
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose a specific date and time to send
                    </p>
                  </Label>

                  {schedule.type === "scheduled" && (
                    <div className="mt-4 space-y-4 pl-7">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="send_date">Date</Label>
                          <Input
                            id="send_date"
                            type="date"
                            value={schedule.send_at ? schedule.send_at.split("T")[0] : ""}
                            onChange={(e) => {
                              const time = schedule.send_at
                                ? schedule.send_at.split("T")[1]
                                : "10:00";
                              handleScheduleChange({
                                send_at: `${e.target.value}T${time}`,
                              });
                            }}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="send_time">Time</Label>
                          <Input
                            id="send_time"
                            type="time"
                            value={
                              schedule.send_at
                                ? schedule.send_at.split("T")[1].substring(0, 5)
                                : ""
                            }
                            onChange={(e) => {
                              const date = schedule.send_at
                                ? schedule.send_at.split("T")[0]
                                : new Date().toISOString().split("T")[0];
                              handleScheduleChange({
                                send_at: `${date}T${e.target.value}:00.000Z`,
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={schedule.timezone || "America/New_York"}
                          onValueChange={(value) => handleScheduleChange({ timezone: value })}
                        >
                          <SelectTrigger id="timezone">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONES.map((tz) => (
                              <SelectItem key={tz.value} value={tz.value}>
                                <div className="flex items-center">
                                  <Globe className="mr-2 h-4 w-4" />
                                  {tz.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recurring Campaign */}
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start">
                <RadioGroupItem value="recurring" id="recurring" className="mt-1 mr-3" />
                <div className="flex-1">
                  <Label htmlFor="recurring" className="cursor-pointer">
                    <div className="font-medium flex items-center">
                      <Repeat className="mr-2 h-4 w-4" />
                      Recurring Campaign
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Automatically send on a regular schedule
                    </p>
                  </Label>

                  {schedule.type === "recurring" && schedule.recurring && (
                    <div className="mt-4 space-y-4 pl-7">
                      {/* Frequency */}
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select
                          value={schedule.recurring.frequency}
                          onValueChange={(value: any) =>
                            handleScheduleChange({
                              recurring: {
                                ...schedule.recurring!,
                                frequency: value,
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Interval */}
                      <div className="space-y-2">
                        <Label htmlFor="interval">Every</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="interval"
                            type="number"
                            min="1"
                            max="30"
                            value={schedule.recurring.interval}
                            onChange={(e) =>
                              handleScheduleChange({
                                recurring: {
                                  ...schedule.recurring!,
                                  interval: parseInt(e.target.value) || 1,
                                },
                              })
                            }
                            className="w-20"
                          />
                          <span>
                            {schedule.recurring.frequency === "daily"
                              ? "day(s)"
                              : schedule.recurring.frequency === "weekly"
                              ? "week(s)"
                              : "month(s)"}
                          </span>
                        </div>
                      </div>

                      {/* Days of Week (for weekly) */}
                      {schedule.recurring.frequency === "weekly" && (
                        <div className="space-y-2">
                          <Label>On these days</Label>
                          <div className="flex gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <Button
                                key={day.value}
                                variant={
                                  schedule.recurring?.days_of_week?.includes(day.value)
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => {
                                  const current = schedule.recurring!.days_of_week || [];
                                  const newDays = current.includes(day.value)
                                    ? current.filter((d) => d !== day.value)
                                    : [...current, day.value];
                                  handleScheduleChange({
                                    recurring: {
                                      ...schedule.recurring!,
                                      days_of_week: newDays,
                                    },
                                  });
                                }}
                              >
                                {day.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Day of Month (for monthly) */}
                      {schedule.recurring.frequency === "monthly" && (
                        <div className="space-y-2">
                          <Label htmlFor="day_of_month">On day</Label>
                          <Input
                            id="day_of_month"
                            type="number"
                            min="1"
                            max="31"
                            value={schedule.recurring.day_of_month || 1}
                            onChange={(e) =>
                              handleScheduleChange({
                                recurring: {
                                  ...schedule.recurring!,
                                  day_of_month: parseInt(e.target.value) || 1,
                                },
                              })
                            }
                            className="w-20"
                          />
                        </div>
                      )}

                      {/* End Date */}
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End date (optional)</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={schedule.recurring.end_date || ""}
                          onChange={(e) =>
                            handleScheduleChange({
                              recurring: {
                                ...schedule.recurring!,
                                end_date: e.target.value || undefined,
                              },
                            })
                          }
                          min={new Date().toISOString().split("T")[0]}
                        />
                        <p className="text-sm text-muted-foreground">
                          Leave empty for ongoing campaigns
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recurring_timezone">Timezone</Label>
                        <Select
                          value={schedule.timezone || "America/New_York"}
                          onValueChange={(value) => handleScheduleChange({ timezone: value })}
                        >
                          <SelectTrigger id="recurring_timezone">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONES.map((tz) => (
                              <SelectItem key={tz.value} value={tz.value}>
                                <div className="flex items-center">
                                  <Globe className="mr-2 h-4 w-4" />
                                  {tz.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </RadioGroup>

      {/* Batch Sending Options */}
      {schedule.type !== "recurring" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Timer className="mr-2 h-4 w-4" />
              Batch Sending
            </CardTitle>
            <CardDescription>
              Send to large audiences in smaller batches to improve deliverability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="batch_sending"
                checked={!!schedule.batch_size}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleScheduleChange({
                      batch_size: 100,
                      batch_delay: 5,
                    });
                  } else {
                    handleScheduleChange({
                      batch_size: undefined,
                      batch_delay: undefined,
                    });
                  }
                }}
              />
              <Label htmlFor="batch_sending" className="cursor-pointer">
                Enable batch sending
              </Label>
            </div>

            {schedule.batch_size && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="batch_size">Batch size</Label>
                  <Input
                    id="batch_size"
                    type="number"
                    min="10"
                    max="500"
                    value={schedule.batch_size}
                    onChange={(e) =>
                      handleScheduleChange({
                        batch_size: parseInt(e.target.value) || 100,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Recipients per batch</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch_delay">Delay between batches</Label>
                  <Input
                    id="batch_delay"
                    type="number"
                    min="1"
                    max="60"
                    value={schedule.batch_delay}
                    onChange={(e) =>
                      handleScheduleChange({
                        batch_delay: parseInt(e.target.value) || 5,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Summary */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Next send time:</strong> {getNextSendTime()}
          {schedule.timezone && (
            <span className="ml-2 text-muted-foreground">
              ({TIMEZONES.find((tz) => tz.value === schedule.timezone)?.label})
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Optimal Send Time Suggestion */}
      {schedule.type === "scheduled" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro tip:</strong> Based on your audience engagement patterns, the optimal send
            time is Tuesday-Thursday between 10 AM - 12 PM or 2 PM - 4 PM in your audience's local
            timezone.
          </AlertDescription>
        </Alert>
      )}

      {errors.schedule && <p className="text-sm text-destructive">{errors.schedule}</p>}
    </div>
  );
}