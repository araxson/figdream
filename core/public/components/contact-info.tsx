import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

interface ContactInfoProps {
  phone: string;
  email: string;
  address: string;
  hours: {
    [key: string]: string;
  };
}

export function ContactInfo({
  phone,
  email,
  address,
  hours,
}: ContactInfoProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <Phone className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`tel:${phone}`}
                className="text-muted-foreground hover:text-primary"
              >
                {phone}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <Mail className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`mailto:${email}`}
                className="text-muted-foreground hover:text-primary"
              >
                {email}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <MapPin className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{address}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <Clock className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {Object.entries(hours).map(([day, time]) => (
                  <li key={day} className="text-sm text-muted-foreground">
                    <span className="font-medium">{day}:</span> {time}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
