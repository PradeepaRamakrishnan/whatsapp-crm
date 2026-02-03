/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateUploadLink, getDocuments } from '../services';
import type { Document } from '../types';
import { DocumentUploader } from './document-uploader';

interface LeadDocumentsProps {
  leadId: string;
  campaignId?: string;
  contactId?: string;
  initialDocuments?: Document[];
}

export function LeadDocuments({
  leadId,
  campaignId,
  contactId,
  initialDocuments = [],
}: LeadDocumentsProps) {
  // Fetch documents from API
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['lead-documents', leadId],
    queryFn: () => getDocuments(leadId),
    initialData: { leadId, documents: initialDocuments },
  });

  const generateLinkMutation = useMutation({
    mutationFn: () => generateUploadLink(leadId),
    onSuccess: (data) => {
      toast.success(data.message || 'Secured upload link sent successfully');
    },
    onError: (error) => {
      console.error('Failed to generate link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate link');
    },
  });

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Required Documents</CardTitle>
              <CardDescription className="mt-1.5">
                Collect necessary documentation from the borrower for KYC and verification
              </CardDescription>
            </div>
            <Button
              onClick={() => generateLinkMutation.mutate()}
              disabled={generateLinkMutation.isPending}
            >
              <Link2 className="mr-2 h-4 w-4" />
              {generateLinkMutation.isPending ? 'Sending...' : 'Send Secured Upload Link'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <DocumentUploader
        leadId={leadId}
        campaignId={campaignId}
        contactId={contactId}
        initialDocuments={documentsData?.documents || []}
        isLoading={isLoading}
      />
    </div>
  );
}
