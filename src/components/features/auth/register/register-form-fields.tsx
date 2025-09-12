"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react"
import { RegisterFormValues } from "./register-schema"

interface RegisterFormFieldsProps {
  form: UseFormReturn<RegisterFormValues>
  showPassword: boolean
  showConfirmPassword: boolean
  onTogglePassword: () => void
  onToggleConfirmPassword: () => void
}

export function RegisterFormFields({
  form,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
}: RegisterFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <div className="relative flex">
                <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
                </div>
                <Input 
                  placeholder="John Doe" 
                  className="pl-12 bg-muted/30 hover:bg-muted/40 transition-colors"
                  {...field} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <div className="relative flex">
                <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
                </div>
                <Input 
                  type="email" 
                  placeholder="john@example.com" 
                  className="pl-12 bg-muted/30 hover:bg-muted/40 transition-colors"
                  {...field} 
                />
              </div>
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
            <FormLabel>Phone Number (Optional)</FormLabel>
            <FormControl>
              <div className="relative flex">
                <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
                </div>
                <Input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  className="pl-12 bg-muted/30 hover:bg-muted/40 transition-colors"
                  {...field} 
                />
              </div>
            </FormControl>
            <FormDescription>
              We&apos;ll use this to send appointment reminders
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <div className="relative flex">
                <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center z-10">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-10 bg-muted/30 hover:bg-muted/40 transition-colors"
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 hover:bg-muted/60"
                  onClick={onTogglePassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </FormControl>
            <FormDescription>
              Must be at least 8 characters with uppercase, lowercase, and numbers
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <div className="relative flex">
                <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center z-10">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-10 bg-muted/30 hover:bg-muted/40 transition-colors"
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 hover:bg-muted/60"
                  onClick={onToggleConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}