import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Shield, Star } from 'lucide-react';
import type { PlatformSalon } from '../types';

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatAddress = (address: any) => {
  if (!address) return 'No address';
  return `${address.street || ''} ${address.city || ''}, ${address.state || ''} ${address.postal_code || ''}`.trim();
};

export const getStatusBadge = (salon: PlatformSalon) => {
  const badges = [];

  if (salon.is_active) {
    badges.push(
      <Badge key="active" variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    );
  } else {
    badges.push(
      <Badge key="inactive" variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  }

  if (salon.is_verified) {
    badges.push(
      <Badge key="verified" variant="default" className="bg-blue-100 text-blue-800">
        <Shield className="w-3 h-3 mr-1" />
        Verified
      </Badge>
    );
  }

  if (salon.is_featured) {
    badges.push(
      <Badge key="featured" variant="default" className="bg-yellow-100 text-yellow-800">
        <Star className="w-3 h-3 mr-1" />
        Featured
      </Badge>
    );
  }

  return <div className="flex flex-wrap gap-1">{badges}</div>;
};

export const getSubscriptionBadge = (salon: PlatformSalon) => {
  const isExpired = salon.subscription_expires_at &&
    new Date(salon.subscription_expires_at) < new Date();

  switch (salon.subscription_tier) {
    case 'free':
      return <Badge variant="outline">Free</Badge>;
    case 'basic':
      return (
        <Badge variant={isExpired ? "destructive" : "default"} className="bg-blue-100 text-blue-800">
          Basic
        </Badge>
      );
    case 'pro':
      return (
        <Badge variant={isExpired ? "destructive" : "default"} className="bg-purple-100 text-purple-800">
          Pro
        </Badge>
      );
    case 'enterprise':
      return (
        <Badge variant={isExpired ? "destructive" : "default"} className="bg-orange-100 text-orange-800">
          Enterprise
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};