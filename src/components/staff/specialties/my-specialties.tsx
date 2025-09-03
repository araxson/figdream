"use client"
import { useState, useEffect } from "react"
import { Award, Sparkles } from "lucide-react"

import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import type { Database } from "@/types/database.types"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@/components/ui"
type StaffSpecialty = Database["public"]["Tables"]["staff_specialties"]["Row"]
interface MySpecialtiesProps {
  staffId: string
}
export function MySpecialties({ staffId }: MySpecialtiesProps) {
  const [specialties, setSpecialties] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    loadSpecialties()
  }, [staffId])
  const loadSpecialties = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("staff_specialties")
        .select("specialty")
        .eq("staff_id", staffId)
        .order("created_at", { ascending: true })
      if (error) throw error
      setSpecialties(data?.map(s => s.specialty) || [])
    } catch (error) {
      console.error("Error loading specialties:", error)
      toast.error("Failed to load your specialties")
    } finally {
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Specialties</CardTitle>
          <CardDescription>Loading your specialties...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>My Specialties</CardTitle>
            <CardDescription>
              Your areas of expertise and specialized skills
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {specialties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              No specialties assigned yet
            </p>
            <p className="text-sm text-muted-foreground">
              Contact your salon manager to add specialties to your profile
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <Badge
                  key={specialty}
                  variant="default"
                  className="px-3 py-1.5"
                >
                  <Award className="mr-1.5 h-3.5 w-3.5" />
                  {specialty}
                </Badge>
              ))}
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Tip:</span> Your specialties help customers find you for specific services.
                The more specialized skills you have, the more bookings you may receive!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
