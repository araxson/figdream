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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Key,
  Smartphone,
  Globe,
  CheckCircle,
  XCircle,
  LogOut,
  Download,
  Lock,
  Monitor,
  MapPin,
  AlertCircle,
  Mail,
  Plus,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type {
  UserSecuritySettings,
  UserSession,
  LoginRecord,
  ApiKey,
} from "../dal/users-types";

interface SecurityCenterProps {
  userId: string;
  settings?: UserSecuritySettings;
  sessions?: UserSession[];
  loginHistory?: LoginRecord[];
  apiKeys?: ApiKey[];
  passwordStrength?: number;
}

export function SecurityCenter({
  userId,
  settings,
  sessions = [],
  loginHistory = [],
  apiKeys = [],
  passwordStrength = 70,
}: SecurityCenterProps) {
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(settings?.two_factor_enabled || false);
  const [showNewApiKey, setShowNewApiKey] = useState(false);
  const [newApiKeyValue, setNewApiKeyValue] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  // Mock active sessions
  const activeSessions: UserSession[] = sessions.length > 0 ? sessions : [
    {
      id: "1",
      user_id: userId,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      ip_address: "192.168.1.1",
      user_agent: "Chrome on Windows",
      location: "New York, US",
      is_current: true,
    },
    {
      id: "2",
      user_id: userId,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      last_active: new Date(Date.now() - 3600000).toISOString(),
      ip_address: "10.0.0.1",
      user_agent: "Safari on iPhone",
      location: "Los Angeles, US",
      is_current: false,
    },
  ];

  // Mock login history
  const recentLogins: LoginRecord[] = loginHistory.length > 0 ? loginHistory : [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      ip_address: "192.168.1.1",
      user_agent: "Chrome on Windows",
      location: "New York, US",
      status: "success",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      ip_address: "10.0.0.1",
      user_agent: "Safari on iPhone",
      location: "Los Angeles, US",
      status: "success",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      ip_address: "172.16.0.1",
      user_agent: "Firefox on Linux",
      status: "failed",
      failure_reason: "Invalid password",
    },
  ];

  const handleRevokeSession = async (_sessionId: string) => {
    try {
      // API call to revoke session
      toast.success("Session revoked successfully");
      setShowRevokeDialog(false);
      setSelectedSession(null);
    } catch (_error) {
      toast.error("Failed to revoke session");
    }
  };

  const handleRevokeAllSessions = () => {
    try {
      // API call to revoke all sessions
      toast.success("All sessions revoked successfully");
    } catch (_error) {
      toast.error("Failed to revoke sessions");
    }
  };

  const handleToggle2FA = () => {
    try {
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(
        twoFactorEnabled
          ? "Two-factor authentication disabled"
          : "Two-factor authentication enabled"
      );
    } catch (_error) {
      toast.error("Failed to update 2FA settings");
    }
  };

  const handleGenerateApiKey = () => {
    try {
      // Generate a mock API key
      const mockKey = "sk_live_" + Math.random().toString(36).substring(2, 15);
      setNewApiKeyValue(mockKey);
      setShowNewApiKey(true);
      toast.success("API key generated successfully");
    } catch (_error) {
      toast.error("Failed to generate API key");
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(newApiKeyValue);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "text-destructive";
    if (passwordStrength < 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return "Weak";
    if (passwordStrength < 70) return "Medium";
    return "Strong";
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passwordStrength}%</div>
            <Progress value={passwordStrength} className="mt-2 h-2" />
            <p className={`text-xs mt-1 ${getPasswordStrengthColor()}`}>
              {getPasswordStrengthLabel()} protection
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Devices logged in
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA Status</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </div>
            <p className="text-xs text-muted-foreground">
              {twoFactorEnabled ? "Account secured" : "Not configured"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
            <p className="text-xs text-muted-foreground">
              Active API keys
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Security Settings */}
      <Tabs defaultValue="authentication">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password & Authentication</CardTitle>
              <CardDescription>
                Manage your password and authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Password Strength</Label>
                    <p className="text-sm text-muted-foreground">
                      Last changed {settings?.password_last_changed || "Never"}
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                <Progress value={passwordStrength} className="h-2" />
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Use a strong password with at least 12 characters, including uppercase,
                    lowercase, numbers, and special characters.
                  </AlertDescription>
                </Alert>
              </div>

              {/* 2FA Settings */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggle2FA}
                  />
                </div>
                {twoFactorEnabled && (
                  <div className="space-y-3 pl-4">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">SMS to •••• ••• 4567</span>
                      <Button variant="ghost" size="sm">Configure</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recovery Options */}
              <div className="space-y-4 border-t pt-4">
                <Label>Recovery Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Recovery email</span>
                    </div>
                    <Button variant="ghost" size="sm">Add</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <span className="text-sm">Recovery codes</span>
                    </div>
                    <Button variant="ghost" size="sm">Generate</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Manage devices and locations where you&apos;re logged in
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllSessions}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Revoke All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-full">
                        <Monitor className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.user_agent}</span>
                          {session.is_current && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {session.ip_address}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Started: {new Date(session.created_at).toLocaleString()}
                          </span>
                          <span>
                            Last active: {new Date(session.last_active).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!session.is_current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSession(session.id);
                          setShowRevokeDialog(true);
                        }}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage API keys for programmatic access
                  </CardDescription>
                </div>
                <Button onClick={handleGenerateApiKey}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showNewApiKey && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>Your new API key has been generated. Copy it now - it won&apos;t be shown again.</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-muted rounded text-xs">
                          {newApiKeyValue}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyApiKey}
                        >
                          {copiedKey ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No API keys generated yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key Preview</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <code className="text-xs">{key.key_preview}</code>
                        </TableCell>
                        <TableCell>
                          {new Date(key.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {key.last_used
                            ? new Date(key.last_used).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={key.is_active ? "default" : "secondary"}>
                            {key.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Login Activity</CardTitle>
              <CardDescription>
                Recent login attempts and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogins.map((login) => (
                  <div
                    key={login.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          login.status === "success"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {login.status === "success" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {login.status === "success" ? "Successful login" : "Failed login attempt"}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{login.user_agent}</span>
                          <span>{login.ip_address}</span>
                          {login.location && <span>{login.location}</span>}
                        </div>
                        {login.failure_reason && (
                          <div className="text-sm text-destructive">
                            Reason: {login.failure_reason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(login.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Download className="h-4 w-4 mr-2" />
                Export Full Activity Log
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Revoke Session Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this session? The device will be logged out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedSession && handleRevokeSession(selectedSession)}
            >
              Revoke Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}