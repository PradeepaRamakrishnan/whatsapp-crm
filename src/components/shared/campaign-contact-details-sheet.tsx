'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { CheckCircle2, Mail, MessageSquare, Phone, User, XCircle } from 'lucide-react';
import { CampaignConversation } from '@/components/shared/campaign-conversation';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CampaignContactData } from '@/features/campaigns/types';

dayjs.extend(utc);

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
        <SheetHeader className="border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm border border-primary/20">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold tracking-tight">
                {selectedContact?.contact.customerName}
              </SheetTitle>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground ">
                  <Mail className="h-3.5 w-3.5 text-blue-500" />
                  <span className="truncate font-medium">
                    {selectedContact?.contact.emailId || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground ">
                  <Phone className="h-3.5 w-3.5 text-green-500" />
                  <span className="truncate font-medium">
                    {selectedContact?.contact.mobileNumber || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        {selectedContact && (
          <Tabs defaultValue="details" className="flex flex-1 flex-col overflow-hidden">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
              <div className="flex flex-col gap-8">
                <div>
                  <h4 className="text-sm font-semibold  tracking-wider  mb-4">
                    Campaign Engagement
                  </h4>
                  <div className="grid gap-3">
                    {/* Email */}
                    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">
                              Email Channel
                            </span>
                            {selectedContact.email.sent && selectedContact.email.sentAt && (
                              <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                Sent:{' '}
                                {dayjs(selectedContact.email.sentAt).format('MMM DD, YYYY hh:mm A')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {selectedContact.email.sent ? 'SENT' : 'NOT SENT'}
                          </span>
                          {selectedContact.email.sent ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted/30" />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-1 border-l-2 border-blue-100 dark:border-blue-900/40 ml-4 pb-1">
                        {selectedContact?.email?.deliveredAt && (
                          <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20">
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400  tracking-tight">
                              Delivered
                            </span>
                            <span className="text-[10px] font-semibold text-foreground truncate">
                              {dayjs(selectedContact?.email?.deliveredAt).format('hh:mm A, MMM DD')}
                            </span>
                          </div>
                        )}
                        {selectedContact?.email?.bouncedAt && (
                          <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/20">
                            <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400  tracking-tight">
                              Bounced
                            </span>
                            <span className="text-[10px] font-bold text-foreground truncate">
                              {dayjs(selectedContact?.email?.bouncedAt).format('hh:mm A, MMM DD')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SMS */}
                    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                            <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">
                              SMS Channel
                            </span>
                            {selectedContact.sms.sent && selectedContact.sms.sentAt && (
                              <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                Sent:{' '}
                                {dayjs(selectedContact.sms.sentAt).format('MMM DD, YYYY hh:mm A')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {selectedContact.sms.sent ? 'SENT' : 'NOT SENT'}
                          </span>
                          {selectedContact.sms.sent ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted/30" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-emerald-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20">
                            <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">
                              WhatsApp Channel
                            </span>
                            {selectedContact.whatsapp.sent && selectedContact.whatsapp.sentAt && (
                              <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                Sent:{' '}
                                {dayjs(selectedContact.whatsapp.sentAt).format(
                                  'MMM DD, YYYY hh:mm A',
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {selectedContact.whatsapp.sent ? 'SENT' : 'NOT SENT'}
                          </span>
                          {selectedContact.whatsapp.sent ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted/30" />
                          )}
                        </div>
                      </div>
                      {(selectedContact?.whatsapp?.deliveredAt ||
                        selectedContact?.whatsapp?.bouncedAt) && (
                        <div className="grid grid-cols-2 gap-2 pl-1 border-l-2 border-emerald-100 dark:border-emerald-900/40 ml-4 pb-1">
                          {selectedContact.whatsapp.deliveredAt && (
                            <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20">
                              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400  tracking-tight">
                                Delivered
                              </span>
                              <span className="text-[10px] font-semibold text-foreground truncate">
                                {dayjs(selectedContact.whatsapp.deliveredAt).format(
                                  'hh:mm A, MMM DD',
                                )}
                              </span>
                            </div>
                          )}
                          {selectedContact.whatsapp.bouncedAt && (
                            <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/20">
                              <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-tight">
                                Bounced
                              </span>
                              <span className="text-[10px] font-bold text-foreground truncate">
                                {dayjs(selectedContact.whatsapp.bouncedAt).format(
                                  'hh:mm A, MMM DD',
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Campaign Response
                    </span>
                  </div>
                  <Badge
                    className={getResponseStatusColor(selectedContact.responseStatus)}
                    variant="secondary"
                  >
                    {formatResponseStatus(selectedContact.responseStatus)}
                  </Badge>
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
