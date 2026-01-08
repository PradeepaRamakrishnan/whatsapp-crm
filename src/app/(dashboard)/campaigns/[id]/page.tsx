import type { Metadata } from 'next';
import { CampaignDetailsPage } from '@/features/campaigns/components/campaign-details-page';
import { campaignsData } from '@/features/campaigns/lib/data';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const campaign = campaignsData.find((c) => c.id === parseInt(id, 10));

  if (!campaign) {
    return {
      title: 'Campaign Not Found',
      description: 'The requested campaign could not be found.',
    };
  }

  return {
    title: campaign.name,
    description: `View detailed analytics and performance metrics for ${campaign.name}. Track leads, conversions, and financial data.`,
  };
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  return <CampaignDetailsPage campaignId={parseInt(id, 10)} />;
}
