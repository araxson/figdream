"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/sonner";
import { toast as sonnerToast } from "sonner";
import {
  EmptyState,
  LoadingState,
  ErrorState,
  SuccessState,
  InfoState,
} from "./empty-state";
import {
  Package,
  Search,
  Users,
  Calendar,
  FileX,
  Inbox,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

/**
 * Comprehensive UX Patterns Showcase
 *
 * This component demonstrates all the proper shadcn/ui patterns for:
 * - Loading states with Skeleton
 * - Empty states with helpful guidance
 * - Error states with recovery actions
 * - Success states with confirmations
 * - Info states for notifications
 * - Toast notifications for user feedback
 *
 * 100% shadcn/ui compliant - ZERO custom CSS
 */
export function UXPatternsShowcase() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAction = () => {
    sonnerToast.success("Action completed successfully!");
  };

  const handleRetry = () => {
    setShowError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      sonnerToast.success("Operation successful after retry!");
    }, 2000);
  };

  const showToastExamples = () => {
    // Sonner toast examples (recommended)
    sonnerToast("Default notification");
    sonnerToast.success("Success! Your changes have been saved.");
    sonnerToast.error("Error: Unable to process your request.");
    sonnerToast.warning("Warning: This action cannot be undone.");
    sonnerToast.info("Info: New features are available.");

    // Promise toast example
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));
    sonnerToast.promise(promise, {
      loading: "Processing your request...",
      success: "Request completed successfully!",
      error: "Failed to process request",
    });
  };

  return (
    <>
      <div className="container mx-auto py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>🎨 Shadcn/UI UX Patterns Showcase</CardTitle>
            <CardDescription>
              100% Pure shadcn/ui Implementation - Zero Custom CSS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="empty" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="empty">Empty States</TabsTrigger>
                <TabsTrigger value="loading">Loading States</TabsTrigger>
                <TabsTrigger value="error">Error States</TabsTrigger>
                <TabsTrigger value="success">Success States</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              {/* EMPTY STATES */}
              <TabsContent value="empty" className="space-y-6">
                <div className="grid gap-6">
                  {/* No Data Empty State */}
                  <EmptyState
                    icon={Inbox}
                    title="No appointments yet"
                    description="You don't have any appointments scheduled. Book your first appointment to get started."
                    action={{
                      label: "Book Appointment",
                      onClick: handleAction,
                    }}
                  />

                  {/* Search No Results */}
                  <EmptyState
                    icon={Search}
                    title="No results found"
                    description="We couldn't find any results matching your search. Try adjusting your filters or search terms."
                    action={{
                      label: "Clear Filters",
                      onClick: handleAction,
                      variant: "outline",
                    }}
                    secondaryAction={{
                      label: "Search Tips",
                      onClick: handleAction,
                    }}
                  />

                  {/* No Access Empty State */}
                  <EmptyState
                    icon={Users}
                    title="No team members"
                    description="You haven't added any team members yet. Invite your first team member to collaborate."
                    action={{
                      label: "Invite Team Member",
                      onClick: handleAction,
                    }}
                    variant="card"
                  />

                  {/* Coming Soon */}
                  <EmptyState
                    icon={Package}
                    title="Feature Coming Soon"
                    description="We're working hard to bring you this feature. Stay tuned for updates!"
                    variant="minimal"
                  />
                </div>
              </TabsContent>

              {/* LOADING STATES */}
              <TabsContent value="loading" className="space-y-6">
                <div className="space-y-6">
                  {/* Card Loading */}
                  <LoadingState variant="card" />

                  {/* Table Loading */}
                  <LoadingState variant="table" rows={5} columns={4} />

                  {/* List Loading */}
                  <LoadingState variant="list" rows={3} />

                  {/* Grid Loading */}
                  <LoadingState variant="grid" rows={2} />
                </div>
              </TabsContent>

              {/* ERROR STATES */}
              <TabsContent value="error" className="space-y-6">
                <div className="space-y-4">
                  {/* Network Error */}
                  <ErrorState
                    title="Connection Error"
                    description="Unable to connect to the server. Please check your internet connection and try again."
                    action={{
                      label: "Retry",
                      onClick: handleRetry,
                    }}
                    variant="destructive"
                  />

                  {/* Validation Error */}
                  <ErrorState
                    title="Validation Error"
                    description="Please check the form fields and ensure all required information is provided correctly."
                    variant="warning"
                  />

                  {/* Permission Error */}
                  <ErrorState
                    title="Access Denied"
                    description="You don't have permission to access this resource. Please contact your administrator."
                    action={{
                      label: "Request Access",
                      onClick: handleAction,
                    }}
                    variant="default"
                  />
                </div>
              </TabsContent>

              {/* SUCCESS STATES */}
              <TabsContent value="success" className="space-y-6">
                <div className="space-y-4">
                  {/* Operation Success */}
                  <SuccessState
                    title="Successfully saved!"
                    description="Your changes have been saved and will be reflected immediately."
                    action={{
                      label: "View Changes",
                      onClick: handleAction,
                    }}
                  />

                  {/* Account Created */}
                  <SuccessState
                    title="Account created successfully!"
                    description="Welcome aboard! Check your email for verification instructions."
                  />

                  {/* Payment Success */}
                  <SuccessState
                    title="Payment processed"
                    description="Your payment has been processed successfully. Receipt sent to your email."
                    action={{
                      label: "Download Receipt",
                      onClick: handleAction,
                    }}
                  />
                </div>
              </TabsContent>

              {/* NOTIFICATIONS */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="space-y-4">
                  {/* Info Notifications */}
                  <InfoState
                    title="Maintenance Scheduled"
                    description="System maintenance is scheduled for Sunday, 2 AM - 4 AM EST. "
                    action={{
                      label: "Learn more",
                      onClick: handleAction,
                    }}
                  />

                  <InfoState
                    title="New Features Available"
                    description="Check out our latest features including advanced reporting and team collaboration. "
                    action={{
                      label: "View features",
                      onClick: handleAction,
                    }}
                  />

                  {/* Toast Notifications Demo */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Toast Notifications</CardTitle>
                      <CardDescription>
                        Click to see different toast notification styles
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Button onClick={() => sonnerToast("Default toast")}>
                        Default
                      </Button>
                      <Button
                        onClick={() => sonnerToast.success("Success toast!")}
                        variant="outline"
                      >
                        Success
                      </Button>
                      <Button
                        onClick={() => sonnerToast.error("Error toast!")}
                        variant="outline"
                      >
                        Error
                      </Button>
                      <Button
                        onClick={() => sonnerToast.warning("Warning toast!")}
                        variant="outline"
                      >
                        Warning
                      </Button>
                      <Button
                        onClick={() => sonnerToast.info("Info toast!")}
                        variant="outline"
                      >
                        Info
                      </Button>
                      <Button onClick={showToastExamples} variant="secondary">
                        Show All Examples
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Design System Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Design System Benefits Achieved</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Consistency</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Unified visual language across all interfaces using only shadcn/ui components
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Accessibility</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Built-in ARIA support and keyboard navigation in every component
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Maintainability</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Zero custom CSS to maintain - all styling through Tailwind utilities
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Performance</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Optimized bundle with tree-shaking and component lazy loading
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Developer Experience</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  TypeScript-first component API with excellent IDE support
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Responsive Design</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Mobile-first responsive patterns that work on all devices
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toaster for notifications */}
      <Toaster position="bottom-right" />
    </>
  );
}