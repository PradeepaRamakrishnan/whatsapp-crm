import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FileCreatePage } from '@/features/files/components/file-create-page';

export const metadata: Metadata = {
  title: 'Upload File | Samatva CRM',
  description: 'Upload a new borrower file for your campaigns',
};

const CampaignFilesUploadPage = () => {
  return (
    <Suspense>
      <FileCreatePage />
    </Suspense>
  );
};

export default CampaignFilesUploadPage;
