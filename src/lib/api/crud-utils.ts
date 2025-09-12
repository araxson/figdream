import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient, verifyApiSession } from '@/lib/api/auth-utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export type CrudResponse<T = unknown> = {
  data?: T;
  error?: string;
  success: boolean;
};

export type UserRole = 'super_admin' | 'salon_owner' | 'salon_manager' | 'staff' | 'customer';

type SupabaseClientType = SupabaseClient<Database>;

export interface CrudOptions {
  table: string;
  requiredRole?: UserRole | UserRole[];
  allowedRoles?: UserRole[];
  validateData?: (data: Record<string, unknown>) => { valid: boolean; error?: string };
  transformData?: (data: Record<string, unknown>) => Record<string, unknown>;
  beforeCreate?: (data: Record<string, unknown>, supabase: SupabaseClientType) => Promise<Record<string, unknown>>;
  afterCreate?: (data: Record<string, unknown>, supabase: SupabaseClientType) => Promise<void>;
  beforeUpdate?: (id: string, data: Record<string, unknown>, supabase: SupabaseClientType) => Promise<Record<string, unknown>>;
  afterUpdate?: (data: Record<string, unknown>, supabase: SupabaseClientType) => Promise<void>;
  beforeDelete?: (id: string, supabase: SupabaseClientType) => Promise<boolean>;
  afterDelete?: (id: string, supabase: SupabaseClientType) => Promise<void>;
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: string, requiredRoles: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole as UserRole);
}

/**
 * Get role hierarchy level
 */
export function getRoleLevel(role: string): number {
  const roleHierarchy: Record<UserRole, number> = {
    'super_admin': 5,
    'salon_owner': 4,
    'salon_manager': 3,
    'staff': 2,
    'customer': 1
  };
  return roleHierarchy[role as UserRole] || 0;
}

/**
 * Check if user can access based on role hierarchy
 */
export function canAccessByHierarchy(userRole: string, minRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(minRole);
}

/**
 * Generic CREATE operation
 */
export async function handleCreate(data: Record<string, unknown>, options: CrudOptions, request?: NextRequest): Promise<NextResponse> {
  try {
    const session = await verifyApiSession(request);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Check role authorization
    if (options.requiredRole && !hasRequiredRole(session.user.role, options.requiredRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions', success: false },
        { status: 403 }
      );
    }

    // Validate data if validator provided
    if (options.validateData) {
      const validation = options.validateData(data);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Invalid data', success: false },
          { status: 400 }
        );
      }
    }

    const supabase = await createAuthClient(request);

    // Transform data if transformer provided
    let processedData = options.transformData ? options.transformData(data) : data;

    // Run before create hook
    if (options.beforeCreate) {
      processedData = await options.beforeCreate(processedData, supabase);
    }

    // Add metadata
    processedData = {
      ...processedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Perform create operation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: createdData, error } = await (supabase as any)
      .from(options.table)
      .insert(processedData)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${options.table}:`, error);
      return NextResponse.json(
        { error: `Failed to create ${options.table}`, success: false },
        { status: 500 }
      );
    }

    // Run after create hook
    if (options.afterCreate) {
      await options.afterCreate(createdData, supabase);
    }

    return NextResponse.json({ 
      data: createdData, 
      success: true 
    });

  } catch (error) {
    console.error(`Create ${options.table} error:`, error);
    return NextResponse.json(
      { error: `Failed to create ${options.table}`, success: false },
      { status: 500 }
    );
  }
}

/**
 * Generic READ operation (list)
 */
export async function handleRead(
  filters?: Record<string, unknown>,
  options?: CrudOptions & {
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  },
  request?: NextRequest
): Promise<NextResponse> {
  try {
    const session = await verifyApiSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    if (options?.requiredRole && !hasRequiredRole(session.user.role, options.requiredRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions', success: false },
        { status: 403 }
      );
    }

    const supabase = await createAuthClient(request);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any).from(options?.table || 'profiles').select(options?.select || '*');

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? false 
      });
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(`Error reading ${options?.table}:`, error);
      return NextResponse.json(
        { error: `Failed to fetch ${options?.table}`, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data: data || [], 
      count,
      success: true 
    });

  } catch (error) {
    console.error(`Read ${options?.table} error:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${options?.table}`, success: false },
      { status: 500 }
    );
  }
}

/**
 * Generic UPDATE operation
 */
export async function handleUpdate(
  id: string,
  updates: Record<string, unknown>,
  options: CrudOptions,
  request?: NextRequest
): Promise<NextResponse> {
  try {
    const session = await verifyApiSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    if (options.requiredRole && !hasRequiredRole(session.user.role, options.requiredRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions', success: false },
        { status: 403 }
      );
    }

    if (options.validateData) {
      const validation = options.validateData(updates);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Invalid data', success: false },
          { status: 400 }
        );
      }
    }

    const supabase = await createAuthClient(request);

    let processedData = options.transformData ? options.transformData(updates) : updates;

    if (options.beforeUpdate) {
      processedData = await options.beforeUpdate(id, processedData, supabase);
    }

    // Add updated timestamp
    processedData = {
      ...processedData,
      updated_at: new Date().toISOString()
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedData, error } = await (supabase as any)
      .from(options.table)
      .update(processedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${options.table}:`, error);
      return NextResponse.json(
        { error: `Failed to update ${options.table}`, success: false },
        { status: 500 }
      );
    }

    if (options.afterUpdate) {
      await options.afterUpdate(updatedData, supabase);
    }

    return NextResponse.json({ 
      data: updatedData, 
      success: true 
    });

  } catch (error) {
    console.error(`Update ${options.table} error:`, error);
    return NextResponse.json(
      { error: `Failed to update ${options.table}`, success: false },
      { status: 500 }
    );
  }
}

/**
 * Generic DELETE operation
 */
export async function handleDelete(id: string, options: CrudOptions, request?: NextRequest): Promise<NextResponse> {
  try {
    const session = await verifyApiSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    if (options.requiredRole && !hasRequiredRole(session.user.role, options.requiredRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions', success: false },
        { status: 403 }
      );
    }

    const supabase = await createAuthClient(request);

    if (options.beforeDelete) {
      const canDelete = await options.beforeDelete(id, supabase);
      if (!canDelete) {
        return NextResponse.json(
          { error: 'Cannot delete this item', success: false },
          { status: 400 }
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from(options.table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting ${options.table}:`, error);
      return NextResponse.json(
        { error: `Failed to delete ${options.table}`, success: false },
        { status: 500 }
      );
    }

    if (options.afterDelete) {
      await options.afterDelete(id, supabase);
    }

    return NextResponse.json({ 
      success: true 
    });

  } catch (error) {
    console.error(`Delete ${options.table} error:`, error);
    return NextResponse.json(
      { error: `Failed to delete ${options.table}`, success: false },
      { status: 500 }
    );
  }
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; error?: string } {
  for (const field of requiredFields) {
    if (!data[field]) {
      return { 
        valid: false, 
        error: `${field} is required` 
      };
    }
  }
  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Sanitize input data
 */
export function sanitizeData<T>(data: T): T {
  if (typeof data === 'string') {
    return data.trim() as T;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData) as T;
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized as T;
  }
  return data;
}