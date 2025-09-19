export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface DatabaseSchema {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: Record<string, any>
    Views: Record<string, any>
    Functions: Record<string, any>
    Enums: Record<string, any>
    CompositeTypes: Record<string, any>
  }
}

export interface TableDefinition<
  TRow = any,
  TInsert = any,
  TUpdate = any,
  TRelationships = any[]
> {
  Row: TRow
  Insert: TInsert
  Update: TUpdate
  Relationships: TRelationships
}

export interface Relationship {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}