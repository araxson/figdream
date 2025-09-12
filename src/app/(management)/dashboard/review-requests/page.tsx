import { Metadata } from 'next';
import { ReviewRequestsManager } from '@/components/features/reviews/review-requests-manager';

export const metadata: Metadata = {
  title: 'Review Requests | Dashboard',
  description: 'Manage automated review requests for customers',
};

export default function ReviewRequestsPage() {
  return <ReviewRequestsManager />;
}