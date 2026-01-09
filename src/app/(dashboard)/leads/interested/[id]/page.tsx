import type { Metadata } from 'next';
import { borrowersData } from '@/features/campaigns/lib/borrower-data';
import { LeadDetailsPage } from '@/features/leads/components/lead-details-page';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = borrowersData.find((l) => l.id === parseInt(id, 10));

  if (!lead) {
    return {
      title: 'Lead Not Found',
    };
  }

  return {
    title: lead.name,
    description: `Details for lead ${lead.name}`,
  };
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  return <LeadDetailsPage leadId={parseInt(id, 10)} />;
}
