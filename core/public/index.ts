/**
 * Public Module - Public API
 * Public-facing pages and components for website visitors
 */

// Public page actions
export {
  getPublicSalons,
  getSalonDetails,
  getServiceCategories,
  searchSalons,
  submitContactForm,
  subscribeNewsletter
} from './actions';

// Public page hooks
export {
  useSalonSearch,
  useServiceCategories,
  usePublicReviews
} from './hooks';

// Public page components
export {
  LandingPage,
  AboutPage,
  ServicesPage,
  PricingPage,
  ContactPage,
  SalonDirectory,
  HeroSection,
  FeatureGrid,
  TestimonialsCarousel,
  CTASection
} from './components';

// Public types
export type {
  PublicSalon,
  ServiceCategory,
  ContactFormData,
  NewsletterSubscription
} from './types';
