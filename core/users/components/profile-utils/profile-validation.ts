import * as z from "zod";

export const profileFormSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  display_name: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  date_of_birth: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  country_code: z.string().length(2).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

export const roleFormSchema = z.object({
  role: z.string(),
  salon_id: z.string().optional(),
});

export const securityFormSchema = z.object({
  two_factor_enabled: z.boolean(),
  two_factor_method: z.enum(["sms", "email", "app"]).optional(),
  require_password_change: z.boolean(),
});

export const notificationFormSchema = z.object({
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  push_notifications: z.boolean(),
  marketing_emails: z.boolean(),
  security_alerts: z.boolean(),
  appointment_reminders: z.boolean(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type RoleFormData = z.infer<typeof roleFormSchema>;
export type SecurityFormData = z.infer<typeof securityFormSchema>;
export type NotificationFormData = z.infer<typeof notificationFormSchema>;