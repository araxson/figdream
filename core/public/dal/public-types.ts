// Public pages types

export interface HeroSection {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price?: string;
  duration?: string;
  image?: string;
  features?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  image?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  hours: {
    [key: string]: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
}
