'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  // Calendar,
  CheckCircle2,
  // IndianRupee,
  Mail,
  MessageSquare,
  Phone,
  User,
  XCircle,
} from 'lucide-react';
import { CampaignConversation } from '@/components/shared/campaign-conversation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  // SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CampaignContactData } from '@/features/campaigns/types';

dayjs.extend(utc);

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    case 'processing':
      return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    case 'failed':
      return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300';
    case 'interested':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    case 'not_interested':
      return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
  }
};

const getResponseStatusColor = (responseStatus: 'interested' | 'not_interested' | null) => {
  if (responseStatus === 'interested') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
  }
  if (responseStatus === 'not_interested') {
    return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300';
  }
  return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
};

const formatResponseStatus = (responseStatus: 'interested' | 'not_interested' | null) => {
  if (responseStatus === null) return 'No Response';
  return responseStatus.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

interface CampaignContactDetailsSheetProps {
  campaignId: string;
  selectedContact: CampaignContactData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignContactDetailsSheet({
  campaignId,
  selectedContact,
  open,
  onOpenChange,
}: CampaignContactDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div>{selectedContact?.contact.customerName}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <div>
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {selectedContact?.contact.emailId || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <div>
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {selectedContact?.contact.mobileNumber || '-'}
                  </p>
                </div>
              </div>
            </div>
          </SheetTitle>
          {/* <SheetDescription>Contact details and status</SheetDescription> */}
        </SheetHeader>

        {selectedContact && (
          <Tabs defaultValue="details" className="flex flex-1 flex-col overflow-hidden">
            <TabsList className="mx-4 mt-4 ">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto px-4 pb-4 mt-4">
              <div className="flex flex-col gap-6">
                {/* <Separator /> */}

                <div>
                  <h4 className="mb-3 text-sm font-semibold">Campaign Status</h4>
                  <div className="grid gap-2 pb-4">
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-muted-foreground">Email</span>
                          {selectedContact.email.sent && selectedContact.email.sentAt && (
                            <span className="text-xs text-muted-foreground">
                              {dayjs(selectedContact.email.sentAt).format('MMM DD, YYYY hh:mm A')}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedContact.email.sent ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-muted-foreground">SMS</span>
                      </div>
                      {selectedContact.sms.sent ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-muted-foreground">WhatsApp</span>
                      </div>
                      {selectedContact.whatsapp.sent ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <Separator />

                  <div className="space-y-2 pt-4">
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Response Status
                      </span>
                      <Badge
                        className={getResponseStatusColor(selectedContact.responseStatus)}
                        variant="secondary"
                      >
                        {formatResponseStatus(selectedContact.responseStatus)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedContact.lead && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-3 text-sm font-semibold">Lead Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between rounded-md bg-muted/50 px-3 py-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Lead Status
                          </span>
                          <Badge
                            className={getStatusColor(selectedContact.lead.status)}
                            variant="secondary"
                          >
                            {selectedContact.lead.status}
                          </Badge>
                        </div>
                        {selectedContact.lead.interestedAt && (
                          <div className="flex items-start justify-between rounded-md bg-muted/50 px-3 py-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Interested At
                            </span>
                            <span className="text-xs font-medium text-right">
                              {dayjs(selectedContact.lead.interestedAt).format(
                                'MMM DD, YYYY hh:mm A',
                              )}
                            </span>
                          </div>
                        )}
                        {selectedContact.lead.consentGivenAt && (
                          <div className="flex items-start justify-between rounded-md bg-muted/50 px-3 py-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Consent Given At
                            </span>
                            <span className="text-xs font-medium text-right">
                              {dayjs(selectedContact.lead.consentGivenAt).format(
                                'MMM DD, YYYY hh:mm A',
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <h4 className="mb-3 text-sm font-semibold">Timestamps</h4>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between rounded-md bg-muted/50 px-3 py-2">
                      <span className="text-xs font-medium text-muted-foreground">Updated At</span>
                      <span className="text-xs font-medium text-right">
                        {dayjs(selectedContact.updatedAt).format('MMM DD, YYYY hh:mm A')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="conversation"
              className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0"
            >
              <CampaignConversation campaignId={campaignId} contactId={selectedContact.id} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
