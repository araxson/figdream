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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield, CheckCircle } from "lucide-react";
import type { RolePermissionsSectionProps } from "../profile-utils/profile-types";
import { roleFormSchema, type RoleFormData } from "../profile-utils/profile-validation";

export function RolePermissionsSection({
  user,
  availableRoles,
  canEditRole,
  isPending,
  onUpdate,
}: RolePermissionsSectionProps) {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      role: user.role || "customer",
      salon_id: user.user_roles?.[0]?.salon_id || "",
    },
  });

  const handleSubmit = async (values: RoleFormData) => {
    await onUpdate(values);
  };

  if (!canEditRole) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role & Permissions</CardTitle>
          <CardDescription>
            Manage user role and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to change user roles.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const currentRole = availableRoles.find((r) => r.name === user.role);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role & Permissions</CardTitle>
        <CardDescription>
          Manage user role and access permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          <div>
                            <div className="font-medium">{role.display_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {role.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The role determines what actions the user can perform
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {currentRole && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Current Permissions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {currentRole.permissions.map((perm, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 border rounded-md"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {perm.resource}: {perm.actions.join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isPending}
        >
          <Shield className="h-4 w-4 mr-2" />
          Update Role
        </Button>
      </CardFooter>
    </Card>
  );
}