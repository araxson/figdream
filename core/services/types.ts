// Import DAL types for component usage
import type {
  Service,
  ServiceInsert,
  ServiceUpdate,
  ServiceWithRelations,
  ServiceCategory,
  CategoryWithServices,
  StaffService,
  ServiceFilters,
  ServiceListResponse,
} from "./dal/services-types";

// Re-export for convenience
export type {
  Service,
  ServiceInsert,
  ServiceUpdate,
  ServiceWithRelations,
  ServiceCategory,
  CategoryWithServices,
  StaffService,
  ServiceFilters,
  ServiceListResponse,
};

// Component-specific types
export interface ServiceCardProps {
  service: ServiceWithRelations;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleFeatured?: (id: string) => void;
  showActions?: boolean;
}

export interface ServiceListProps {
  services: ServiceWithRelations[];
  loading?: boolean;
  onActionComplete?: () => void;
}

export interface ServiceFormData {
  salon_id: string;
  category_id?: string;
  name: string;
  description?: string;
  duration_minutes: number;
  base_price: number;
  sale_price?: number;
  is_active?: boolean;
  is_bookable?: boolean;
  is_featured?: boolean;
}

export interface CategoryListProps {
  categories: CategoryWithServices[];
  onCategorySelect?: (categoryId: string) => void;
  selectedCategoryId?: string;
}
