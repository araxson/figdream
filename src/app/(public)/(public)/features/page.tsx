import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Separator,
  Badge,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ScrollArea,
  AspectRatio,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui'
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
  Zap,
  Search,
  Crown,
  Rocket,
  Award,
  Sparkles
} from 'lucide-react'

const featureCategories = {
  booking: {
    title: 'Booking & Scheduling',
    description: 'Streamline appointment management',
    badge: { text: 'Essential', variant: 'default' as const },
    features: [
      {
        icon: Calendar,
        title: '24/7 Online Booking',
        description: 'Let customers book appointments anytime, from any device',
        badge: 'Popular',
        hoverContent: 'Integrated with Google Calendar, automated confirmation emails, and mobile-responsive booking interface.'
      },
      {
        icon: Zap,
        title: 'Smart Scheduling',
        description: 'AI-powered scheduling that maximizes staff utilization',
        badge: 'AI-Powered',
        hoverContent: 'Machine learning algorithms optimize staff schedules, predict peak times, and reduce scheduling conflicts.'
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
    badge: { text: 'Professional', variant: 'secondary' as const },
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
    badge: { text: 'Growth', variant: 'outline' as const },
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
    badge: { text: 'Secure', variant: 'destructive' as const },
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
    badge: { text: 'Advanced', variant: 'default' as const },
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
    badge: { text: 'Mobile-First', variant: 'secondary' as const },
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
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('booking')
  
  const allFeatures = Object.entries(featureCategories).flatMap(([key, category]) => 
    category.features.map(feature => ({ ...feature, category: key, categoryTitle: category.title }))
  )

  const filteredFeatures = allFeatures.filter(feature => 
    feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        
        {/* Feature Search Command */}
        <div className="max-w-md mx-auto mb-8">
          <Command className="border shadow-md">
            <CommandInput 
              placeholder="Search features..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {searchQuery && (
              <CommandList>
                <CommandEmpty>No features found.</CommandEmpty>
                <CommandGroup heading="Features">
                  {filteredFeatures.slice(0, 5).map((feature) => (
                    <CommandItem key={`${feature.category}-${feature.title}`}>
                      <Search className="mr-2 h-4 w-4" />
                      <span>{feature.title}</span>
                      <Badge variant="outline" className="ml-auto">
                        {feature.categoryTitle}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        </div>
      </section>

      <Separator className="mb-8" />

      {/* Desktop: Enhanced Tabs with Hover Cards */}
      <div className="hidden lg:block">
        <Tabs defaultValue="booking" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
            {Object.entries(featureCategories).map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <span>{category.title.split(' ')[0]}</span>
                <Badge variant={category.badge?.variant} className="hidden xl:inline-flex">
                  {category.badge?.text}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(featureCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <h2 className="text-3xl font-bold">{category.title}</h2>
                  <Badge variant={category.badge?.variant}>{category.badge?.text}</Badge>
                </div>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
              <ScrollArea className="h-[600px] pr-4">
                <div className="grid md:grid-cols-2 gap-6 pb-4">
                  {category.features.map((feature) => (
                    <HoverCard key={feature.title}>
                      <HoverCardTrigger asChild>
                        <Card className="cursor-pointer group">
                          <CardHeader>
                            <div className="flex items-center justify-between mb-3">
                              <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                              {'badge' in feature && feature.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {feature.badge}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      </HoverCardTrigger>
                      {'hoverContent' in feature && feature.hoverContent && (
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <feature.icon className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-semibold">{feature.title}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {feature.hoverContent}
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <Award className="h-3 w-3 text-primary" />
                                <span className="text-xs font-medium">Enterprise Feature</span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      )}
                    </HoverCard>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Mobile: Accordion Layout */}
      <div className="block lg:hidden">
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(featureCategories).map(([key, category]) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{category.title}</span>
                  <Badge variant={category.badge?.variant}>{category.badge?.text}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <p className="text-muted-foreground mb-6">{category.description}</p>
                  <div className="space-y-4">
                    {category.features.map((feature) => (
                      <Card key={feature.title}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <feature.icon className="h-6 w-6 text-primary" />
                            {'badge' in feature && feature.badge && (
                              <Badge variant="outline" className="text-xs">
                                {feature.badge}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base">{feature.title}</CardTitle>
                          <CardDescription className="text-sm">{feature.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Separator className="my-16" />

      {/* Additional Features Carousel */}
      <section className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            And Much More...
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover additional powerful features designed to streamline your salon operations and enhance customer experience.
          </p>
        </div>
        
        {/* Feature Grid - No Mock Data */}
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            Additional features will be loaded from the database when available.
          </p>
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