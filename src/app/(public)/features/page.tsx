import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { 
  Shield,
  Sparkles,
  Crown,
  Rocket,
} from 'lucide-react'

export default function FeaturesPage() {
  // Features will be loaded from the database when available
  // No mock data allowed per project rules
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      {/* Header with Enhanced Design */}
      <section className="text-center mb-16 relative">
        <AspectRatio ratio={21 / 9} className="mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 rounded-lg flex items-center justify-center">
            <div className="text-center z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
                <Badge variant="outline" className="px-3 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium Features
                </Badge>
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight lg:text-6xl mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Powerful Features for Modern Salons
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to run, grow, and scale your salon business in one comprehensive platform.
              </p>
            </div>
          </div>
        </AspectRatio>
      </section>

      <Separator className="mb-8" />

      {/* Features Content - Empty State */}
      <Card>
        <CardContent className="text-center py-16">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Features Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Feature information will be loaded from the database when available. 
            We do not display mock or sample data.
          </p>
        </CardContent>
      </Card>

      <Separator className="my-16" />

      {/* Security Section */}
      <section className="mt-16 p-8 bg-muted/50 rounded-lg">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            Enterprise-Grade Security
          </h2>
          <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">
            Your data is protected with bank-level encryption, regular security audits, and compliance with GDPR, CCPA, and PCI-DSS standards. We take security seriously so you can focus on your business.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <div className="text-center">
            <div className="font-semibold">256-bit SSL</div>
            <div className="text-sm text-muted-foreground">Encryption</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Daily</div>
            <div className="text-sm text-muted-foreground">Backups</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">24/7</div>
            <div className="text-sm text-muted-foreground">Monitoring</div>
          </div>
        </div>
      </section>
    </div>
  )
}