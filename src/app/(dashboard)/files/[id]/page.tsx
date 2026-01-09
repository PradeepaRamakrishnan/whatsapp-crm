import { FileDetailsPage } from '@/features/files/components/file-details-page';

export const metadata = {
  title: 'File Details',
  description: 'View file details and records',
};

interface FileDetailRouteProps {
  params: Promise<{
    id: string;
  }>;
}

const FileDetailRoute = async ({ params }: FileDetailRouteProps) => {
  const { id } = await params;
  return <FileDetailsPage fileId={id} />;
};

export default FileDetailRoute;
