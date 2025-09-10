'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/ui/use-toast'

const salonSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(5, 'Address is required'),
  description: z.string().max(500).optional(),
})

type Salon = Database['public']['Tables']['salons']['Row']

export function SalonSettings() {
  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const toast = useToast()

  const form = useForm<z.infer<typeof salonSchema>>({
    resolver: zodResolver(salonSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      description: '',
    },
  })

  const fetchSalonData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('salons')
        .select('*')
        .eq('created_by', user.id)
        .single()

      if (data) {
        setSalon(data)
        form.reset({
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          description: data.description || '',
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching salon data:', error)
      }
    }
  }, [supabase, form])

  useEffect(() => {
    fetchSalonData()
  }, [fetchSalonData])

  async function onSubmit(values: z.infer<typeof salonSchema>) {
    if (!salon) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('salons')
        .update({
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          description: values.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', salon.id)

      if (error) throw error
      
      toast.success('Salon settings updated successfully!')
      router.refresh()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating salon settings:', error)
      }
      toast.error('Failed to update salon settings', 'Please try again later')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salon Information</CardTitle>
        <CardDescription>Update your salon details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salon Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}