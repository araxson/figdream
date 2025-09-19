import { HeroSection } from "./hero-section";
import { FeaturesGrid } from "./features-grid";
import { TestimonialsCarousel } from "./testimonials-carousel";
import { CTASection } from "./cta-section";
import { getFeaturedServices, getTestimonials } from "../dal/public-queries";

export async function LandingPage() {
  const [services, testimonials] = await Promise.all([
    getFeaturedServices(),
    getTestimonials(),
  ]);

  const features = [
    {
      id: "1",
      title: "Easy Booking",
      description:
        "Book your appointments online 24/7 with our simple booking system",
      icon: "📅",
    },
    {
      id: "2",
      title: "Professional Staff",
      description:
        "Our experienced professionals are dedicated to providing exceptional service",
      icon: "👥",
    },
    {
      id: "3",
      title: "Premium Products",
      description:
        "We use only the highest quality products for all our services",
      icon: "✨",
    },
    {
      id: "4",
      title: "Flexible Scheduling",
      description: "Find appointment times that work with your busy schedule",
      icon: "🕐",
    },
    {
      id: "5",
      title: "Loyalty Rewards",
      description:
        "Earn points and enjoy exclusive benefits with our loyalty program",
      icon: "🎁",
    },
    {
      id: "6",
      title: "Satisfaction Guaranteed",
      description:
        "Your satisfaction is our top priority. We stand behind our work",
      icon: "💯",
    },
  ];

  const heroData = {
    title: "Welcome to FigDream",
    subtitle: "Your Premier Destination for Beauty & Wellness",
    ctaText: "Book Appointment",
    ctaLink: "/customer/book",
    backgroundImage:
      "https://images.unsplash.com/photo-1560066984-138dadb5c4cf?w=1920",
  };

  return (
    <div className="min-h-screen">
      <HeroSection {...heroData} />

      <FeaturesGrid
        features={features}
        title="Why Choose Us"
        subtitle="Experience the difference with our exceptional services and dedicated team"
      />

      <TestimonialsCarousel
        testimonials={testimonials}
        title="What Our Customers Say"
        subtitle="Don't just take our word for it"
      />

      <CTASection
        title="Ready to Transform Your Look?"
        description="Join thousands of satisfied customers who trust us with their beauty needs"
        primaryButtonText="Book Now"
        primaryButtonLink="/customer/book"
        secondaryButtonText="View Services"
        secondaryButtonLink="/services"
      />
    </div>
  );
}
