'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Mail,
  MessageSquare,
  Phone,
  User,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Lead } from '../types';

dayjs.extend(utc);

const getStatusColor = (status: string | undefined) => {
  if (!status)
    return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';

  const s = status.toLowerCase();
  if (s === 'consent_provided') {
    return 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300';
  }
  if (s === 'interested') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
  }
  if (s === 'not_interested') {
    return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300';
  }
  return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-300';
};

const formatStatus = (status: string | undefined) => {
  if (!status) return 'No Response';
  if (status.toLowerCase() === 'consent_provided') return 'Consented';
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

interface ContactDetailsPageProps {
  contact: Lead;
}

export function ContactDetailsPage({ contact }: ContactDetailsPageProps) {
  const email = contact.contact?.email;
  const sms = contact.contact?.sms;
  const whatsapp = contact.contact?.whatsapp;

  type ChannelStatus = Record<string, unknown> | undefined;
  const getBouncedAt = (channel: ChannelStatus) =>
    (channel?.bouncedAt as string | undefined) ||
    (typeof channel?.bounced === 'string' ? channel.bounced : undefined);
  const isBounced = (channel: ChannelStatus) => !!(channel?.bounced || channel?.bouncedAt);

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900/40';
      case 'sms':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-900/40';
      case 'whatsapp':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40';
      case 'phone':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-900/40';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300 border-slate-200 dark:border-slate-900/40';
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4 min-w-0">
      {/* Customer Information Section - Only show if there's data */}
      {(contact.from || contact.dob || contact.panNumber) && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="border-b bg-muted/40 px-4 py-3">
            <h3 className="text-sm font-semibold tracking-wide text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Contact Information
            </h3>
          </div>
          <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Source Channel */}
            {contact.from && (
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors">
                <div
                  className={cn(
                    'p-2 rounded-md bg-muted/50',
                    getChannelColor(contact.from).split(' ')[0],
                  )}
                >
                  {getChannelIcon(contact.from)}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground  tracking-wider">
                    Lead Source
                  </p>
                  <p className="text-sm font-semibold capitalize">{contact.from}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors">
              <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground  tracking-wider">
                  Date of Birth
                </p>
                <p className="text-sm font-semibold">
                  {contact.dob ? (
                    dayjs(contact.dob).format('DD MMM, YYYY')
                  ) : (
                    <span className="text-muted-foreground/60 ">Not set</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors">
              <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground  tracking-wider">
                  PAN Number
                </p>

                <p className="text-sm font-semibold">
                  {contact.panNumber ? (
                    <span> {contact.panNumber} </span>
                  ) : (
                    <span className="text-muted-foreground/60 ">Not set</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        <div>
          <h4 className="text-sm font-semibold tracking-wider mb-4">Campaign Engagement</h4>
          <div className="grid gap-3">
            {/* Email */}
            {email && (
              <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground">Email Channel</span>
                      {email.sent && email.sentAt && (
                        <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                          Sent: {dayjs(email.sentAt).format('MMM DD, YYYY hh:mm A')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-semibold',
                        isBounced(email) ? 'text-rose-600' : 'text-muted-foreground',
                      )}
                    >
                      {isBounced(email) ? 'SENT ERROR' : email.sent ? 'SENT' : 'NOT SENT'}
                    </span>
                    {isBounced(email) ? (
                      <XCircle className="h-5 w-5 text-rose-500" />
                    ) : email.sent ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted/30" />
                    )}
                  </div>
                </div>
                {(email.deliveredAt || isBounced(email)) && (
                  <div className="grid grid-cols-2 gap-2 pl-1 border-l-2 border-blue-100 dark:border-blue-900/40 ml-4 pb-1">
                    {email.deliveredAt && (
                      <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20">
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 tracking-tight">
                          Delivered
                        </span>
                        <span className="text-[10px] font-semibold text-foreground truncate">
                          {dayjs(email.deliveredAt).format('hh:mm A, MMM DD')}
                        </span>
                      </div>
                    )}
                    {isBounced(email) && (
                      <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/20">
                        <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-tight">
                          Undeliverable
                        </span>
                        <span className="text-[10px] font-bold text-foreground truncate">
                          {dayjs(getBouncedAt(email)).format('hh:mm A, MMM DD')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SMS */}
            {sms && (
              <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                      <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground">SMS Channel</span>
                      {sms.sent && sms.sentAt && (
                        <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                          Sent: {dayjs(sms.sentAt).format('MMM DD, YYYY hh:mm A')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-semibold',
                        isBounced(sms) ? 'text-rose-600' : 'text-muted-foreground',
                      )}
                    >
                      {isBounced(sms) ? 'SENT ERROR' : sms.sent ? 'SENT' : 'NOT SENT'}
                    </span>
                    {isBounced(sms) ? (
                      <XCircle className="h-5 w-5 text-rose-500" />
                    ) : sms.sent ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted/30" />
                    )}
                  </div>
                </div>
                {
                  /* sms.deliveredAt || */ isBounced(sms) && (
                    <div className="grid grid-cols-2 gap-2 pl-1 border-l-2 border-green-100 dark:border-green-900/40 ml-4 pb-1">
                      {/* SMS usually doesn't have deliveredAt in Lead type but checking anyway if available */}
                      {(sms as { deliveredAt?: string }).deliveredAt && (
                        <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20">
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 tracking-tight">
                            Delivered
                          </span>
                          <span className="text-[10px] font-semibold text-foreground truncate">
                            {dayjs((sms as { deliveredAt?: string }).deliveredAt).format(
                              'hh:mm A, MMM DD',
                            )}
                          </span>
                        </div>
                      )}
                      {isBounced(sms) && (
                        <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/20">
                          <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-tight">
                            Undeliverable
                          </span>
                          <span className="text-[10px] font-bold text-foreground truncate">
                            {dayjs(getBouncedAt(sms)).format('hh:mm A, MMM DD')}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                }
              </div>
            )}

            {/* WhatsApp */}
            {whatsapp && (
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
                      {whatsapp.sent && whatsapp.sentAt && (
                        <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                          Sent: {dayjs(whatsapp.sentAt).format('MMM DD, YYYY hh:mm A')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-semibold',
                        isBounced(whatsapp) ? 'text-rose-600' : 'text-muted-foreground',
                      )}
                    >
                      {isBounced(whatsapp) ? 'SENT ERROR' : whatsapp.sent ? 'SENT' : 'NOT SENT'}
                    </span>
                    {isBounced(whatsapp) ? (
                      <XCircle className="h-5 w-5 text-rose-500" />
                    ) : whatsapp.sent ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted/30" />
                    )}
                  </div>
                </div>
                {(whatsapp.deliveredAt || isBounced(whatsapp)) && (
                  <div className="grid grid-cols-2 gap-2 pl-1 border-l-2 border-emerald-100 dark:border-emerald-900/40 ml-4 pb-1">
                    {whatsapp.deliveredAt && (
                      <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20">
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 tracking-tight">
                          Delivered
                        </span>
                        <span className="text-[10px] font-semibold text-foreground truncate">
                          {dayjs(whatsapp.deliveredAt).format('hh:mm A, MMM DD')}
                        </span>
                      </div>
                    )}
                    {isBounced(whatsapp) && (
                      <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/20">
                        <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 tracking-tight">
                          Undeliverable
                        </span>
                        <span className="text-[10px] font-bold text-foreground truncate">
                          {dayjs(getBouncedAt(whatsapp)).format('hh:mm A, MMM DD')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-wider">Campaign Response</span>
          </div>
          <Badge className={getStatusColor(contact.status)} variant="secondary">
            {formatStatus(contact.status)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
