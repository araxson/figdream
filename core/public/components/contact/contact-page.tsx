import { HeroSection } from "./hero-section";
import { ContactInfo } from "./contact-info";
import { FAQAccordion } from "./faq-accordion";
import { getFAQItems } from "../dal/public-queries";

export async function ContactPage() {
  const faqItems = await getFAQItems();

  const contactData = {
    phone: "+1 (555) 123-4567",
    email: "hello@figdream.com",
    address: "123 Beauty Street, New York, NY 10001",
    hours: {
      "Mon-Fri": "9:00 AM - 8:00 PM",
      Saturday: "9:00 AM - 6:00 PM",
      Sunday: "10:00 AM - 5:00 PM",
    },
  };

  return (
    <div>
      <HeroSection
        title="Contact Us"
        subtitle="We're here to help with all your beauty needs"
        ctaText="Book Now"
        ctaLink="/customer/book"
      />
      <ContactInfo {...contactData} />
      <FAQAccordion
        items={faqItems}
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions"
      />
    </div>
  );
}
