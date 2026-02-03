/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import { CampaignConversation } from '@/components/shared/campaign-conversation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLeadsById } from '../services';
import type { LeadsResponse } from '../types';
// import type { LeadsResponse } from '../types';
import { ContactDetailsPage } from './contact-detail';
import { LeadDocuments } from './lead-documents';

interface LeadDetailsPageProps {
  leadId: string;
}

export function LeadDetailsPage({ leadId }: LeadDetailsPageProps) {
  const { data: leadResponse, isLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => getLeadsById(leadId),
  });

  const lead = (leadResponse as LeadsResponse)?.data?.[0] || (leadResponse as LeadsResponse);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-muted-foreground">
        Lead not found.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{lead.customerName}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Inquiry Date: {new Date(lead.interestedAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className=" border-b w-full bg-transparent p-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <ContactDetailsPage contact={lead} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <LeadDocuments
            leadId={leadId}
            campaignId={lead.campaign.id}
            contactId={lead.contact.id}
            initialDocuments={lead.documents}
          />
        </TabsContent>

        <TabsContent value="conversation">
          <CampaignConversation campaignId={lead.campaign.id} contactId={lead.contact.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
