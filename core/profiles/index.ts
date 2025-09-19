// Re-export types with explicit names to avoid ambiguity
export {
  type Profile,
  type ProfileUpdate,
  type ProfileInsert,
  type StaffProfile,
  type StaffProfileUpdate,
  type StaffProfileInsert,
  type User,
  type Salon,
  type ProfileWithDetails,
  type StaffProfileWithDetails
} from "./dal/profiles-types";

// Export queries and mutations
export * from "./dal/profiles-queries";
export * from "./dal/profiles-mutations";

// Export components
export { ProfileForm } from "./components/profile-form";

// Export hooks
export * from "./hooks/use-profiles";