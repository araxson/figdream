/**
 * SECURITY GUARDIAN PLUS - Secure DAL Patterns
 *
 * Template patterns for implementing secure Data Access Layer functions
 * with military-grade security, type safety, and performance optimization.
 */

import { createClient } from "@/lib/supabase/server";
import { verifySession, checkPermission, sanitizeInput, createSecureDTO } from "./auth-verification";
import type { ResourceContext, VerifiedSession } from "./auth-verification";

/**
 * Secure Query Pattern - For reading data
 *
 * Template for secure data fetching with authentication, authorization,
 * and DTO transformation.
 */
export async function secureQueryPattern<T, R>(
  resourceType: ResourceContext["resourceType"],
  queryBuilder: (supabase: any, session: VerifiedSession) => any,
  transformToDTO?: (data: T) => R
): Promise<R> {
  // Step 1: Verify authentication
  const session = await verifySession();

  // Step 2: Check read permission
  const hasPermission = await checkPermission(session, {
    resourceType,
    action: "read"
  });

  if (!hasPermission) {
    throw new Error(`SECURITY_ERROR: No permission to read ${resourceType}`);
  }

  // Step 3: Create Supabase client
  const supabase = await createClient();

  // Step 4: Execute query with session context
  const query = queryBuilder(supabase, session);
  const { data, error } = await query;

  if (error) {
    console.error(`Query error for ${resourceType}:`, error);
    throw new Error(`Failed to fetch ${resourceType}: ${error.message}`);
  }

  // Step 5: Transform to secure DTO
  if (transformToDTO) {
    return transformToDTO(data);
  }

  // Default: Strip sensitive fields
  return createSecureDTO(data) as R;
}

/**
 * Secure Mutation Pattern - For creating/updating/deleting data
 *
 * Template for secure data mutations with full security checks,
 * input sanitization, and audit logging.
 */
export async function secureMutationPattern<T, R>(
  resourceType: ResourceContext["resourceType"],
  action: ResourceContext["action"],
  input: T,
  mutationBuilder: (supabase: any, session: VerifiedSession, sanitizedInput: T) => any,
  transformToDTO?: (data: any) => R
): Promise<R> {
  // Step 1: Verify authentication
  const session = await verifySession();

  // Step 2: Sanitize input
  const sanitizedInput = sanitizeInput(input);

  // Step 3: Check permission
  const hasPermission = await checkPermission(session, {
    resourceType,
    action
  });

  if (!hasPermission) {
    throw new Error(`SECURITY_ERROR: No permission to ${action} ${resourceType}`);
  }

  // Step 4: Create Supabase client
  const supabase = await createClient();

  // Step 5: Execute mutation with session context
  const query = mutationBuilder(supabase, session, sanitizedInput);
  const { data, error } = await query;

  if (error) {
    console.error(`Mutation error for ${resourceType}:`, error);
    throw new Error(`Failed to ${action} ${resourceType}: ${error.message}`);
  }

  // Step 6: Transform to secure DTO
  if (transformToDTO) {
    return transformToDTO(data);
  }

  // Default: Strip sensitive fields
  return createSecureDTO(data) as R;
}

/**
 * Example: Secure appointment query implementation
 */
export async function getSecureAppointment(appointmentId: string) {
  return secureQueryPattern(
    "appointment",
    (supabase, session) => {
      // Build query with session context
      let query = supabase
        .from("appointments")
        .select(`
          id,
          salon_id,
          customer_id,
          staff_id,
          service_id,
          start_time,
          end_time,
          status,
          total_price,
          created_at,
          services!appointments_service_id_fkey (
            id,
            name,
            price,
            duration
          ),
          staff_profiles!appointments_staff_id_fkey (
            id,
            display_name,
            email
          ),
          profiles!appointments_customer_id_fkey (
            id,
            display_name,
            email
          )
        `)
        .eq("id", appointmentId);

      // Apply role-based filtering
      if (session.isCustomer && !session.isAdmin) {
        // Customers can only see their own appointments
        query = query.eq("customer_id", session.userId);
      } else if (session.isStaff && !session.isAdmin) {
        // Staff can only see appointments for their salon
        if (session.salonId) {
          query = query.eq("salon_id", session.salonId);
        }
      }
      // Admins can see all appointments (no additional filtering)

      return query.single();
    },
    // Transform to DTO
    (data) => ({
      id: data.id,
      salonId: data.salon_id,
      customerId: data.customer_id,
      staffId: data.staff_id,
      serviceId: data.service_id,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      totalPrice: data.total_price,
      service: data.services ? {
        id: data.services.id,
        name: data.services.name,
        price: data.services.price,
        duration: data.services.duration
      } : null,
      staff: data.staff_profiles ? {
        id: data.staff_profiles.id,
        name: data.staff_profiles.display_name,
        email: data.staff_profiles.email
      } : null,
      customer: data.profiles ? {
        id: data.profiles.id,
        name: data.profiles.display_name,
        email: data.profiles.email
      } : null
    })
  );
}

/**
 * Example: Secure appointment creation implementation
 */
export async function createSecureAppointment(appointmentData: any) {
  return secureMutationPattern(
    "appointment",
    "write",
    appointmentData,
    (supabase, session, sanitizedInput) => {
      // Validate and enhance input with session context
      const appointmentWithContext = {
        ...sanitizedInput,
        created_by: session.userId,
        created_at: new Date().toISOString()
      };

      // Ensure customer can only book for themselves
      if (session.isCustomer && !session.isAdmin) {
        appointmentWithContext.customer_id = session.userId;
      }

      // Ensure staff can only book for their salon
      if (session.isStaff && !session.isAdmin && session.salonId) {
        appointmentWithContext.salon_id = session.salonId;
      }

      return supabase
        .from("appointments")
        .insert(appointmentWithContext)
        .select()
        .single();
    },
    // Transform to DTO
    (data) => ({
      id: data.id,
      confirmationCode: data.confirmation_code,
      status: data.status,
      startTime: data.start_time,
      endTime: data.end_time,
      createdAt: data.created_at
    })
  );
}

/**
 * Batch Query Pattern - For fetching multiple related entities
 */
export async function secureBatchQuery<T>(
  queries: Array<{
    resourceType: ResourceContext["resourceType"];
    queryBuilder: (supabase: any, session: VerifiedSession) => any;
  }>
): Promise<T[]> {
  // Step 1: Verify authentication once
  const session = await verifySession();

  // Step 2: Check permissions for all resources
  const permissionChecks = await Promise.all(
    queries.map(q =>
      checkPermission(session, {
        resourceType: q.resourceType,
        action: "read"
      })
    )
  );

  if (permissionChecks.some(permitted => !permitted)) {
    throw new Error("SECURITY_ERROR: Insufficient permissions for batch query");
  }

  // Step 3: Execute all queries in parallel
  const supabase = await createClient();

  const results = await Promise.all(
    queries.map(async q => {
      const query = q.queryBuilder(supabase, session);
      const { data, error } = await query;

      if (error) {
        console.error(`Batch query error for ${q.resourceType}:`, error);
        throw new Error(`Failed to fetch ${q.resourceType}: ${error.message}`);
      }

      return createSecureDTO(data);
    })
  );

  return results as T[];
}

/**
 * Paginated Query Pattern - For large datasets
 */
export async function securePaginatedQuery<T>(
  resourceType: ResourceContext["resourceType"],
  page: number = 1,
  pageSize: number = 20,
  queryBuilder: (supabase: any, session: VerifiedSession) => any,
  transformToDTO?: (data: any[]) => T[]
): Promise<{
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}> {
  // Step 1: Verify authentication
  const session = await verifySession();

  // Step 2: Check permission
  const hasPermission = await checkPermission(session, {
    resourceType,
    action: "read"
  });

  if (!hasPermission) {
    throw new Error(`SECURITY_ERROR: No permission to read ${resourceType}`);
  }

  // Step 3: Create Supabase client
  const supabase = await createClient();

  // Step 4: Get total count
  const countQuery = queryBuilder(supabase, session);
  const { count } = await countQuery.select("*", { count: "exact", head: true });

  // Step 5: Get paginated data
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const dataQuery = queryBuilder(supabase, session);
  const { data, error } = await dataQuery.range(from, to);

  if (error) {
    console.error(`Paginated query error for ${resourceType}:`, error);
    throw new Error(`Failed to fetch ${resourceType}: ${error.message}`);
  }

  // Step 6: Transform data
  const transformedData = transformToDTO
    ? transformToDTO(data || [])
    : (data || []).map(item => createSecureDTO(item)) as T[];

  return {
    data: transformedData,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
    totalCount: count || 0
  };
}

/**
 * Cached Query Pattern - For frequently accessed data
 */
import { unstable_cache } from "next/cache";

export function createCachedQuery<T>(
  cacheKey: string,
  revalidateSeconds: number = 60
) {
  return async function cachedQuery(
    resourceType: ResourceContext["resourceType"],
    queryBuilder: (supabase: any, session: VerifiedSession) => any,
    transformToDTO?: (data: any) => T
  ): Promise<T> {
    const getCached = unstable_cache(
      async () => {
        return secureQueryPattern(resourceType, queryBuilder, transformToDTO);
      },
      [cacheKey],
      {
        revalidate: revalidateSeconds,
        tags: [cacheKey]
      }
    );

    return getCached();
  };
}

/**
 * Transaction Pattern - For atomic operations
 */
export async function secureTransaction<T>(
  operations: Array<{
    resourceType: ResourceContext["resourceType"];
    action: ResourceContext["action"];
    operation: (supabase: any, session: VerifiedSession) => Promise<any>;
  }>
): Promise<T[]> {
  // Step 1: Verify authentication
  const session = await verifySession();

  // Step 2: Check permissions for all operations
  const permissionChecks = await Promise.all(
    operations.map(op =>
      checkPermission(session, {
        resourceType: op.resourceType,
        action: op.action
      })
    )
  );

  if (permissionChecks.some(permitted => !permitted)) {
    throw new Error("SECURITY_ERROR: Insufficient permissions for transaction");
  }

  // Step 3: Execute operations (Note: Supabase doesn't support true transactions)
  const supabase = await createClient();
  const results: any[] = [];

  try {
    for (const op of operations) {
      const result = await op.operation(supabase, session);
      results.push(createSecureDTO(result));
    }

    return results as T[];
  } catch (error) {
    // In a real transaction, we would rollback here
    console.error("Transaction failed:", error);
    throw new Error("Transaction failed - manual rollback may be required");
  }
}

/**
 * Export all secure patterns
 */
export const SecureDALPatterns = {
  secureQueryPattern,
  secureMutationPattern,
  secureBatchQuery,
  securePaginatedQuery,
  createCachedQuery,
  secureTransaction,
  // Example implementations
  getSecureAppointment,
  createSecureAppointment
};

export default SecureDALPatterns;