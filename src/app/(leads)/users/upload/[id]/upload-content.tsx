'use client';

import { useSearchParams } from 'next/navigation';

import { SteppedDocumentUploader } from '@/features/leads/components/stepped-document-uploader';

interface UploadContentProps {
  leadId: string;
}

export function UploadContent({ leadId }: UploadContentProps) {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaignId') || undefined;
  const contactId = searchParams.get('contactId') || undefined;

  return <SteppedDocumentUploader leadId={leadId} campaignId={campaignId} contactId={contactId} />;
}
