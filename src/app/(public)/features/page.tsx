import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Calendar, 
  CreditCard, 
  FileText, 
  Gift, 
  Globe, 
  Heart, 
  Lock, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Package, 
  Palette, 
  Shield, 
  Smartphone, 
  Star, 
  TrendingUp, 
  Users, 
  Zap 
} from 'lucide-react'

const featureCategories = {
  booking: {
    title: 'Booking & Scheduling',
    description: 'Streamline appointment management',
    features: [
      {
        icon: Calendar,
        title: '24/7 Online Booking',
        description: 'Let customers book appointments anytime, from any device',
      },
      {
        icon: Zap,
        title: 'Smart Scheduling',
        description: 'AI-powered scheduling that maximizes staff utilization',
      },
      {
        icon: Users,
        title: 'Staff Calendar Management',
        description: 'Manage multiple staff schedules with drag-and-drop ease',
      },
      {
        icon: MessageSquare,
        title: 'Automated Reminders',
        description: 'Reduce no-shows with SMS and email reminders',
      },
    ],
  },
  management: {
    title: 'Business Management',
    description: 'Run your salon efficiently',
    features: [
      {
        icon: MapPin,
        title: 'Multi-Location Support',
        description: 'Manage multiple salon locations from one dashboard',
      },
      {
        icon: Package,
        title: 'Inventory Tracking',
        description: 'Track products and supplies with automatic reorder alerts',
      },
      {
        icon: FileText,
        title: 'Digital Forms',
        description: 'Paperless client forms and consent management',
      },
      {
        icon: Shield,
        title: 'Staff Permissions',
        description: 'Role-based access control for team members',
      },
    ],
  },
  marketing: {
    title: 'Marketing & Growth',
    description: 'Attract and retain customers',
    features: [
      {
        icon: Mail,
        title: 'Email Campaigns',
        description: 'Create and send targeted email marketing campaigns',
      },
      {
        icon: Gift,
        title: 'Loyalty Programs',
        description: 'Build customer loyalty with points and rewards',
      },
      {
        icon: Star,
        title: 'Review Management',
        description: 'Collect and showcase customer reviews',
      },
      {
        icon: Heart,
        title: 'Referral System',
        description: 'Grow through customer referrals with built-in tracking',
      },
    ],
  },
  payments: {
    title: 'Payments & Finance',
    description: 'Simplify financial operations',
    features: [
      {
        icon: CreditCard,
        title: 'Integrated Payments',
        description: 'Accept cards, cash, and digital payments seamlessly',
      },
      {
        icon: TrendingUp,
        title: 'Commission Tracking',
        description: 'Automatic calculation of staff commissions and tips',
      },
      {
        icon: BarChart3,
        title: 'Financial Reports',
        description: 'Comprehensive reports for revenue, expenses, and profits',
      },
      {
        icon: Lock,
        title: 'Secure Transactions',
        description: 'PCI-compliant payment processing with fraud protection',
      },
    ],
  },
  analytics: {
    title: 'Analytics & Insights',
    description: 'Data-driven decision making',
    features: [
      {
        icon: BarChart3,
        title: 'Real-Time Dashboard',
        description: 'Monitor key metrics and performance in real-time',
      },
      {
        icon: TrendingUp,
        title: 'Predictive Analytics',
        description: 'AI-powered insights to forecast demand and trends',
      },
      {
        icon: Users,
        title: 'Customer Analytics',
        description: 'Understand customer behavior and preferences',
      },
      {
        icon: FileText,
        title: 'Custom Reports',
        description: 'Generate detailed reports tailored to your needs',
      },
    ],
  },
  mobile: {
    title: 'Mobile Experience',
    description: 'Manage on the go',
    features: [
      {
        icon: Smartphone,
        title: 'Mobile Apps',
        description: 'Native iOS and Android apps for staff and customers',
      },
      {
        icon: Globe,
        title: 'Web Booking Widget',
        description: 'Embed booking on your website and social media',
      },
      {
        icon: Palette,
        title: 'Custom Branding',
        description: 'White-label apps with your salon branding',
      },
      {
        icon: Zap,
        title: 'Offline Mode',
        description: 'Continue working even without internet connection',
      },
    ],
  },
}

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
          Powerful Features for Modern Salons
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Everything you need to run, grow, and scale your salon business in one comprehensive platform.
        </p>
      </section>

      {/* Feature Categories */}
      <Tabs defaultValue="booking" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>
        
        {Object.entries(featureCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{category.title}</h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {category.features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <feature.icon className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Additional Features */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          And Much More...
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Waitlist Management</CardTitle>
              <CardDescription>
                Automatically fill cancellations from your waitlist
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gift Cards & Packages</CardTitle>
              <CardDescription>
                Sell and manage gift cards and service packages
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Staff Training</CardTitle>
              <CardDescription>
                Built-in training resources and certification tracking
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supplier Integration</CardTitle>
              <CardDescription>
                Connect with suppliers for automated ordering
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tax Compliance</CardTitle>
              <CardDescription>
                Automated tax calculations and reporting
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Access</CardTitle>
              <CardDescription>
                Integrate with your existing tools and systems
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

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