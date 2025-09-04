"use client"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, CreditCard, Check, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/database/supabase/client"
import type { Database } from "@/types/database.types"
type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"]
const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().min(1, "Description is required"),
  price_monthly: z.number().min(0, "Price must be positive"),
  price_yearly: z.number().min(0, "Price must be positive"),
  max_locations: z.number().min(1, "At least 1 location required"),
  max_staff: z.number().min(1, "At least 1 staff member required"),
  max_services: z.number().min(1, "At least 1 service required"),
  features: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
})
type PlanFormValues = z.infer<typeof planSchema>
export function SubscriptionPlansManager() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [_deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      price_monthly: 0,
      price_yearly: 0,
      max_locations: 1,
      max_staff: 5,
      max_services: 20,
      features: [],
      is_active: true,
    },
  })
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .order("price_monthly", { ascending: true })
        if (error) throw error
        setPlans(data || [])
      } catch (_error) {
        toast.error("Failed to load subscription plans")
      } finally {
        setLoading(false)
      }
    }
    loadPlans()
  }, [supabase])
  useEffect(() => {
    if (editPlan) {
      form.reset({
        name: editPlan.name,
        description: editPlan.description || "",
        price_monthly: editPlan.price_monthly,
        price_yearly: editPlan.price_yearly || editPlan.price_monthly * 10,
        max_locations: editPlan.max_locations || 1,
        max_staff: editPlan.max_staff || 5,
        max_services: editPlan.max_services || 20,
        features: (editPlan.features as string[]) || [],
        is_active: editPlan.is_active ?? true,
      })
      setCreateDialogOpen(true)
    }
  }, [editPlan, form])
  const loadPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true })
      if (error) throw error
      setPlans(data || [])
    } catch (_error) {
      toast.error("Failed to load subscription plans")
    } finally {
      setLoading(false)
    }
  }
  const handleSubmit = async (values: PlanFormValues) => {
    try {
      if (editPlan) {
        const { error } = await supabase
          .from("subscription_plans")
          .update({
            ...values,
            features: values.features,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editPlan.id)
        if (error) throw error
        toast.success("Plan updated successfully")
      } else {
        const { error } = await supabase
          .from("subscription_plans")
          .insert({
            ...values,
            features: values.features,
          })
        if (error) throw error
        toast.success("Plan created successfully")
      }
      setCreateDialogOpen(false)
      setEditPlan(null)
      form.reset()
      await loadPlans()
    } catch (_error) {
      toast.error(editPlan ? "Failed to update plan" : "Failed to create plan")
    }
  }
  const _handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", id)
      if (error) throw error
      toast.success("Plan deleted successfully")
      setDeleteId(null)
      await loadPlans()
    } catch (_error) {
      toast.error("Failed to delete plan")
    }
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Loading plans...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>
                Manage subscription tiers and pricing
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No subscription plans configured
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Plan
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id} className={!plan.is_active ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {plan.name.toLowerCase().includes("pro") && (
                        <Badge className="gap-1">
                          <Zap className="h-3 w-3" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">
                        {formatCurrency(plan.price_monthly)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /month
                        </span>
                      </div>
                      {plan.price_yearly && (
                        <p className="text-sm text-muted-foreground">
                          or {formatCurrency(plan.price_yearly)}/year
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Up to {plan.max_locations} location(s)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Up to {plan.max_staff} staff members</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Up to {plan.max_services} services</span>
                      </div>
                      {(plan.features as string[])?.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditPlan(plan)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog 
        open={createDialogOpen} 
        onOpenChange={(open) => {
          setCreateDialogOpen(open)
          if (!open) {
            setEditPlan(null)
            form.reset()
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
            </DialogTitle>
            <DialogDescription>
              Configure the details and pricing for this subscription tier
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Professional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Available for purchase
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this plan..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price_monthly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_yearly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yearly Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="max_locations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Locations</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_staff"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Staff</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Services</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false)
                    setEditPlan(null)
                    form.reset()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editPlan ? "Update" : "Create"} Plan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}