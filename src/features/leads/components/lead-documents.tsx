/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Copy, Link2 } from 'lucide-react';
import { useState } from 'react';
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
  initialDocuments,
}: LeadDocumentsProps) {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Fetch documents from API
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['lead-documents', leadId],
    queryFn: () => getDocuments(leadId),

    initialData: initialDocuments?.length ? { leadId, documents: initialDocuments } : undefined,
    staleTime: 5000, // Keep data fresh for 5 seconds to prevent double fetches on mount
  });

  const documents = documentsData?.documents || initialDocuments || [];

  const generateLinkMutation = useMutation({
    mutationFn: () => generateUploadLink(leadId),
    onSuccess: (data) => {
      setGeneratedLink(data.link);
      toast.success(data.message || 'Secured upload link generated successfully');
    },
    onError: (error) => {
      console.error('Failed to generate link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate link');
    },
  });

  const handleCopyLink = async () => {
    if (generatedLink) {
      try {
        await navigator.clipboard.writeText(generatedLink);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

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
              {generateLinkMutation.isPending ? 'Generating...' : 'Send Secured Upload Link'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Display Generated Link */}
      {generatedLink && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Link2 className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">Secured Upload Link Generated</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Share this link with the borrower to upload their documents securely
              </CardDescription>

              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <p className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate">
                    {generatedLink}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0 bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-950 border-emerald-300 dark:border-emerald-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
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
