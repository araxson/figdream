import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Globe
} from 'lucide-react'

const footerLinks = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' },
  ],
  services: [
    { name: 'Hair Services', href: '/services/hair' },
    { name: 'Nail Services', href: '/services/nails' },
    { name: 'Spa & Wellness', href: '/services/spa' },
    { name: 'Beauty Treatments', href: '/services/beauty' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Booking Guide', href: '/guide' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Refund Policy', href: '/refunds' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
]

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      {/* Newsletter Section */}
      <section className="w-full py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Stay Updated</CardTitle>
              <CardDescription>
                Get the latest beauty trends and exclusive offers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full"
                  />
                </div>
                <Button type="submit">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-center text-muted-foreground mt-4">
                By subscribing, you agree to our privacy policy
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Footer */}
      <div className="w-full py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="col-span-2">
              <h3 className="font-bold text-lg mb-4">Beauty Booking</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your trusted platform for booking beauty and wellness services.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>123 Beauty Street, NY 10001</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>support@beautybook.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Mon-Fri: 9AM-6PM</span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Beauty Booking. All rights reserved.
              </p>
              <Badge variant="outline">v1.0.0</Badge>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Button
                    key={social.name}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <Link href={social.href} aria-label={social.name}>
                      <Icon className="h-4 w-4" />
                    </Link>
                  </Button>
                )
              })}
            </div>

            {/* Language/Region Selector */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                English (US)
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Badge variant="secondary">SSL Secured</Badge>
            <Badge variant="secondary">PCI Compliant</Badge>
            <Badge variant="secondary">GDPR Ready</Badge>
            <Badge variant="secondary">ISO Certified</Badge>
          </div>
        </div>
      </div>
    </footer>
  )
}