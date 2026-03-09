'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { CheckCircle2, Mail, MessageCircle, MessageSquare, Phone, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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

interface ChannelRowProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  sent: boolean;
  sentAt?: string | null;
  bounced?: boolean;
  bouncedAt?: string | null;
  deliveredAt?: string | null;
  errorTimestamp?: string | null;
}

function ChannelRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  sent,
  sentAt,
  bounced,
  bouncedAt,
  deliveredAt,
  errorTimestamp,
}: ChannelRowProps) {
  const hasError = bounced || !!bouncedAt || !!errorTimestamp;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <div className={`rounded-md p-1.5 ${iconBg}`}>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold">{label}</p>
        {sent && sentAt && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {dayjs(sentAt).format('MMM DD, YYYY · hh:mm A')}
          </p>
        )}
        {!sent && !hasError && <p className="text-[10px] text-muted-foreground mt-0.5">Not sent</p>}
        {hasError && (
          <p className="text-[10px] text-rose-500 mt-0.5">
            Failed · {dayjs(bouncedAt || errorTimestamp).format('MMM DD, hh:mm A')}
          </p>
        )}
        {deliveredAt && !hasError && (
          <p className="text-[10px] text-emerald-600 mt-0.5">
            Delivered · {dayjs(deliveredAt).format('hh:mm A, MMM DD')}
          </p>
        )}
      </div>
      <div className="shrink-0">
        {hasError ? (
          <XCircle className="h-4.5 w-4.5 text-rose-500" />
        ) : sent ? (
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
        ) : (
          <XCircle className="h-4.5 w-4.5 text-muted-foreground/30" />
        )}
      </div>
    </div>
  );
}

interface CampaignContactDetailsSheetProps {
  campaignId: string;
  selectedContact: CampaignContactData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignContactDetailsSheet({
  campaignId: _campaignId,
  selectedContact,
  open,
  onOpenChange,
}: CampaignContactDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-sm">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-sm font-semibold">
            {selectedContact?.contact.customerName}
          </SheetTitle>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 text-blue-500 shrink-0" />
              <span>{selectedContact?.contact.emailId || '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 text-green-500 shrink-0" />
              <span>{selectedContact?.contact.mobileNumber || '—'}</span>
            </div>
          </div>
        </SheetHeader>

        {selectedContact && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Delivery Status
            </p>
            <div className="flex flex-col gap-2">
              <ChannelRow
                icon={Mail}
                iconColor="text-blue-600 dark:text-blue-400"
                iconBg="bg-blue-50 dark:bg-blue-900/20"
                label="Email"
                sent={selectedContact.email.sent}
                sentAt={selectedContact.email.sentAt}
                bounced={selectedContact.email.bounced === true}
                bouncedAt={selectedContact.email.bouncedAt}
                deliveredAt={selectedContact.email.deliveredAt}
                errorTimestamp={selectedContact.email.error?.timestamp}
              />
              <ChannelRow
                icon={MessageCircle}
                iconColor="text-emerald-600 dark:text-emerald-400"
                iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                label="WhatsApp"
                sent={selectedContact.whatsapp.sent}
                sentAt={selectedContact.whatsapp.sentAt}
                bounced={selectedContact.whatsapp.bounced}
                bouncedAt={selectedContact.whatsapp.bouncedAt}
                deliveredAt={selectedContact.whatsapp.deliveredAt}
                errorTimestamp={selectedContact.whatsapp.error?.timestamp}
              />
              <ChannelRow
                icon={MessageSquare}
                iconColor="text-green-600 dark:text-green-400"
                iconBg="bg-green-50 dark:bg-green-900/20"
                label="SMS"
                sent={selectedContact.sms.sent}
                sentAt={selectedContact.sms.sentAt}
                bounced={selectedContact.sms.bounced}
                bouncedAt={selectedContact.sms.bouncedAt}
                deliveredAt={selectedContact.sms.deliveredAt}
                errorTimestamp={selectedContact.sms.error?.timestamp}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
              <span className="text-xs font-semibold">Response</span>
              <Badge
                className={getResponseStatusColor(selectedContact.responseStatus)}
                variant="secondary"
              >
                {formatResponseStatus(selectedContact.responseStatus)}
              </Badge>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
