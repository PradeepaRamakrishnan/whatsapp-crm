import type { Metadata } from 'next';
import { BusinessLeadSearchForm } from '@/features/business-leads/components/business-lead-search-form';

export const metadata: Metadata = {
  title: 'Search & Add Leads',
  description: 'Search for businesses by industry and location, then save them as leads.',
};

export default function BusinessLeadSearchPage() {
  return <BusinessLeadSearchForm />;
}
