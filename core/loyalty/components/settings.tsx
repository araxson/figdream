/**
 * Loyalty Program Settings Component
 * Configure and manage loyalty program settings
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { useUpdateLoyaltyProgram, useDeleteLoyaltyProgram } from "../hooks";
import type { LoyaltyProgram } from "../dal";

interface LoyaltyProgramSettingsProps {
  program: LoyaltyProgram;
}

export function LoyaltyProgramSettings({ program }: LoyaltyProgramSettingsProps) {
  const [formData, setFormData] = useState({
    name: program.name,
    description: program.description || "",
    is_active: program.is_active,
    points_per_dollar: program.points_per_dollar || 1,
    points_per_visit: program.points_per_visit || 0,
    redemption_rate: program.redemption_rate || 0.01,
    terms_conditions: program.terms_conditions || "",
  });

  const updateMutation = useUpdateLoyaltyProgram();
  const deleteMutation = useDeleteLoyaltyProgram();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: program.id,
        data: formData,
      });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        id: program.id,
        salonId: program.salon_id,
      });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="earning">Earning Rules</TabsTrigger>
          <TabsTrigger value="redemption">Redemption</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic configuration for your loyalty program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., VIP Rewards Program"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your loyalty program benefits..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Program Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable the loyalty program
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                  placeholder="Enter program terms and conditions..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earning" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Earning Rules</CardTitle>
              <CardDescription>
                Configure how customers earn loyalty points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="points-dollar">Points per Dollar Spent</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="points-dollar"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.points_per_dollar}
                    onChange={(e) =>
                      setFormData({ ...formData, points_per_dollar: parseFloat(e.target.value) || 0 })
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">points per $1</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="points-visit">Bonus Points per Visit</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="points-visit"
                    type="number"
                    min="0"
                    value={formData.points_per_visit}
                    onChange={(e) =>
                      setFormData({ ...formData, points_per_visit: parseInt(e.target.value) || 0 })
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">points per visit</span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Example: A $50 service would earn{" "}
                  {Math.floor(50 * (formData.points_per_dollar || 0)) +
                    (formData.points_per_visit || 0)}{" "}
                  points ({Math.floor(50 * (formData.points_per_dollar || 0))} from spend +{" "}
                  {formData.points_per_visit || 0} visit bonus)
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redemption" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Redemption Settings</CardTitle>
              <CardDescription>
                Configure how points can be redeemed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="redemption-rate">Points Value</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">100 points =</span>
                  <Input
                    id="redemption-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={(formData.redemption_rate || 0.01) * 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        redemption_rate: (parseFloat(e.target.value) || 1) / 100,
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">dollars</span>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Current redemption rate: 1 point = ${formData.redemption_rate?.toFixed(2) || "0.01"}
                </AlertDescription>
              </Alert>

              <Separator />

              <div className="space-y-2">
                <Label>Redemption Options</Label>
                <div className="space-y-2">
                  {[
                    "Discount on services",
                    "Free products",
                    "Birthday rewards",
                    "Referral bonuses",
                  ].map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <Badge variant="outline">{option}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteMutation.isPending}
                >
                  Delete Program
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-destructive">Are you sure?</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Yes, Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}