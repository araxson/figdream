"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, Trash2, Check } from "lucide-react";
import {
  usePaymentMethods,
  useSetDefaultPaymentMethod,
  useRemovePaymentMethod,
} from "../hooks/use-billing";
import { toast } from "sonner";

interface PaymentMethodsProps {
  customerId: string;
}

export function PaymentMethods({ customerId }: PaymentMethodsProps) {
  const { data: paymentMethods = [], isLoading } =
    usePaymentMethods(customerId);
  const setDefaultMutation = useSetDefaultPaymentMethod();
  const removeMutation = useRemovePaymentMethod();
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefaultMutation.mutateAsync({ customerId, paymentMethodId });
      toast.success("Default payment method updated");
    } catch (error) {
      toast.error("Failed to update payment method");
    }
  };

  const handleRemove = async (paymentMethodId: string) => {
    try {
      await removeMutation.mutateAsync(paymentMethodId);
      toast.success("Payment method removed");
    } catch (error) {
      toast.error("Failed to remove payment method");
    }
  };

  const getCardBrandIcon = (brand?: string) => {
    // In a real app, you'd have icons for different card brands
    return <CreditCard className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading payment methods...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Manage your saved payment methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-6">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No payment methods saved</p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          <>
            <RadioGroup
              value={selectedMethod}
              onValueChange={setSelectedMethod}
            >
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label
                      htmlFor={method.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      {getCardBrandIcon(method.brand || undefined)}
                      <div>
                        <div className="font-medium">
                          {method.brand || "Card"} ending in{" "}
                          {method.last_four || "XXXX"}
                        </div>
                        {method.exp_month && method.exp_year && (
                          <div className="text-sm text-muted-foreground">
                            Expires {method.exp_month}/{method.exp_year}
                          </div>
                        )}
                      </div>
                    </Label>
                    {method.is_default && (
                      <Badge variant="secondary">
                        <Check className="mr-1 h-3 w-3" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </RadioGroup>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add New Payment Method
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
