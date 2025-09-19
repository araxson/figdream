"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  MessageSquare,
  MoreVertical,
  Search,
  Plus,
  Send,
  Clock,
  Users,
  Eye,
  MousePointer,
  Copy,
  Trash,
  Edit,
  BarChart,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  PauseCircle,
  Filter,
  ChevronRight,
} from "lucide-react";
import type { Campaign, CampaignStatus, CampaignType } from "../dal/campaigns-types";

interface CampaignsListProps {
  campaigns: Campaign[];
  onEdit?: (campaign: Campaign) => void;
  onDuplicate?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
  onViewAnalytics?: (campaign: Campaign) => void;
  onSend?: (campaign: Campaign) => void;
  onCreateNew?: () => void;
}

export function CampaignsList({
  campaigns,
  onEdit,
  onDuplicate,
  onDelete,
  onViewAnalytics,
  onSend,
  onCreateNew,
}: CampaignsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<CampaignType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | "all">("all");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      searchQuery === "" ||
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || campaign.type === filterType;
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case "draft":
        return <AlertCircle className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "sending":
        return <Send className="h-4 w-4 animate-pulse" />;
      case "sent":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "paused":
        return <PauseCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: CampaignStatus): string => {
    switch (status) {
      case "draft":
        return "secondary";
      case "scheduled":
        return "outline";
      case "sending":
        return "default";
      case "sent":
        return "success";
      case "failed":
        return "destructive";
      case "paused":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getTypeIcon = (type: CampaignType) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMetric = (value: number | undefined, suffix = "") => {
    if (value === undefined) return "-";
    return `${value.toLocaleString()}${suffix}`;
  };

  if (campaigns.length === 0 && !searchQuery && filterType === "all" && filterStatus === "all") {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
        <p className="mt-2 text-muted-foreground">
          Create your first campaign to start engaging with customers
        </p>
        <Button className="mt-4" onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No campaigns found</h3>
          <p className="mt-2 text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : view === "grid" ? (
        /* Grid View */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    {campaign.description && (
                      <CardDescription className="text-sm">
                        {campaign.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {campaign.status === "draft" && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit?.(campaign)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSend?.(campaign)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => onDuplicate?.(campaign)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      {campaign.status === "sent" && (
                        <DropdownMenuItem onClick={() => onViewAnalytics?.(campaign)}>
                          <BarChart className="mr-2 h-4 w-4" />
                          View Analytics
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(campaign)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status and Type */}
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(campaign.status) as any}>
                    {getStatusIcon(campaign.status)}
                    <span className="ml-1 capitalize">{campaign.status}</span>
                  </Badge>
                  <Badge variant="outline">
                    {getTypeIcon(campaign.type)}
                    <span className="ml-1 capitalize">{campaign.type}</span>
                  </Badge>
                </div>

                {/* Metrics (if sent) */}
                {campaign.metrics && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center text-muted-foreground">
                        <Users className="h-3 w-3" />
                      </div>
                      <p className="text-sm font-medium">{formatMetric(campaign.metrics.sent)}</p>
                      <p className="text-xs text-muted-foreground">Sent</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-muted-foreground">
                        <Eye className="h-3 w-3" />
                      </div>
                      <p className="text-sm font-medium">
                        {formatMetric(campaign.metrics.open_rate, "%")}
                      </p>
                      <p className="text-xs text-muted-foreground">Open Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-muted-foreground">
                        <MousePointer className="h-3 w-3" />
                      </div>
                      <p className="text-sm font-medium">
                        {formatMetric(campaign.metrics.click_rate, "%")}
                      </p>
                      <p className="text-xs text-muted-foreground">Click Rate</p>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {campaign.scheduled_at && campaign.status === "scheduled" && (
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      Scheduled: {formatDate(campaign.scheduled_at)}
                    </div>
                  )}
                  {campaign.sent_at && campaign.status === "sent" && (
                    <div className="flex items-center">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Sent: {formatDate(campaign.sent_at)}
                    </div>
                  )}
                  {campaign.status === "draft" && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Created: {formatDate(campaign.created_at)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Click Rate</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      {campaign.description && (
                        <p className="text-sm text-muted-foreground">{campaign.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTypeIcon(campaign.type)}
                      <span className="ml-1 capitalize">{campaign.type}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(campaign.status) as any}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1 capitalize">{campaign.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{formatMetric(campaign.metrics?.sent)}</TableCell>
                  <TableCell>{formatMetric(campaign.metrics?.open_rate, "%")}</TableCell>
                  <TableCell>{formatMetric(campaign.metrics?.click_rate, "%")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {campaign.sent_at
                      ? formatDate(campaign.sent_at)
                      : campaign.scheduled_at
                      ? formatDate(campaign.scheduled_at)
                      : formatDate(campaign.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {campaign.status === "draft" && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit?.(campaign)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSend?.(campaign)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => onDuplicate?.(campaign)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {campaign.status === "sent" && (
                          <DropdownMenuItem onClick={() => onViewAnalytics?.(campaign)}>
                            <BarChart className="mr-2 h-4 w-4" />
                            Analytics
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(campaign)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}