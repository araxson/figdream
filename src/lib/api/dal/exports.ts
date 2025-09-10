import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Json } from '@/types/database.types';
import { requireRole } from './auth';


export type ExportConfigDTO = {
  id: string;
  salon_id: string;
  export_type: string;
  export_format: string;
  export_name: string;
  schedule_frequency: string | null;
  filters: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ExportHistoryDTO = {
  id: string;
  salon_id: string;
  export_type: string;
  export_format: string;
  file_url: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

/**
 * Get export configurations for salon
 */
export const getSalonExportConfigs = cache(async (salonId: string): Promise<ExportConfigDTO[]> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('export_configurations')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(config => ({
    id: config.id,
    salon_id: config.salon_id,
    export_type: config.export_type,
    export_format: config.export_format,
    export_name: config.export_name,
    schedule_frequency: config.schedule_frequency,
    filters: config.filters as Record<string, unknown> | null,
    is_active: config.is_active ?? true,
    created_at: config.created_at,
    updated_at: config.updated_at,
  }));
});

/**
 * Get export history for salon
 */
export const getSalonExportHistory = cache(async (salonId: string): Promise<ExportHistoryDTO[]> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('export_history')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error || !data) return [];
  
  return data.map(history => ({
    id: history.id,
    salon_id: history.salon_id,
    export_type: history.export_type,
    export_format: history.export_format,
    file_url: history.file_url,
    status: history.status,
    error_message: history.error_message,
    created_at: history.created_at,
    completed_at: history.completed_at,
  }));
});

/**
 * Create export configuration
 */
export const createExportConfig = async (config: Omit<ExportConfigDTO, 'id' | 'created_at' | 'updated_at'>): Promise<ExportConfigDTO | null> => {
  const session = await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  // Verify salon ownership
  const { data: salon } = await supabase
    .from('salons')
    .select('created_by')
    .eq('id', config.salon_id)
    .single();
  
  if (!salon || (salon.created_by !== session.user.id && session.user.role !== 'super_admin')) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('export_configurations')
    .insert({
      salon_id: config.salon_id,
      export_type: config.export_type,
      export_format: config.export_format,
      export_name: config.export_name,
      schedule_frequency: config.schedule_frequency,
      filters: config.filters as Json,
      is_active: config.is_active,
      created_by: session.user.id,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    salon_id: data.salon_id,
    export_type: data.export_type,
    export_format: data.export_format,
    export_name: data.export_name,
    schedule_frequency: data.schedule_frequency,
    filters: data.filters as Record<string, unknown> | null,
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Trigger export
 */
export const triggerExport = async (salonId: string, exportType: string, exportFormat: string = 'csv'): Promise<ExportHistoryDTO | null> => {
  const session = await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  // Create export history entry
  const { data, error } = await supabase
    .from('export_history')
    .insert({
      salon_id: salonId,
      export_type: exportType,
      export_format: exportFormat,
      status: 'processing',
      exported_by: session.user.id,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  // TODO: Trigger actual export via Edge Function or API
  
  return {
    id: data.id,
    salon_id: data.salon_id,
    export_type: data.export_type,
    export_format: data.export_format,
    file_url: data.file_url,
    status: data.status,
    error_message: data.error_message,
    created_at: data.created_at,
    completed_at: data.completed_at,
  };
};