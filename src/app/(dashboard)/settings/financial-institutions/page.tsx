import type { Metadata } from 'next';
import { FinancialInstitutionsList } from '@/features/settings/components/financial-institutions-list';

export const metadata: Metadata = {
  title: 'Financial Institutions',
  description: 'Manage financial institutions and banking partners.',
};

const FinancialInstitutionsPage = () => {
  return <FinancialInstitutionsList />;
};

export default FinancialInstitutionsPage;
