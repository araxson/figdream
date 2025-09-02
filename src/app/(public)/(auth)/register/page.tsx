'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge
} from '@/components/ui'
import { toast } from 'sonner'
import { Building, Users, User, ChevronRight, ArrowRight, Sparkles, Clock, Shield, Star } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const registrationOptions = [
    {
      role: 'salon',
      title: 'Register Your Salon',
      description: 'Start managing your salon business with our comprehensive platform',
      icon: Building,
      href: '/auth/register/salon',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      benefits: [
        'Manage multiple locations',
        'Staff scheduling & payroll',
        'Marketing automation',
        'Advanced analytics',
      ],
      cta: 'Start Free Trial',
      badge: 'Most Popular',
    },
    {
      role: 'customer',
      title: 'Create Customer Account',
      description: 'Book appointments, earn rewards, and manage your beauty routine',
      icon: User,
      href: '/auth/register/customer',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      benefits: [
        '24/7 online booking',
        'Loyalty rewards',
        'Exclusive offers',
        'Appointment history',
      ],
      cta: 'Sign Up Free',
    },
    {
      role: 'staff',
      title: 'Staff Member Registration',
      description: 'Join your salon team and manage your professional profile',
      icon: Users,
      href: '/auth/register/staff',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      benefits: [
        'Schedule management',
        'Client bookings',
        'Commission tracking',
        'Performance insights',
      ],
      cta: 'Activate Account',
      note: 'Requires invitation from salon',
    },
  ]

  const handleRoleSelect = (role: string, href: string) => {
    setSelectedRole(role)
    // Small delay for visual feedback
    setTimeout(() => {
      router.push(href)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Join FigDream Today
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose how you want to get started with the most comprehensive salon management platform
          </p>
        </div>

        {/* Registration Options */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {registrationOptions.map((option) => (
            <Card
              key={option.role}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === option.role ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleRoleSelect(option.role, option.href)}
            >
              {option.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>{option.badge}</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className={`inline-flex p-3 rounded-full ${option.bgColor} mb-3`}>
                  <option.icon className={`h-8 w-8 ${option.color}`} />
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <CardDescription className="mt-2">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {option.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                {option.note && (
                  <p className="text-xs text-muted-foreground italic">
                    * {option.note}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full group" variant={option.role === 'salon' ? 'default' : 'outline'}>
                  {option.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Quick Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Quick Setup</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Get started in minutes with our easy onboarding process
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Secure & Private</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your data is encrypted and protected with enterprise-grade security
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Free to Start</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required. Upgrade when you&apos;re ready to grow
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Already Have Account */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              View Pricing
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Link href="/features" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              Explore Features
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              Contact Sales
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}