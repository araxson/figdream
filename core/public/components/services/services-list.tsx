import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Service } from "../dal/public-types";

interface ServicesListProps {
  services: Service[];
  title?: string;
  subtitle?: string;
}

export function ServicesList({ services, title, subtitle }: ServicesListProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {service.price && (
                    <Badge variant="secondary">{service.price}</Badge>
                  )}
                  {service.duration && (
                    <Badge variant="outline">{service.duration}</Badge>
                  )}
                </div>

                {service.features && (
                  <ul className="space-y-1 text-sm">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/customer/book">Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
