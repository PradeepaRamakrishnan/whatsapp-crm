/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Link2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { generateUploadLink, getDocuments } from '../services';
import type { Document } from '../types';
import { DocumentUploader } from './document-uploader';

interface LeadDocumentsProps {
  leadId: string;
  campaignId?: string;
  contactId?: string;
  initialDocuments?: Document[];
  email?: string;
}

export function LeadDocuments({
  leadId,
  campaignId,
  contactId,
  initialDocuments,
  email,
}: LeadDocumentsProps) {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['lead-documents', leadId],
    queryFn: () => getDocuments(leadId),

    initialData: initialDocuments?.length ? { leadId, documents: initialDocuments } : undefined,
    staleTime: 5000,
  });

  const documents = documentsData?.documents || initialDocuments || [];

  const generateLinkMutation = useMutation({
    mutationFn: () => generateUploadLink(leadId, email),
    onSuccess: async (data) => {
      try {
        await navigator.clipboard.writeText(data.link);
        setIsCopied(true);
        toast.success('Secured link copied to clipboard!');
        setTimeout(() => setIsCopied(false), 3000);
      } catch {
        setGeneratedLink(data.link);
        toast.success(data.message || 'Secured upload link generated successfully');
      }
    },
    onError: (error) => {
      console.error('Failed to generate link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate link');
    },
  });

  return (
    <div className="space-y-6 mt-4">
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
              className={cn(
                'min-w-[200px] transition-all duration-300',
                isCopied && 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600',
              )}
              onClick={() => generateLinkMutation.mutate()}
              disabled={generateLinkMutation.isPending}
            >
              {generateLinkMutation.isPending ? (
                'Generating...'
              ) : isCopied ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Send Secured Upload Link
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {generatedLink && !isCopied && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-sm font-mono truncate mr-4">{generatedLink}</p>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 3000);
                }}
              >
                Copy
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <DocumentUploader
        key={leadId}
        leadId={leadId}
        campaignId={campaignId}
        contactId={contactId}
        initialDocuments={documents}
        isLoading={isLoading}
      />
    </div>
  );
}
