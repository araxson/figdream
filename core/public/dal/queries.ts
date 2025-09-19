import { createClient } from "@/lib/supabase/server";
import type {
  Service,
  Testimonial,
  PricingPlan,
  FAQItem,
  TeamMember,
} from "./public-types";

/**
 * Get featured services for public display (PUBLIC ACCESS)
 * DOCUMENTED: Public access for service discovery - no authentication required
 */
export async function getFeaturedServices(): Promise<Service[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for service discovery

  // Mock data for now - replace with actual query when schema is ready
  return [
    {
      id: "1",
      title: "Hair Styling",
      description: "Professional hair cutting, coloring, and styling services",
      price: "From $50",
      duration: "60 min",
      features: [
        "Consultation",
        "Wash & Condition",
        "Cut & Style",
        "Product Recommendations",
      ],
    },
    {
      id: "2",
      title: "Spa & Wellness",
      description: "Relaxing spa treatments and wellness services",
      price: "From $80",
      duration: "90 min",
      features: ["Massage", "Facials", "Body Treatments", "Aromatherapy"],
    },
    {
      id: "3",
      title: "Nail Care",
      description: "Complete nail care and art services",
      price: "From $35",
      duration: "45 min",
      features: ["Manicure", "Pedicure", "Nail Art", "Gel Polish"],
    },
  ];
}

/**
 * Get testimonials for public display (PUBLIC ACCESS)
 * DOCUMENTED: Public access for testimonials - no authentication required
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for testimonials

  // Mock data for now
  return [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Regular Customer",
      content:
        "Amazing service! The team is professional and the results are always perfect.",
      rating: 5,
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "VIP Member",
      content:
        "I have been coming here for years. Best salon experience in the city!",
      rating: 5,
    },
    {
      id: "3",
      name: "Emily Davis",
      role: "First-time Customer",
      content: "Exceeded my expectations. Will definitely be coming back!",
      rating: 5,
    },
  ];
}

/**
 * Get pricing plans (PUBLIC ACCESS)
 * DOCUMENTED: Public access for pricing information - no authentication required
 */
export async function getPricingPlans(): Promise<PricingPlan[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for pricing information

  // Mock data for now
  return [
    {
      id: "1",
      name: "Basic",
      description: "Perfect for individuals",
      price: "$29",
      period: "month",
      features: [
        "Up to 5 bookings per month",
        "Basic appointment scheduling",
        "Email support",
        "Mobile app access",
      ],
      ctaText: "Start Free Trial",
    },
    {
      id: "2",
      name: "Professional",
      description: "Great for small salons",
      price: "$79",
      period: "month",
      features: [
        "Unlimited bookings",
        "Advanced scheduling",
        "Priority support",
        "Staff management",
        "Analytics dashboard",
        "Custom branding",
      ],
      highlighted: true,
      ctaText: "Start Free Trial",
    },
    {
      id: "3",
      name: "Enterprise",
      description: "For large salon chains",
      price: "Custom",
      period: "month",
      features: [
        "Everything in Professional",
        "Multiple locations",
        "Advanced analytics",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
      ],
      ctaText: "Contact Sales",
    },
  ];
}

/**
 * Get FAQ items (PUBLIC ACCESS)
 * DOCUMENTED: Public access for FAQ content - no authentication required
 */
export async function getFAQItems(): Promise<FAQItem[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for FAQ content

  // Mock data for now
  return [
    {
      id: "1",
      question: "How do I book an appointment?",
      answer:
        "You can book an appointment through our website, mobile app, or by calling us directly.",
      category: "Booking",
    },
    {
      id: "2",
      question: "What is your cancellation policy?",
      answer:
        "You can cancel or reschedule your appointment up to 24 hours before the scheduled time without any charge.",
      category: "Booking",
    },
    {
      id: "3",
      question: "Do you offer group bookings?",
      answer:
        "Yes, we offer special packages for group bookings. Please contact us for more details.",
      category: "Services",
    },
    {
      id: "4",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, debit cards, and digital payment methods.",
      category: "Payment",
    },
    {
      id: "5",
      question: "Is there parking available?",
      answer: "Yes, we have free parking available for all our customers.",
      category: "Facilities",
    },
  ];
}

/**
 * Get team members (PUBLIC ACCESS)
 * DOCUMENTED: Public access for team information - no authentication required
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for team information

  // Mock data for now
  return [
    {
      id: "1",
      name: "Jessica Martinez",
      role: "Founder & CEO",
      bio: "With over 15 years of experience in the beauty industry, Jessica founded our salon with a vision of creating the ultimate customer experience.",
    },
    {
      id: "2",
      name: "David Kim",
      role: "Head Stylist",
      bio: "Award-winning stylist with expertise in cutting-edge hair techniques and color trends.",
    },
    {
      id: "3",
      name: "Lisa Wang",
      role: "Spa Director",
      bio: "Certified wellness expert specializing in holistic spa treatments and therapeutic massages.",
    },
    {
      id: "4",
      name: "Robert Taylor",
      role: "Operations Manager",
      bio: "Ensures smooth operations and exceptional customer service across all our locations.",
    },
  ];
}
