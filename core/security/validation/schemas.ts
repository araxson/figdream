import { z } from "zod";

/**
 * Common validation schemas for security
 */

// Email validation with additional security checks
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(5, "Email too short")
  .max(255, "Email too long")
  .toLowerCase()
  .trim()
  .refine(
    (email) => !email.includes(".."),
    "Email cannot contain consecutive dots"
  )
  .refine(
    (email) => !email.startsWith(".") && !email.endsWith("."),
    "Email cannot start or end with a dot"
  );

// Password validation with security requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one number"
  )
  .refine(
    (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    "Password must contain at least one special character"
  );

// Phone number validation
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
  .optional();

// UUID validation
export const uuidSchema = z
  .string()
  .uuid("Invalid ID format");

// Date validation
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
  .refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid date"
  );

// Time validation
export const timeSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)");

// URL validation
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .max(2048, "URL too long");

// Sanitized text input
export const sanitizedTextSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(1000, "Text too long")
  .transform((text) => {
    // Remove any HTML tags
    return text.replace(/<[^>]*>?/gm, "");
  });

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Common schemas for features
export const schemas = {
  // Authentication
  login: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password required"),
  }),

  register: z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: sanitizedTextSchema,
    phone: phoneSchema,
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  forgotPassword: z.object({
    email: emailSchema,
  }),

  resetPassword: z.object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  // Appointments
  createAppointment: z.object({
    salonId: uuidSchema,
    serviceId: uuidSchema,
    staffId: uuidSchema,
    customerId: uuidSchema.optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    notes: sanitizedTextSchema.optional(),
    price: z.number().positive().max(99999),
  }),

  // Services
  createService: z.object({
    name: sanitizedTextSchema.max(100),
    description: sanitizedTextSchema.optional(),
    price: z.number().positive().max(99999),
    duration: z.number().positive().max(480), // Max 8 hours
    categoryId: uuidSchema.optional(),
    isActive: z.boolean().default(true),
  }),

  // Staff
  createStaff: z.object({
    email: emailSchema,
    name: sanitizedTextSchema.max(100),
    phone: phoneSchema,
    role: z.enum(["staff", "manager", "owner"]),
    salonId: uuidSchema,
    commission: z.number().min(0).max(100).optional(),
    specialties: z.array(z.string()).optional(),
  }),

  // Customer
  updateProfile: z.object({
    name: sanitizedTextSchema.max(100).optional(),
    phone: phoneSchema,
    dateOfBirth: dateSchema.optional(),
    preferences: z.object({
      notifications: z.boolean(),
      marketingEmails: z.boolean(),
      smsReminders: z.boolean(),
    }).optional(),
  }),

  // Reviews
  createReview: z.object({
    appointmentId: uuidSchema,
    rating: z.number().min(1).max(5),
    comment: sanitizedTextSchema.max(500).optional(),
  }),

  // Search
  searchQuery: z.object({
    query: sanitizedTextSchema.max(200),
    filters: z.object({
      salonId: uuidSchema.optional(),
      categoryId: uuidSchema.optional(),
      minPrice: z.number().positive().optional(),
      maxPrice: z.number().positive().optional(),
      date: dateSchema.optional(),
    }).optional(),
    ...paginationSchema.shape,
  }),
};

/**
 * Validate and sanitize input data
 */
export function validateInput<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log validation errors for security monitoring
      console.error("Validation error:", error.errors);

      // Create user-friendly error message
      const errors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
    throw error;
  }
}

/**
 * Safe parse with error details
 */
export function safeParse<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map(
    (e) => `${e.path.join(".")}: ${e.message}`
  );

  return { success: false, errors };
}