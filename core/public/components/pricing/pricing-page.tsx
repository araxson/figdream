import { PricingCards } from "./pricing-cards";
import { getPricingPlans } from "../dal/public-queries";

export async function PricingPage() {
  const plans = await getPricingPlans();

  return (
    <PricingCards
      plans={plans}
      title="Choose Your Plan"
      subtitle="Select the perfect plan for your business needs"
    />
  );
}
