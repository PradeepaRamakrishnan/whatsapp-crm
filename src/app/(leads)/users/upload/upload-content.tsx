'use client';

import { useSearchParams } from 'next/navigation';

import { SteppedDocumentUploader } from '@/features/leads/components/stepped-document-uploader';

export function UploadContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId') || '';
  const campaignId = searchParams.get('campaignId') || undefined;
  const contactId = searchParams.get('contactId') || undefined;

  return <SteppedDocumentUploader leadId={leadId} campaignId={campaignId} contactId={contactId} />;
}
