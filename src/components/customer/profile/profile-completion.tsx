"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Gift, User, Mail, Phone, Calendar, MapPin, Bell, CreditCard, Star } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/types/database.types"
type Profile = Database["public"]["Tables"]["profiles"]["Row"]
interface ProfileCompletionProps {
  profile: Profile
  userId: string
}
interface CompletionItem {
  id: string
  label: string
  description: string
  completed: boolean
  points: number
  icon: React.ElementType
  href: string
}
export function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const [completionItems, setCompletionItems] = useState<CompletionItem[]>([])
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [earnedPoints, setEarnedPoints] = useState(0)
  useEffect(() => {
    const items: CompletionItem[] = [
      {
        id: "avatar",
        label: "Add Profile Photo",
        description: "Upload a profile picture to personalize your account",
        completed: !!profile.avatar_url,
        points: 10,
        icon: User,
        href: "/profile",
      },
      {
        id: "email",
        label: "Verify Email",
        description: "Confirm your email address for account security",
        completed: profile.email_verified ?? false,
        points: 20,
        icon: Mail,
        href: "/verify-email",
      },
      {
        id: "phone",
        label: "Add Phone Number",
        description: "Add your phone number for appointment reminders",
        completed: !!profile.phone,
        points: 15,
        icon: Phone,
        href: "/profile",
      },
      {
        id: "birthday",
        label: "Add Birthday",
        description: "Get special birthday offers and rewards",
        completed: !!profile.date_of_birth,
        points: 10,
        icon: Calendar,
        href: "/profile",
      },
      {
        id: "address",
        label: "Add Address",
        description: "Save your address for easier booking",
        completed: !!profile.address,
        points: 10,
        icon: MapPin,
        href: "/profile",
      },
      {
        id: "notifications",
        label: "Set Notification Preferences",
        description: "Customize how you receive updates and reminders",
        completed: profile.notification_preferences !== null,
        points: 5,
        icon: Bell,
        href: "/notifications",
      },
      {
        id: "payment",
        label: "Add Payment Method",
        description: "Save a payment method for faster checkout",
        completed: false, // This would need to check payment methods table
        points: 20,
        icon: CreditCard,
        href: "/payment-methods",
      },
      {
        id: "first_booking",
        label: "Make First Booking",
        description: "Book your first appointment with us",
        completed: false, // This would need to check appointments table
        points: 30,
        icon: Calendar,
        href: "/book",
      },
      {
        id: "first_review",
        label: "Leave First Review",
        description: "Share your experience with others",
        completed: false, // This would need to check reviews table
        points: 20,
        icon: Star,
        href: "/reviews",
      },
    ]
    setCompletionItems(items)
    const total = items.reduce((sum, item) => sum + item.points, 0)
    const earned = items.filter(item => item.completed).reduce((sum, item) => sum + item.points, 0)
    const percentage = Math.round((earned / total) * 100)
    setTotalPoints(total)
    setEarnedPoints(earned)
    setCompletionPercentage(percentage)
  }, [profile])
  const incompleteTasks = completionItems.filter(item => !item.completed)
  const completedTasks = completionItems.filter(item => item.completed)
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>
            Complete your profile to unlock rewards and get the best experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {completionPercentage}% Complete
              </span>
              <span className="text-sm text-muted-foreground">
                {earnedPoints} / {totalPoints} points earned
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
          {completionPercentage === 100 ? (
            <div className="rounded-lg border bg-card p-4 text-center">
              <Gift className="mx-auto h-8 w-8 text-primary mb-2" />
              <p className="font-medium">
                Congratulations! Your profile is complete!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You&apos;ve earned all {totalPoints} points
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm">
                Complete your profile to earn <strong>{totalPoints - earnedPoints} more points</strong> and unlock exclusive benefits!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {incompleteTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              These tasks will help personalize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incompleteTasks.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent"
                  >
                    <div className="mt-0.5">
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <Badge variant="secondary">+{item.points} pts</Badge>
                      </div>
                      <Button size="sm" variant="outline" asChild className="mt-2">
                        <Link href={item.href}>Complete</Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
            <CardDescription>
              You&apos;ve completed these profile tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedTasks.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                  >
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium flex items-center gap-2 text-muted-foreground line-through">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <Badge variant="outline">
                          +{item.points} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}