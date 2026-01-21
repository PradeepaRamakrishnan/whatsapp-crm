import type { Metadata } from 'next';
import { CreateFinancialInstitutionForm } from '@/features/settings/components/create-financial-institution-form';

export const metadata: Metadata = {
  title: 'Add Financial Institution',
  description: 'Add a new financial institution or banking partner.',
};

export default function CreateFinancialInstitutionPage() {
  return <CreateFinancialInstitutionForm />;
}
