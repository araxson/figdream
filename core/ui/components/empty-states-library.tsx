/**
 * Empty States Library
 * Pre-configured empty states for common scenarios
 */

import {
  Calendar,
  Users,
  Package,
  CreditCard,
  MessageSquare,
  FileText,
  Search,
  Star,
  Clock,
  AlertCircle,
  Scissors,
  UserPlus,
  DollarSign,
  BarChart,
  Settings,
  Bell,
  Mail,
  Image,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { EmptyState } from './production-polish';

interface EmptyStatePresetProps {
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Appointments Empty States
 */
export const AppointmentEmptyStates = {
  NoAppointments: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Calendar}
      title="No appointments scheduled"
      description="Your appointment calendar is clear. Start booking to see appointments here."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoUpcomingAppointments: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Clock}
      title="No upcoming appointments"
      description="You don't have any appointments scheduled for the future."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoPastAppointments: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Calendar}
      title="No appointment history"
      description="You haven't had any appointments yet."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Customer Empty States
 */
export const CustomerEmptyStates = {
  NoCustomers: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Users}
      title="No customers yet"
      description="Start building your customer base by adding your first customer."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoFavorites: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Star}
      title="No favorites saved"
      description="Save your favorite salons and services for quick access."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoReviews: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={MessageSquare}
      title="No reviews yet"
      description="Customer reviews will appear here once you receive them."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Service Empty States
 */
export const ServiceEmptyStates = {
  NoServices: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Scissors}
      title="No services added"
      description="Create your service menu to start accepting bookings."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoCategories: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Package}
      title="No service categories"
      description="Organize your services by creating categories."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Staff Empty States
 */
export const StaffEmptyStates = {
  NoStaff: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={UserPlus}
      title="No staff members"
      description="Add your team members to manage their schedules and appointments."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoSchedule: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Clock}
      title="No schedule set"
      description="Set up your working hours to start accepting appointments."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Financial Empty States
 */
export const FinancialEmptyStates = {
  NoTransactions: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={CreditCard}
      title="No transactions"
      description="Transaction history will appear here once you start processing payments."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoRevenue: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={DollarSign}
      title="No revenue data"
      description="Revenue metrics will appear once you complete your first paid appointment."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoInvoices: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={FileText}
      title="No invoices"
      description="Invoices will be generated automatically for completed appointments."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Analytics Empty States
 */
export const AnalyticsEmptyStates = {
  NoData: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={BarChart}
      title="No data available"
      description="Analytics will populate as you use the platform."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoReports: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={FileText}
      title="No reports generated"
      description="Generate your first report to analyze your business performance."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Communication Empty States
 */
export const CommunicationEmptyStates = {
  NoMessages: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={MessageSquare}
      title="No messages"
      description="Your conversation history will appear here."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoNotifications: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="You're all caught up! New notifications will appear here."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoEmails: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Mail}
      title="No emails sent"
      description="Email history will appear here once you start sending messages."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Search & Filter Empty States
 */
export const SearchEmptyStates = {
  NoResults: (searchTerm?: string) => (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        searchTerm
          ? `We couldn't find anything matching "${searchTerm}". Try adjusting your search.`
          : "Try adjusting your filters or search terms."
      }
      action={props?.action}
      className={props?.className}
    />
  ),
  NoFilterResults: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={AlertCircle}
      title="No items match your filters"
      description="Try adjusting your filter criteria to see more results."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Media Empty States
 */
export const MediaEmptyStates = {
  NoImages: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Image}
      title="No images uploaded"
      description="Upload images to showcase your work and services."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoPortfolio: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Image}
      title="Portfolio is empty"
      description="Add photos of your work to build your portfolio."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Product Empty States
 */
export const ProductEmptyStates = {
  NoProducts: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={ShoppingBag}
      title="No products available"
      description="Add products to your inventory to start selling."
      action={props?.action}
      className={props?.className}
    />
  ),
  OutOfStock: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Package}
      title="Out of stock"
      description="This product is currently unavailable."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Settings Empty States
 */
export const SettingsEmptyStates = {
  NoIntegrations: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Settings}
      title="No integrations connected"
      description="Connect third-party services to enhance your experience."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoWebhooks: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Settings}
      title="No webhooks configured"
      description="Set up webhooks to automate your workflows."
      action={props?.action}
      className={props?.className}
    />
  ),
};

/**
 * Growth Empty States
 */
export const GrowthEmptyStates = {
  NoCampaigns: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={TrendingUp}
      title="No campaigns running"
      description="Create marketing campaigns to grow your business."
      action={props?.action}
      className={props?.className}
    />
  ),
  NoReferrals: (props?: EmptyStatePresetProps) => (
    <EmptyState
      icon={Users}
      title="No referrals yet"
      description="Your referral program stats will appear here."
      action={props?.action}
      className={props?.className}
    />
  ),
};