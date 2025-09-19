"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Testimonial } from "../dal/public-types";

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
}

export function TestimonialsCarousel({
  testimonials,
  title,
  subtitle,
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  if (!testimonials.length) return null;

  const current = testimonials[currentIndex];

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

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < current.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <blockquote className="text-lg text-center italic">
                &ldquo;{current.content}&rdquo;
              </blockquote>

              <div className="text-center">
                <p className="font-semibold">{current.name}</p>
                {current.role && (
                  <CardDescription>{current.role}</CardDescription>
                )}
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" size="icon" onClick={prevTestimonial}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-1">
                  {testimonials.map((_, index) => (
                    <Button
                      key={index}
                      variant={index === currentIndex ? "default" : "outline"}
                      size="sm"
                      className="h-2 w-2 rounded-full p-0"
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <Button variant="outline" size="icon" onClick={nextTestimonial}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
