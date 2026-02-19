'use client';

import dayjs from 'dayjs';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  User,
  XCircle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { FileRecord } from '../types/file.types';

interface FileRecordDetailsSheetProps {
  record: FileRecord | null;
  onOpenChange: (open: boolean) => void;
}

export function FileRecordDetailsSheet({ record, onOpenChange }: FileRecordDetailsSheetProps) {
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

  return (
    <Sheet open={!!record} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-4xl">
        <SheetHeader className="border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm border border-primary/20">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold tracking-tight">
                {record?.customerName}
              </SheetTitle>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-blue-500" />
                  <span className="truncate font-medium">{record?.emailId || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-green-500" />
                  <span className="truncate font-medium">{record?.mobileNumber || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        {record && (
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 mt-4 pb-4">
            {record.isExcluded && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Excluded Record</AlertTitle>
                <AlertDescription className="space-y-3 mt-2">
                  <p>This record has been excluded and will not be included in campaigns.</p>

                  <Separator className="bg-destructive/20" />

                  <div className="pt-1">
                    <p className="font-semibold mb-1.5">Reason:</p>
                    <p>
                      This record has previously shown interest, indicated no interest, or entered
                      the consent process in a previous campaign.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h4 className="my-6 text-sm font-bold text-muted-foreground  ">Campaign History</h4>
              {record.campaigns && record.campaigns.length > 0 ? (
                <div className="space-y-6">
                  {record.campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="rounded-xl border bg-white dark:bg-slate-950 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Campaign Header */}
                      <div className="p-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2">
                            <Copy className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <dt className="text-[10px] font-bold text-muted-foreground  mb-0.5">
                              Campaign
                            </dt>
                            <dd className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {campaign.name}
                            </dd>
                          </div>
                          {campaign.lastRun && (
                            <div className="text-right">
                              <dt className="text-[10px] font-bold text-muted-foreground  mb-0.5">
                                Execution Date
                              </dt>
                              <dd className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                {dayjs(campaign.lastRun).format('MMM DD, YYYY')}
                              </dd>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <h5 className="text-sm font-semibold tracking-wider px-1">
                          Campaign Engagement
                        </h5>

                        <div className="grid gap-3">
                          {/* Email Channel Card */}
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
                                  {campaign.channels?.email?.sentAt && (
                                    <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                      Sent:{' '}
                                      {dayjs(campaign.channels.email.sentAt).format(
                                        'MMM DD, YYYY hh:mm A',
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-semibold ${campaign.channels?.email?.sent ? 'text-muted-foreground' : 'text-muted-foreground'}`}
                                >
                                  {campaign.channels?.email?.sent ? 'SENT' : 'NOT SENT'}
                                </span>
                                {campaign.channels?.email?.sent ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-muted-foreground/30" />
                                )}
                              </div>
                            </div>
                            {campaign.channels?.email?.deliveredAt && (
                              <div className="grid grid-cols-2 gap-2 pl-1 border-l-2 border-blue-100 dark:border-blue-900/40 ml-4 pb-1">
                                <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20">
                                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 tracking-tight">
                                    Delivered
                                  </span>
                                  <span className="text-[10px] font-semibold text-foreground truncate">
                                    {dayjs(campaign.channels.email.deliveredAt).format(
                                      'hh:mm A, MMM DD',
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* SMS Channel Card */}
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
                                  {campaign.channels?.sms?.sentAt && (
                                    <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                      Sent:{' '}
                                      {dayjs(campaign.channels.sms.sentAt).format(
                                        'MMM DD, YYYY hh:mm A',
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-muted-foreground">
                                  {campaign.channels?.sms?.sent ? 'SENT' : 'NOT SENT'}
                                </span>
                                {campaign.channels?.sms?.sent ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-muted-foreground/30" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* WhatsApp Channel Card */}
                          <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-emerald-200">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20">
                                  <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-foreground">
                                    WhatsApp Channel
                                  </span>
                                  {campaign.channels?.whatsapp?.sentAt && (
                                    <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                      Sent:{' '}
                                      {dayjs(campaign.channels.whatsapp.sentAt).format(
                                        'MMM DD, YYYY hh:mm A',
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-muted-foreground">
                                  {campaign.channels?.whatsapp?.sent ? 'SENT' : 'NOT SENT'}
                                </span>
                                {campaign.channels?.whatsapp?.sent ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-muted-foreground/30" />
                                )}
                              </div>
                            </div>
                            {campaign.channels?.whatsapp?.deliveredAt && (
                              <div className="grid grid-cols-2 gap-2 pl-1 border-l-2 border-emerald-100 dark:border-emerald-900/40 ml-4 pb-1">
                                <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20">
                                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 tracking-tight">
                                    Delivered
                                  </span>
                                  <span className="text-[10px] font-semibold text-foreground truncate">
                                    {dayjs(campaign.channels.whatsapp.deliveredAt).format(
                                      'hh:mm A, MMM DD',
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Response Status */}
                        {campaign.responseStatus && (
                          <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm mt-2">
                            <span className="text-sm font-semibold tracking-wider">
                              Campaign Response
                            </span>
                            <Badge
                              variant="secondary"
                              className={`font-bold h-6 text-[10px] px-2 ${getResponseStatusColor(campaign.responseStatus as 'interested' | 'not_interested' | null)}`}
                            >
                              {formatResponseStatus(
                                campaign.responseStatus as 'interested' | 'not_interested' | null,
                              )}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="rounded-full bg-slate-100 p-4 mb-4">
                    <Copy className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    No Campaigns Found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    This record has not been included in any marketing campaigns yet.
                  </p>
                </div>
              )}
            </div>

            {record.additionalData && Object.keys(record.additionalData).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-3 text-sm font-semibold">Additional Information</h4>
                  <div className="grid gap-2">
                    {Object.entries(record.additionalData).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                      >
                        <span className="text-xs font-medium capitalize text-muted-foreground">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
