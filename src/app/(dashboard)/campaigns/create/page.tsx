import type { Metadata } from 'next';
import { CreateCampaignForm } from '@/features/campaigns/components/create-campaign-form';

export const metadata: Metadata = {
  title: 'Create Campaign',
  description:
    'Create a new marketing campaign. Set up campaign details, upload borrowers list, and configure targets.',
};

export default function CreateCampaignPage() {
  return <CreateCampaignForm />;
}
