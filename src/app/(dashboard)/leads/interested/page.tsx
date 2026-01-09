import type { Metadata } from 'next';
import { InterestedLeadsList } from '@/features/leads/components/interested-leads-list';

export const metadata: Metadata = {
  title: 'Interested Leads',
  description: 'View and manage all leads who have shown interest in your services.',
};

const InterestedLeadsPage = () => {
  return <InterestedLeadsList />;
};

export default InterestedLeadsPage;
