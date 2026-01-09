import type { Metadata } from 'next';
import { CreateTemplateForm } from '@/features/campaigns/components/create-template-form';

export const metadata: Metadata = {
  title: 'Create Template',
  description: 'Create a new message template for your communication campaigns.',
};

const CreateTemplatePage = () => {
  return <CreateTemplateForm />;
};

export default CreateTemplatePage;
