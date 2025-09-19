import { HeroSection } from "./hero-section";
import { TeamGrid } from "./team-grid";
import { getTeamMembers } from "../dal/public-queries";

export async function AboutPage() {
  const teamMembers = await getTeamMembers();

  return (
    <div>
      <HeroSection
        title="About Us"
        subtitle="Your trusted partner in beauty and wellness since 2010"
        ctaText="Book Appointment"
        ctaLink="/customer/book"
      />
      <TeamGrid
        members={teamMembers}
        title="Meet Our Team"
        subtitle="Dedicated professionals committed to your beauty and wellness"
      />
    </div>
  );
}
