import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HeroSection } from "../dal/public-types";

export function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaLink,
  backgroundImage,
}: HeroSection) {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center">
      {backgroundImage && (
        <>
          <div className="absolute inset-0 z-0">
            <Image
              src={backgroundImage}
              alt="Hero background"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 z-0 bg-background/80" />
        </>
      )}

      <div className="relative z-10 container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-background/95">
          <CardContent className="text-center p-8 md:p-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href={ctaLink}>{ctaText}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/services">View Services</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
