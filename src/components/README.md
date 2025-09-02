# Components Directory Structure

## 📁 Folder Organization

### Role-Based Components
Each role has its own dedicated folder containing components specific to that user type:

- **`/role-super-admin/`** - Components for super administrators who manage the entire platform
- **`/role-salon-owner/`** - Components for salon owners who manage their salons
- **`/role-location-manager/`** - Components for managers who oversee specific salon locations
- **`/role-staff-member/`** - Components for staff members (stylists, technicians) 
- **`/role-customer/`** - Components for customers/clients booking services

### Shared Components
- **`/shared/`** - Reusable components used across multiple roles
  - `/analytics/` - Analytics dashboards and charts
  - `/appointments/` - Appointment management components
  - `/booking/` - Booking flow components
  - `/errors/` - Error handling components
  - `/loading/` - Loading states and skeletons
  - `/navigation/` - Navigation components (sidebars, menus)
  - `/payment/` - Payment processing components
  - `/profile/` - User profile components
  - `/settings/` - Settings forms and panels

### UI Components  
- **`/ui/`** - Base UI components from shadcn/ui (buttons, cards, inputs, etc.)

### Authentication
- **`/auth/`** - Authentication forms (login, register, password reset)

## 🎯 Naming Conventions

- **Folders**: Use descriptive names with `role-` prefix for role-based folders
- **Files**: Use kebab-case for all component files (e.g., `appointment-list.tsx`)
- **Components**: Use PascalCase for component names (e.g., `AppointmentList`)

## 🔍 How to Find Components

1. **By Role**: Look in the corresponding `role-*` folder
2. **By Feature**: Check `/shared/` for reusable feature components
3. **By UI Element**: Check `/ui/` for base UI components

## Example

If you're looking for:
- Salon owner's dashboard → `/role-salon-owner/dashboard/`
- Customer booking form → `/role-customer/booking/`
- Shared appointment list → `/shared/appointments/`
- Basic button component → `/ui/button.tsx`