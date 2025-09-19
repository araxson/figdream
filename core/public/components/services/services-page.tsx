import { ServicesList } from "./services-list";
import { getFeaturedServices } from "../dal/public-queries";

export async function ServicesPage() {
  const services = await getFeaturedServices();

  return (
    <ServicesList
      services={services}
      title="Our Services"
      subtitle="Discover our full range of professional beauty and wellness services"
    />
  );
}
