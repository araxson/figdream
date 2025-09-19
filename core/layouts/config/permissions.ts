import type { UserRole } from "./navigation/types";

export interface Permission {
  resource: string;
  actions: ("create" | "read" | "update" | "delete")[];
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  features: string[];
}

// Define permissions for each role
export const rolePermissions: Record<UserRole, RolePermissions> = {
  super_admin: {
    role: "super_admin",
    permissions: [
      { resource: "platform", actions: ["create", "read", "update", "delete"] },
      { resource: "users", actions: ["create", "read", "update", "delete"] },
      { resource: "salons", actions: ["create", "read", "update", "delete"] },
      {
        resource: "subscriptions",
        actions: ["create", "read", "update", "delete"],
      },
      { resource: "pricing", actions: ["create", "read", "update", "delete"] },
      { resource: "analytics", actions: ["read"] },
      { resource: "system", actions: ["create", "read", "update", "delete"] },
    ],
    features: [
      "platform_management",
      "user_management",
      "salon_management",
      "subscription_management",
      "pricing_management",
      "platform_analytics",
      "system_health",
      "audit_logs",
      "admin_team_management",
    ],
  },

  salon_owner: {
    role: "salon_owner",
    permissions: [
      { resource: "salon", actions: ["read", "update"] },
      {
        resource: "appointments",
        actions: ["create", "read", "update", "delete"],
      },
      {
        resource: "customers",
        actions: ["create", "read", "update", "delete"],
      },
      { resource: "staff", actions: ["create", "read", "update", "delete"] },
      { resource: "services", actions: ["create", "read", "update", "delete"] },
      {
        resource: "inventory",
        actions: ["create", "read", "update", "delete"],
      },
      { resource: "analytics", actions: ["read"] },
      { resource: "revenue", actions: ["read"] },
      { resource: "settings", actions: ["read", "update"] },
      { resource: "team", actions: ["create", "read", "update", "delete"] },
    ],
    features: [
      "appointment_management",
      "customer_management",
      "staff_management",
      "service_management",
      "inventory_management",
      "location_management",
      "analytics_full",
      "revenue_management",
      "marketing_campaigns",
      "reviews_management",
      "reports_full",
      "settings_full",
      "team_management",
    ],
  },

  salon_manager: {
    role: "salon_manager",
    permissions: [
      {
        resource: "appointments",
        actions: ["create", "read", "update", "delete"],
      },
      { resource: "customers", actions: ["create", "read", "update"] },
      { resource: "staff", actions: ["read", "update"] },
      { resource: "services", actions: ["read", "update"] },
      { resource: "inventory", actions: ["read", "update"] },
      { resource: "analytics", actions: ["read"] },
      { resource: "reviews", actions: ["read", "update"] },
    ],
    features: [
      "appointment_management",
      "customer_management",
      "staff_scheduling",
      "service_management",
      "inventory_management",
      "analytics_limited",
      "marketing_campaigns",
      "reviews_management",
      "reports_limited",
    ],
  },

  location_manager: {
    role: "location_manager",
    permissions: [
      {
        resource: "appointments",
        actions: ["create", "read", "update", "delete"],
      },
      { resource: "customers", actions: ["create", "read", "update"] },
      { resource: "staff", actions: ["read", "update"] },
      { resource: "services", actions: ["read", "update"] },
      { resource: "inventory", actions: ["read", "update"] },
      { resource: "analytics", actions: ["read"] },
      { resource: "reviews", actions: ["read", "update"] },
    ],
    features: [
      "appointment_management",
      "customer_management",
      "staff_scheduling",
      "service_management",
      "inventory_management",
      "analytics_limited",
      "reviews_management",
      "reports_limited",
    ],
  },

  staff: {
    role: "staff",
    permissions: [
      { resource: "appointments", actions: ["read", "update"] },
      { resource: "customers", actions: ["read"] },
      { resource: "schedule", actions: ["read", "update"] },
      { resource: "profile", actions: ["read", "update"] },
      { resource: "tips", actions: ["read"] },
    ],
    features: [
      "view_appointments",
      "manage_own_schedule",
      "view_customers",
      "manage_profile",
      "view_earnings",
      "view_tips",
    ],
  },

  customer: {
    role: "customer",
    permissions: [
      { resource: "appointments", actions: ["create", "read", "update"] },
      { resource: "profile", actions: ["read", "update"] },
      {
        resource: "favorites",
        actions: ["create", "read", "update", "delete"],
      },
      { resource: "preferences", actions: ["read", "update"] },
    ],
    features: [
      "book_appointments",
      "view_appointments",
      "manage_favorites",
      "manage_preferences",
      "manage_profile",
      "leave_reviews",
    ],
  },
};

// Helper functions
export function hasPermission(
  role: UserRole,
  resource: string,
  action: "create" | "read" | "update" | "delete",
): boolean {
  const permissions = rolePermissions[role]?.permissions || [];
  return permissions.some(
    (p) => p.resource === resource && p.actions.includes(action),
  );
}

export function hasFeature(role: UserRole, feature: string): boolean {
  const features = rolePermissions[role]?.features || [];
  return features.includes(feature);
}

export function canAccessRoute(role: UserRole, path: string): boolean {
  // Define route access patterns
  const routePatterns: Record<string, UserRole[]> = {
    "/admin": ["super_admin"],
    "/dashboard": ["salon_owner", "salon_manager"],
    "/staff": ["staff"],
    "/customer": ["customer"],
  };

  for (const [pattern, allowedRoles] of Object.entries(routePatterns)) {
    if (path.startsWith(pattern)) {
      return allowedRoles.includes(role);
    }
  }

  return false;
}
