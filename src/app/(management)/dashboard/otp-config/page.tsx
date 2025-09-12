import { Metadata } from 'next';
import { OTPConfigurationManager } from '@/components/features/auth/otp-configuration-manager';

export const metadata: Metadata = {
  title: 'OTP Configuration | Dashboard',
  description: 'Manage One-Time Password authentication settings',
};

export default function OTPConfigPage() {
  return <OTPConfigurationManager />;
}