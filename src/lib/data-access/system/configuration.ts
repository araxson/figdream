'use server';
import { createClient } from '@/lib/database/supabase/server';
import type { Database } from '@/types/database.types';
import { logError } from '@/lib/data-access/monitoring/error-logs';
type SystemConfiguration = Database['public']['Tables']['system_configuration']['Row'];
type SystemConfigurationInsert = Database['public']['Tables']['system_configuration']['Insert'];
// type SystemConfigurationUpdate = Database['public']['Tables']['system_configuration']['Update'];
export type ConfigCategory = 'general' | 'security' | 'email' | 'sms' | 'payment' | 'booking' | 'loyalty' | 'analytics' | 'integration' | 'maintenance';
export type ConfigValueType = 'string' | 'number' | 'boolean' | 'json' | 'array';
interface ConfigValidation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  options?: unknown[];
}
/**
 * Get system configuration by key
 */
export async function getSystemConfig<T = unknown>(
  key: string,
  defaultValue?: T
): Promise<T> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('system_configuration')
      .select('*')
      .eq('key', key)
      .single();
    if (error || !data) {
      return defaultValue as T;
    }
    // Parse value based on type
    return parseConfigValue(data.value, data.value_type as ConfigValueType) as T;
  } catch (_error) {
    await logError(
      `Failed to get system config: ${key}`,
      'system',
      'low',
      { key }
    );
    return defaultValue as T;
  }
}
/**
 * Get multiple system configurations by category
 */
export async function getSystemConfigsByCategory(
  category: ConfigCategory
): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('system_configuration')
      .select('*')
      .eq('category', category)
      .eq('is_active', true);
    if (error || !data) {
      return {};
    }
    // Convert to key-value object
    const configs: Record<string, unknown> = {};
    data.forEach(config => {
      configs[config.key] = parseConfigValue(config.value, config.value_type as ConfigValueType);
    });
    return configs;
  } catch (_error) {
    await logError(
      `Failed to get system configs by category: ${category}`,
      'system',
      'low',
      { category }
    );
    return {};
  }
}
/**
 * Set system configuration
 */
export async function setSystemConfig(
  key: string,
  value: unknown,
  category: ConfigCategory = 'general',
  description?: string,
  validation?: ConfigValidation
): Promise<void> {
  const supabase = await createClient();
  try {
    // Validate value if validation rules provided
    if (validation) {
      validateConfigValue(value, validation);
    }
    const valueType = detectValueType(value);
    const serializedValue = serializeConfigValue(value, valueType);
    const configData: SystemConfigurationInsert = {
      key,
      value: serializedValue,
      value_type: valueType,
      category,
      description,
      validation_rules: validation || {},
      is_active: true,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase
      .from('system_configuration')
      .upsert(configData, {
        onConflict: 'key'
      });
    if (error) {
      throw error;
    }
  } catch (_error) {
    await logError(
      `Failed to set system config: ${key}`,
      'system',
      'medium',
      { key, value, category, error }
    );
    throw new Error(`Failed to save configuration: ${key}`);
  }
}
/**
 * Update system configuration
 */
export async function updateSystemConfig(
  key: string,
  value: unknown
): Promise<void> {
  const supabase = await createClient();
  try {
    // Get existing config to preserve metadata
    const { data: existing } = await supabase
      .from('system_configuration')
      .select('*')
      .eq('key', key)
      .single();
    if (!existing) {
      throw new Error(`Configuration not found: ${key}`);
    }
    // Validate if rules exist
    if (existing.validation_rules) {
      validateConfigValue(value, existing.validation_rules as ConfigValidation);
    }
    const valueType = detectValueType(value);
    const serializedValue = serializeConfigValue(value, valueType);
    const { error } = await supabase
      .from('system_configuration')
      .update({
        value: serializedValue,
        value_type: valueType,
        updated_at: new Date().toISOString()
      })
      .eq('key', key);
    if (error) {
      throw error;
    }
  } catch (_error) {
    await logError(
      `Failed to update system config: ${key}`,
      'system',
      'medium',
      { key, value, error }
    );
    throw new Error(`Failed to update configuration: ${key}`);
  }
}
/**
 * Delete system configuration
 */
export async function deleteSystemConfig(key: string): Promise<void> {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('system_configuration')
      .delete()
      .eq('key', key);
    if (error) {
      throw error;
    }
  } catch (_error) {
    await logError(
      `Failed to delete system config: ${key}`,
      'system',
      'medium',
      { key, error }
    );
    throw new Error(`Failed to delete configuration: ${key}`);
  }
}
/**
 * Toggle system configuration active state
 */
export async function toggleSystemConfig(
  key: string,
  isActive: boolean
): Promise<void> {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('system_configuration')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('key', key);
    if (error) {
      throw error;
    }
  } catch (_error) {
    await logError(
      `Failed to toggle system config: ${key}`,
      'system',
      'low',
      { key, isActive, error }
    );
    throw new Error(`Failed to toggle configuration: ${key}`);
  }
}
/**
 * Get all active system configurations
 */
export async function getAllSystemConfigs(): Promise<SystemConfiguration[]> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('system_configuration')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('key', { ascending: true });
    if (error) {
      throw error;
    }
    return data || [];
  } catch (_error) {
    await logError(
      'Failed to get all system configs',
      'system',
      'low',
      { error }
    );
    return [];
  }
}
/**
 * Bulk update system configurations
 */
export async function bulkUpdateSystemConfigs(
  configs: Array<{ key: string; value: unknown }>
): Promise<void> {
  const supabase = await createClient();
  try {
    // Update each config in transaction
    const updates = configs.map(config => {
      const valueType = detectValueType(config.value);
      const serializedValue = serializeConfigValue(config.value, valueType);
      return supabase
        .from('system_configuration')
        .update({
          value: serializedValue,
          value_type: valueType,
          updated_at: new Date().toISOString()
        })
        .eq('key', config.key);
    });
    await Promise.all(updates);
  } catch (_error) {
    await logError(
      'Failed to bulk update system configs',
      'system',
      'medium',
      { configs, error }
    );
    throw new Error('Failed to update configurations');
  }
}
/**
 * Get system configuration with defaults
 */
export async function getSystemConfigWithDefaults(
  keys: string[],
  defaults: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const configs: Record<string, unknown> = { ...defaults };
  const promises = keys.map(async key => {
    const value = await getSystemConfig(key, defaults[key]);
    configs[key] = value;
  });
  await Promise.all(promises);
  return configs;
}
// Helper functions
function parseConfigValue(value: string, type: ConfigValueType): unknown {
  try {
    switch (type) {
      case 'string':
        return value;
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true';
      case 'json':
      case 'array':
        return JSON.parse(value);
      default:
        return value;
    }
  } catch {
    return value;
  }
}
function serializeConfigValue(value: unknown, type: ConfigValueType): string {
  switch (type) {
    case 'string':
      return String(value);
    case 'number':
      return String(value);
    case 'boolean':
      return String(value);
    case 'json':
    case 'array':
      return JSON.stringify(value);
    default:
      return String(value);
  }
}
function detectValueType(value: unknown): ConfigValueType {
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'json';
  return 'string';
}
function validateConfigValue(value: unknown, validation: ConfigValidation): void {
  if (validation.required && (value === null || value === undefined || value === '')) {
    throw new Error('Value is required');
  }
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      throw new Error(`Value must be at least ${validation.min}`);
    }
    if (validation.max !== undefined && value > validation.max) {
      throw new Error(`Value must be at most ${validation.max}`);
    }
  }
  if (typeof value === 'string' && validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      throw new Error('Value does not match required pattern');
    }
  }
  if (validation.options && !validation.options.includes(value)) {
    throw new Error(`Value must be one of: ${validation.options.join(', ')}`);
  }
}
/**
 * Default system configurations
 */
export const DEFAULT_CONFIGS = {
  // General
  'app.name': 'FigDream',
  'app.timezone': 'UTC',
  'app.locale': 'en-US',
  'app.currency': 'USD',
  // Security
  'security.session_timeout': 3600,
  'security.max_login_attempts': 5,
  'security.password_min_length': 8,
  'security.require_2fa': false,
  // Email
  'email.from_address': 'noreply@figdream.com',
  'email.from_name': 'FigDream',
  'email.smtp_host': 'smtp.sendgrid.net',
  'email.smtp_port': 587,
  // SMS
  'sms.provider': 'twilio',
  'sms.from_number': '+1234567890',
  'sms.rate_limit': 10,
  // Booking
  'booking.advance_days': 30,
  'booking.min_advance_hours': 24,
  'booking.max_per_day': 3,
  'booking.allow_cancellation': true,
  'booking.cancellation_hours': 24,
  // Loyalty
  'loyalty.points_per_dollar': 10,
  'loyalty.redemption_rate': 100,
  'loyalty.expiry_months': 12,
  // Analytics
  'analytics.retention_days': 90,
  'analytics.sample_rate': 1.0,
  // Maintenance
  'maintenance.mode': false,
  'maintenance.message': 'We are currently performing maintenance. Please check back soon.'
};