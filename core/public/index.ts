// Public module exports

// Components
export { HeroSection } from "./components/hero-section";
export { FeaturesGrid } from "./components/features-grid";
export { TestimonialsCarousel } from "./components/testimonials-carousel";
export { CTASection } from "./components/cta-section";
export { LandingPage } from "./components/landing-page";
export { ServicesList } from "./components/services-list";
export { PricingCards } from "./components/pricing-cards";
export { FAQAccordion } from "./components/faq-accordion";
export { ContactInfo } from "./components/contact-info";
export { TeamGrid } from "./components/team-grid";

// Page Components
export { AboutPage } from "./components/about-page";
export { ContactPage } from "./components/contact-page";
export { PricingPage } from "./components/pricing-page";
export { ServicesPage } from "./components/services-page";

// DAL
export {
  getFeaturedServices,
  getTestimonials,
  getPricingPlans,
  getFAQItems,
  getTeamMembers,
} from "./dal/public-queries";

// Types
export type {
  HeroSection as HeroSectionType,
  Feature,
  Service,
  Testimonial,
  PricingPlan,
  FAQItem,
  ContactInfo as ContactInfoType,
  TeamMember,
  StatItem,
} from "./dal/public-types";
