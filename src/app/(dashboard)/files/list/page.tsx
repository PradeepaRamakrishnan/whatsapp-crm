import type { Metadata } from 'next';
import { FilesList } from '@/features/files/components/files-list';

export const metadata: Metadata = {
  title: 'File Management',
  description: 'Manage and view all uploaded borrower files for your campaigns.',
};

const CampaignFilesPage = () => {
  return <FilesList />;
};

export default CampaignFilesPage;
