'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  XCircle,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { CallingStatus, CampaignContactData, ChannelStatus } from '@/features/campaigns/types';

dayjs.extend(utc);

const CONTACT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
  },
  completed: {
    label: 'Completed',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400',
  },
};

const RESPONSE_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  interested: {
    label: 'Interested',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  not_interested: {
    label: 'Not Interested',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
  },
  no_response: {
    label: 'No Response',
    className:
      'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400',
  },
};

function StatusBadge({
  status,
  configMap,
}: {
  status: string;
  configMap: Record<string, { label: string; className: string }>;
}) {
  const cfg = configMap[status] ?? configMap.no_response ?? configMap.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function ChannelRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  data,
  extra,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  data: ChannelStatus | CallingStatus;
  extra?: React.ReactNode;
}) {
  const hasError = !!('bounced' in data && data.bounced) || !!('error' in data && data.error);
  const { sent, sentAt } = data;
  const deliveredAt = 'deliveredAt' in data ? data.deliveredAt : null;
  const bouncedAt = 'bouncedAt' in data ? data.bouncedAt : null;
  const readAt = 'readAt' in data ? data.readAt : null;

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3">
      <div className={`rounded-md p-1.5 mt-0.5 ${iconBg}`}>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold">{label}</p>
        {sent && sentAt ? (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Sent · {dayjs(sentAt).format('MMM DD, YYYY · hh:mm A')}
          </p>
        ) : hasError ? (
          <p className="text-[10px] text-rose-500 mt-0.5">
            Failed{bouncedAt ? ` · ${dayjs(bouncedAt).format('MMM DD, hh:mm A')}` : ''}
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground mt-0.5">Pending</p>
        )}
        {deliveredAt && !hasError && (
          <p className="text-[10px] text-emerald-600 mt-0.5">
            Delivered · {dayjs(deliveredAt).format('hh:mm A, MMM DD')}
          </p>
        )}
        {readAt && (
          <p className="text-[10px] text-blue-500 mt-0.5">
            Read · {dayjs(readAt).format('hh:mm A, MMM DD')}
          </p>
        )}
        {extra}
      </div>
      <div className="shrink-0 mt-0.5">
        {hasError ? (
          <XCircle className="h-4 w-4 text-rose-500" />
        ) : sent ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <Clock className="h-4 w-4 text-muted-foreground/30" />
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
          <div className="flex items-start justify-between gap-2">
            <SheetTitle className="text-sm font-semibold">
              {selectedContact?.contact.customerName}
            </SheetTitle>
            {selectedContact && (
              <StatusBadge status={selectedContact.status} configMap={CONTACT_STATUS_CONFIG} />
            )}
          </div>
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
            {/* Response status */}
            <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
              <span className="text-xs font-semibold">Response</span>
              <StatusBadge
                status={selectedContact.responseStatus ?? 'no_response'}
                configMap={RESPONSE_STATUS_CONFIG}
              />
            </div>

            {/* Channel delivery */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Delivery Status
              </p>
              <div className="flex flex-col gap-2">
                <ChannelRow
                  icon={Mail}
                  iconColor="text-violet-600"
                  iconBg="bg-violet-50 dark:bg-violet-900/20"
                  label="Email"
                  data={selectedContact.email}
                />
                <ChannelRow
                  icon={MessageCircle}
                  iconColor="text-emerald-600"
                  iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                  label="WhatsApp"
                  data={selectedContact.whatsapp}
                  extra={
                    selectedContact.whatsapp.read ? (
                      <p className="text-[10px] text-blue-500 mt-0.5 flex items-center gap-1">
                        <Eye className="h-2.5 w-2.5" /> Read
                      </p>
                    ) : null
                  }
                />
                <ChannelRow
                  icon={MessageSquare}
                  iconColor="text-sky-600"
                  iconBg="bg-sky-50 dark:bg-sky-900/20"
                  label="SMS"
                  data={selectedContact.sms}
                />
                <ChannelRow
                  icon={Phone}
                  iconColor="text-orange-600"
                  iconBg="bg-orange-50 dark:bg-orange-900/20"
                  label="Call"
                  data={selectedContact.calling}
                  extra={
                    selectedContact.calling.callUuid ? (
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">
                        {selectedContact.calling.callUuid}
                      </p>
                    ) : null
                  }
                />
              </div>
            </div>

            {/* Timestamps */}
            <div className="rounded-lg border bg-card px-4 py-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Timestamps
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {dayjs(selectedContact.createdAt).format('MMM DD, YYYY · hh:mm A')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">
                  {dayjs(selectedContact.updatedAt).format('MMM DD, YYYY · hh:mm A')}
                </span>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
