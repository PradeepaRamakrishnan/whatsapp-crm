import type { Metadata } from 'next';
import { TemplatesList } from '@/features/settings/components/templates-list';

export const metadata: Metadata = {
  title: 'Template Management',
  description: 'Manage message templates for all communication channels.',
};

const CampaignTemplatesPage = () => {
  return <TemplatesList />;
};

export default CampaignTemplatesPage;
