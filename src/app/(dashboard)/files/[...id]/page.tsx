import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { FileDetailsPage } from '@/features/files/components/file-details-page';
import { getFileById } from '@/features/files/services';

export const metadata = {
  title: 'File Details',
  description: 'View file details and records',
};

interface FileDetailRouteProps {
  params: Promise<{
    id: string[];
  }>;
}

const FileDetailRoute = async ({ params }: FileDetailRouteProps) => {
  const { id } = await params;

  const fileId = id[id.length - 1];

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['file', fileId, { page: 1, limit: 10 }],
    queryFn: () => getFileById(fileId, 1, 10),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FileDetailsPage fileId={fileId} />
    </HydrationBoundary>
  );
};

export default FileDetailRoute;
