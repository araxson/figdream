"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Mail,
  Users,
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Link2,
  ExternalLink,
  Download,
  Share2,
  RefreshCw,
} from "lucide-react";
import type { CampaignAnalytics, Campaign } from "../dal/campaigns-types";

interface CampaignAnalyticsProps {
  campaign: Campaign;
  analytics: CampaignAnalytics;
  onRefresh?: () => void;
  onExport?: () => void;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function CampaignAnalyticsView({
  campaign,
  analytics,
  onRefresh,
  onExport,
}: CampaignAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<"opens" | "clicks" | "conversions">("opens");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("all");

  const metrics = analytics.metrics;

  const getMetricCard = (
    title: string,
    value: number | string,
    subtitle?: string,
    icon?: React.ReactNode,
    trend?: number
  ) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={`text-xs ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {Math.abs(trend)}% vs last campaign
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{campaign.name}</h2>
          <p className="text-muted-foreground">
            Sent {new Date(campaign.sent_at || "").toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {getMetricCard(
          "Recipients",
          metrics.recipients.toLocaleString(),
          "Total audience",
          <Users className="h-4 w-4 text-muted-foreground" />
        )}
        {getMetricCard(
          "Delivered",
          metrics.delivered.toLocaleString(),
          formatPercentage((metrics.delivered / metrics.sent) * 100) + " delivery rate",
          <Mail className="h-4 w-4 text-muted-foreground" />
        )}
        {getMetricCard(
          "Opens",
          metrics.opened.toLocaleString(),
          formatPercentage(metrics.open_rate) + " open rate",
          <Eye className="h-4 w-4 text-muted-foreground" />,
          15
        )}
        {getMetricCard(
          "Clicks",
          metrics.clicked.toLocaleString(),
          formatPercentage(metrics.click_rate) + " click rate",
          <MousePointer className="h-4 w-4 text-muted-foreground" />,
          8
        )}
        {getMetricCard(
          "Revenue",
          formatCurrency(metrics.revenue || 0),
          metrics.conversion_rate ? formatPercentage(metrics.conversion_rate) + " conversion" : undefined,
          <DollarSign className="h-4 w-4 text-muted-foreground" />,
          25
        )}
      </div>

      {/* Engagement Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Engagement Timeline</CardTitle>
            <Tabs value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as any)}>
              <TabsList>
                <TabsTrigger value="opens">Opens</TabsTrigger>
                <TabsTrigger value="clicks">Clicks</TabsTrigger>
                <TabsTrigger value="conversions">Conversions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.timeline}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) =>
                  new Date(value).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    hour12: true,
                  })
                }
              />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip
                labelFormatter={(value) =>
                  new Date(value).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                }
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Opens and clicks by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.devices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.device}: ${entry.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="opens"
                >
                  {analytics.devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              {analytics.devices.map((device, index) => (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm flex items-center gap-1">
                      {device.device === "Mobile" && <Smartphone className="h-4 w-4" />}
                      {device.device === "Desktop" && <Monitor className="h-4 w-4" />}
                      {device.device === "Tablet" && <Tablet className="h-4 w-4" />}
                      {device.device}
                    </span>
                  </div>
                  <div className="text-sm text-right">
                    <div>{device.opens.toLocaleString()} opens</div>
                    <div className="text-muted-foreground">{device.clicks.toLocaleString()} clicks</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <CardDescription>Engagement by geographic location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.locations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="opens" fill="#8884d8" name="Opens" />
                <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              {analytics.locations.map((location) => (
                <div key={location.location} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{location.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{location.percentage}%</Badge>
                    <div className="text-sm text-right">
                      <div>{location.opens} opens</div>
                      <div className="text-muted-foreground">{location.clicks} clicks</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link Performance */}
      {analytics.engagement.most_clicked_links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Link Performance</CardTitle>
            <CardDescription>Most clicked links in your campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link URL</TableHead>
                  <TableHead>Total Clicks</TableHead>
                  <TableHead>Unique Clicks</TableHead>
                  <TableHead>CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.engagement.most_clicked_links.map((link) => (
                  <TableRow key={link.url}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {link.url.length > 40 ? link.url.substring(0, 40) + "..." : link.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>{link.clicks.toLocaleString()}</TableCell>
                    <TableCell>{link.unique_clicks.toLocaleString()}</TableCell>
                    <TableCell>
                      {formatPercentage((link.unique_clicks / metrics.delivered) * 100)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Conversion Analytics */}
      {analytics.conversions && analytics.conversions.total_conversions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversion Analytics</CardTitle>
            <CardDescription>Revenue generated from campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Conversions</p>
                <p className="text-2xl font-bold">{analytics.conversions.total_conversions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.conversions.conversion_value)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    analytics.conversions.conversion_value / analytics.conversions.total_conversions
                  )}
                </p>
              </div>
            </div>

            {analytics.conversions.top_converting_services.length > 0 && (
              <>
                <h4 className="font-medium mb-3">Top Converting Services</h4>
                <div className="space-y-2">
                  {analytics.conversions.top_converting_services.map((service) => (
                    <div key={service.service_id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{service.service_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.conversions} bookings
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(service.revenue)}</p>
                        <Progress
                          value={(service.revenue / analytics.conversions.conversion_value) * 100}
                          className="h-2 w-24 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Campaign Type</dt>
              <dd className="font-medium capitalize">{campaign.type}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Subject Line</dt>
              <dd className="font-medium">{campaign.subject || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Sent Date</dt>
              <dd className="font-medium">
                {campaign.sent_at
                  ? new Date(campaign.sent_at).toLocaleString()
                  : "Not sent"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Peak Engagement Time</dt>
              <dd className="font-medium">{analytics.engagement.peak_engagement_time}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Average Read Time</dt>
              <dd className="font-medium">{analytics.engagement.average_read_time} seconds</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Unsubscribe Rate</dt>
              <dd className="font-medium">
                {formatPercentage((metrics.unsubscribed / metrics.delivered) * 100)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}