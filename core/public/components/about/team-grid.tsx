import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TeamMember } from "../dal/public-types";

interface TeamGridProps {
  members: TeamMember[];
  title?: string;
  subtitle?: string;
}

export function TeamGrid({ members, title, subtitle }: TeamGridProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member) => (
            <Card key={member.id} className="text-center">
              <CardHeader>
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  {member.image && (
                    <AvatarImage src={member.image} alt={member.name} />
                  )}
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{member.name}</CardTitle>
                <CardDescription className="text-primary">
                  {member.role}
                </CardDescription>
              </CardHeader>
              {member.bio && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
