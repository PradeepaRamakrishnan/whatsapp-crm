'use client';

import { CheckCircle2, CreditCard, Mail, MessageSquare, Phone, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '../types';

interface ContactDetailsPageProps {
  contact: Lead;
}

export function ContactDetailsPage({ contact }: ContactDetailsPageProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5" />;
      case 'whatsapp':
        return <MessageSquare className="h-5 w-5" />;
      case 'phone':
        return <Phone className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
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
      {/* Header with Contact Name and Source Channel */}

      {/* Contact Info Card: Source Channel, DOB, PAN */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Contact Details</span>
            {contact.from && (
              <Badge
                variant="outline"
                className={`text-xs font-medium px-3 py-1 capitalize flex items-center gap-2 ${getChannelColor(
                  contact.from,
                )}`}
              >
                {getChannelIcon(contact.from)}
                {contact.from}
              </Badge>
            )}
          </div>

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Date of Birth</span>
              <span className="text-sm font-medium mt-1">
                {contact.dob
                  ? new Date(contact.dob).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">PAN Number</span>
              <span className="text-sm font-medium mt-1">{contact.panNumber || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Engagement Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Campaign Engagement</h3>

        {/* Email Channel */}
        {contact.contact?.email && (
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2.5 dark:bg-blue-900/20">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">Email Channel</span>
                  {contact.contact.email.sentAt && (
                    <span className="text-xs font-medium text-muted-foreground mt-0.5">
                      Sent: {new Date(contact.contact.email.sentAt).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase">
                  {contact.contact.email.bouncedAt
                    ? 'Bounced'
                    : contact.contact.email.deliveredAt
                      ? 'Sent'
                      : contact.contact.email.sent
                        ? 'Sent'
                        : 'Not Sent'}
                </span>
                {contact.contact.email.bouncedAt ? (
                  <XCircle className="h-5 w-5 text-rose-500" />
                ) : contact.contact.email.sent ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted/30" />
                )}
              </div>
            </div>

            {(contact.contact.email.deliveredAt || contact.contact.email.bouncedAt) && (
              <div className="grid grid-cols-1 gap-2 pl-4 border-l-2 border-blue-200 dark:border-blue-900/40 ml-2">
                {contact.contact.email.deliveredAt && (
                  <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20">
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Delivered
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {new Date(contact.contact.email.deliveredAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {contact.contact.email.bouncedAt && (
                  <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/20">
                    <span className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase">
                      Bounced
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {new Date(contact.contact.email.bouncedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SMS Channel */}
        {contact.contact?.sms && (
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-sky-50 p-2.5 dark:bg-sky-900/20">
                  <MessageSquare className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">SMS Channel</span>
                  {contact.contact.sms.sentAt && (
                    <span className="text-xs font-medium text-muted-foreground mt-0.5">
                      Sent: {new Date(contact.contact.sms.sentAt).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase">
                  {contact.contact.sms.sent ? 'Sent' : 'Not Sent'}
                </span>
                {contact.contact.sms.sent ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted/30" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Channel */}
        {contact.contact?.whatsapp && (
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-900/20">
                  <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">WhatsApp Channel</span>
                  {contact.contact.whatsapp.sentAt && (
                    <span className="text-xs font-medium text-muted-foreground mt-0.5">
                      Sent: {new Date(contact.contact.whatsapp.sentAt).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase">
                  {contact.contact.whatsapp.sent ? 'Sent' : 'Not Sent'}
                </span>
                {contact.contact.whatsapp.sent ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted/30" />
                )}
              </div>
            </div>

            {contact.contact.whatsapp.deliveredAt && (
              <div className="grid grid-cols-1 gap-2 pl-4 border-l-2 border-emerald-200 dark:border-emerald-900/40 ml-2">
                <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Delivered
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {new Date(contact.contact.whatsapp.deliveredAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Campaign Response Section */}
      <div className="mt-6">
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-50 p-2.5 dark:bg-orange-900/20">
                <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-semibold text-foreground">CAMPAIGN RESPONSE</span>
            </div>
            {contact.status && (
              <Badge
                variant="outline"
                className={`capitalize text-xs font-semibold px-3 py-1.5 ${getChannelColor(contact.status)}`}
              >
                {contact.status}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
