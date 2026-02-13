import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TemplatesList } from '@/features/settings/components/templates-list';

export const metadata: Metadata = {
  title: 'Template Management',
  description: 'Manage message templates for all communication channels.',
};

const CampaignTemplatesPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemplatesList />
    </Suspense>
  );
};

export default CampaignTemplatesPage;
