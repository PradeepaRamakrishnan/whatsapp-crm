import type { Metadata } from 'next';
import { NbfcList } from '@/features/settings/components/nbfc-list';

export const metadata: Metadata = {
  title: 'NBFC Management',
  description: 'Manage Non-Banking Financial Companies.',
};

const NbfcPage = () => {
  return <NbfcList />;
};

export default NbfcPage;
