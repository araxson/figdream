"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock, Key } from "lucide-react";
import type { SecuritySectionProps } from "../profile-utils/profile-types";
import { securityFormSchema, type SecurityFormData } from "../profile-utils/profile-validation";
import { formatDate } from "../profile-utils/profile-helpers";

export function SecuritySection({
  user,
  canEditSecurity,
  isPending,
  onUpdate,
}: SecuritySectionProps) {
  const form = useForm<SecurityFormData>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      two_factor_enabled: false,
      two_factor_method: "email",
      require_password_change: false,
    },
  });

  const handleSubmit = async (values: SecurityFormData) => {
    await onUpdate(values);
  };

  if (!canEditSecurity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Configure account security and authentication options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to modify security settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure account security and authentication options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="two_factor_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Two-Factor Authentication
                    </FormLabel>
                    <FormDescription>
                      Require additional verification for account access
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("two_factor_enabled") && (
              <FormField
                control={form.control}
                name="two_factor_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2FA Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="app">Authenticator App</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="require_password_change"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Require Password Change
                    </FormLabel>
                    <FormDescription>
                      Force user to change password on next login
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Password Last Changed</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(user.password_changed_at)}
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Active Sessions</h4>
              <div className="text-sm text-muted-foreground">
                {user.session_count || 0} active sessions
              </div>
              <Button type="button" variant="outline" size="sm">
                Revoke All Sessions
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isPending}
        >
          <Lock className="h-4 w-4 mr-2" />
          Update Security
        </Button>
      </CardFooter>
    </Card>
  );
}