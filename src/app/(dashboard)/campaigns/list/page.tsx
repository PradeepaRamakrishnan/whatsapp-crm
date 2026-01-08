import type { Metadata } from 'next';
import { CampaignsList } from '@/features/campaigns/components/campaigns-list';

export const metadata: Metadata = {
  title: 'Campaign List',
  description:
    'View and manage all your marketing campaigns. Track performance, monitor status, and analyze results.',
};

const CampaignListPage = () => {
  return <CampaignsList />;
};

export default CampaignListPage;
