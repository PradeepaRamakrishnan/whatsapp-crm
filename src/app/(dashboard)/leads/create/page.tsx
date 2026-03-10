import type { Metadata } from 'next';
import { LeadCreationForm } from '@/features/leads/components/lead-creation-form';

export const metadata: Metadata = {
  title: 'Create Lead',
  description: 'Search for hospitals, clinics, or doctors to generate new leads.',
};

export default function CreateLeadPage() {
  return <LeadCreationForm />;
}
