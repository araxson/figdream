import type {
  ProfileWithRelations,
  UserRoleType,
  UserActivity,
  RoleWithPermissions
} from "../../dal/users-types";

export interface UserProfileEditorProps {
  user: ProfileWithRelations;
  availableRoles?: RoleWithPermissions[];
  userActivity?: UserActivity[];
  canEditRole?: boolean;
  canEditSecurity?: boolean;
}

export interface ProfileHeaderProps {
  user: ProfileWithRelations;
  onClose: () => void;
}

export interface PersonalInfoSectionProps {
  user: ProfileWithRelations;
  isPending: boolean;
  onUpdate: (values: any) => Promise<void>;
  onVerifyEmail: () => Promise<void>;
}

export interface ContactInfoSectionProps {
  user: ProfileWithRelations;
  isPending: boolean;
  onUpdate: (values: any) => Promise<void>;
}

export interface SecuritySectionProps {
  user: ProfileWithRelations;
  canEditSecurity: boolean;
  isPending: boolean;
  onUpdate: (values: any) => Promise<void>;
}

export interface PreferencesSectionProps {
  user: ProfileWithRelations;
  isPending: boolean;
  onUpdate: (values: any) => Promise<void>;
}

export interface NotificationSettingsSectionProps {
  isPending: boolean;
  onUpdate: (values: any) => Promise<void>;
}

export interface RolePermissionsSectionProps {
  user: ProfileWithRelations;
  availableRoles: RoleWithPermissions[];
  canEditRole: boolean;
  isPending: boolean;
  onUpdate: (values: { role: string; salon_id?: string }) => Promise<void>;
}

export interface ActivitySectionProps {
  userActivity: UserActivity[];
}

export type TabValue = "personal" | "role" | "security" | "notifications" | "activity";