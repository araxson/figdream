"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { UserProfileEditorProps, TabValue } from "./profile-utils/profile-types";
import type { UserRoleType } from "../dal/users-types";
import {
  updateUserAction,
  updateUserRoleAction,
  verifyEmailAction,
  updateSecuritySettingsAction
} from "../actions";

import { ProfileHeader } from "./profile-sections/profile-header";
import { PersonalInfoSection } from "./profile-sections/personal-info-section";
import { RolePermissionsSection } from "./profile-sections/role-permissions-section";
import { SecuritySection } from "./profile-sections/security-section";
import { NotificationSettingsSection } from "./profile-sections/notification-settings-section";
import { ActivitySection } from "./profile-sections/activity-section";

export function UserProfileEditor({
  user,
  availableRoles = [],
  userActivity = [],
  canEditRole = false,
  canEditSecurity = false,
}: UserProfileEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabValue>("personal");

  const handleProfileUpdate = async (values: any) => {
    startTransition(async () => {
      try {
        await updateUserAction(user.id, values);
        toast.success("Profile updated successfully");
        router.refresh();
      } catch (error) {
        toast.error("Failed to update profile");
      }
    });
  };

  const handleRoleUpdate = async (values: { role: string; salon_id?: string }) => {
    startTransition(async () => {
      try {
        await updateUserRoleAction(user.id, values.role as UserRoleType, values.salon_id);
        toast.success("Role updated successfully");
        router.refresh();
      } catch (error) {
        toast.error("Failed to update role");
      }
    });
  };

  const handleSecurityUpdate = async (values: any) => {
    startTransition(async () => {
      try {
        await updateSecuritySettingsAction(user.id, values);
        toast.success("Security settings updated");
        router.refresh();
      } catch (error) {
        toast.error("Failed to update security settings");
      }
    });
  };

  const handleNotificationUpdate = async (values: any) => {
    startTransition(async () => {
      try {
        toast.success("Notification preferences updated");
        router.refresh();
      } catch (error) {
        toast.error("Failed to update preferences");
      }
    });
  };

  const handleVerifyEmail = async () => {
    startTransition(async () => {
      try {
        await verifyEmailAction(user.id);
        toast.success("Email verified successfully");
        router.refresh();
      } catch (error) {
        toast.error("Failed to verify email");
      }
    });
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <ProfileHeader user={user} onClose={handleClose} />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="role">Role & Permissions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <PersonalInfoSection
            user={user}
            isPending={isPending}
            onUpdate={handleProfileUpdate}
            onVerifyEmail={handleVerifyEmail}
          />
        </TabsContent>

        <TabsContent value="role" className="space-y-4">
          <RolePermissionsSection
            user={user}
            availableRoles={availableRoles}
            canEditRole={canEditRole}
            isPending={isPending}
            onUpdate={handleRoleUpdate}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySection
            user={user}
            canEditSecurity={canEditSecurity}
            isPending={isPending}
            onUpdate={handleSecurityUpdate}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettingsSection
            isPending={isPending}
            onUpdate={handleNotificationUpdate}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ActivitySection userActivity={userActivity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}