import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FileCreatePage } from '@/features/files/components/file-create-page';

export const metadata: Metadata = {
  title: 'Add Recipients | Samatva CRM',
  description: 'Upload or add recipients for your campaigns',
};

const CampaignFilesUploadPage = () => {
  return (
    <Suspense>
      <FileCreatePage />
    </Suspense>
  );
};

export default CampaignFilesUploadPage;
