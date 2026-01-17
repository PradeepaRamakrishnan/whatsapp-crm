import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';

import { FilesList } from '@/features/files/components/files-list';
import { getAllFiles } from '@/features/files/services';

export const metadata: Metadata = {
  title: 'File Management',
  description: 'Manage and view all uploaded borrower files for your campaigns.',
};

type PageProps = {
  params: { category: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const FilesPage = async ({ searchParams }: PageProps) => {
  const queryClient = new QueryClient();

  const { page, limit } = await searchParams;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;

  await queryClient.prefetchQuery({
    queryKey: ['files', { page: pageNumber, limit: limitNumber }],
    queryFn: () => getAllFiles(pageNumber, limitNumber),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FilesList />
    </HydrationBoundary>
  );
};

export default FilesPage;
