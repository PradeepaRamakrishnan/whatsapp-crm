'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  // BadgeIndianRupee,
  CheckCircle2,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  User,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { CampaignContactData, ChannelOrderItem } from '@/features/campaigns/types';

dayjs.extend(utc);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RESPONSE_STATUS: Record<string, { label: string; className: string }> = {
  interested: {
    label: 'Interested',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
  },
  not_interested: {
    label: 'Not Interested',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
  },
  consent: {
    label: 'Consent',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
  },
};

function getResponseStatusConfig(status: 'interested' | 'not_interested' | null) {
  if (!status) {
    return {
      label: 'No Response',
      className:
        'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950 dark:text-slate-400',
    };
  }
  return (
    RESPONSE_STATUS[status] ?? {
      label: status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      className: 'bg-slate-50 text-slate-600 border-slate-200',
    }
  );
}

function formatDelay(ms: number): string {
  if (ms === 0) return 'Immediate';
  if (ms < 60_000) return `+${ms / 1000}s delay`;
  if (ms < 3_600_000) return `+${Math.round(ms / 60_000)}m delay`;
  return `+${Math.round(ms / 3_600_000)}h delay`;
}

// ─── Channel config ───────────────────────────────────────────────────────────

const CHANNEL_META: Record<
  string,
  { label: string; icon: React.ElementType; iconColor: string; iconBg: string }
> = {
  email: {
    label: 'Email',
    icon: Mail,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: MessageCircle,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  sms: {
    label: 'SMS',
    icon: MessageSquare,
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
  },
  calling: {
    label: 'Call',
    icon: Phone,
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ContactAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20 shrink-0">
      <span className="text-sm font-bold text-primary">{initials}</span>
    </div>
  );
}

// function InfoRow({
//   icon: Icon,
//   iconColor,
//   iconBg,
//   label,
//   value,
// }: {
//   icon: React.ElementType;
//   iconColor: string;
//   iconBg: string;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex items-center gap-3">
//       <div
//         className={`flex h-7 w-7 items-center justify-center rounded-md ${iconBg} shrink-0`}
//       >
//         <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
//       </div>
//       <div className="min-w-0 flex-1">
//         <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
//           {label}
//         </p>
//         <p className="truncate text-xs font-medium">{value}</p>
//       </div>
//     </div>
//   );
// }

function ChannelStepRow({
  step,
  stepNumber,
  channelData,
}: {
  step: ChannelOrderItem;
  stepNumber: number;
  channelData:
    | {
        sent: boolean;
        sentAt?: string | null;
        bounced?: boolean;
        bouncedAt?: string | null;
        deliveredAt?: string | null;
        error?: { timestamp?: string } | null;
      }
    | undefined;
}) {
  const meta = CHANNEL_META[step.channel];
  if (!meta) return null;

  const Icon = meta.icon;
  const sent = channelData?.sent ?? false;
  const hasError =
    channelData?.bounced || !!channelData?.bouncedAt || !!channelData?.error?.timestamp;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3.5 py-3">
      {/* Step number badge */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className={`rounded-md p-1.5 ${meta.iconBg}`}>
          <Icon className={`h-3.5 w-3.5 ${meta.iconColor}`} />
        </div>
        <span className="text-[9px] font-semibold text-muted-foreground/60">#{stepNumber}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold">{meta.label}</p>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground">{formatDelay(step.delayMs)}</span>
        </div>

        {sent && channelData?.sentAt && !hasError && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Sent · {dayjs(channelData.sentAt).format('DD MMM YYYY · hh:mm A')}
          </p>
        )}
        {sent && channelData?.deliveredAt && !hasError && (
          <p className="text-[10px] text-emerald-600 mt-0.5">
            Delivered · {dayjs(channelData.deliveredAt).format('hh:mm A, DD MMM')}
          </p>
        )}
        {!sent && !hasError && <p className="text-[10px] text-muted-foreground mt-0.5">Not sent</p>}
        {hasError && (
          <p className="text-[10px] text-rose-500 mt-0.5">
            Failed ·{' '}
            {dayjs(channelData?.bouncedAt || channelData?.error?.timestamp).format(
              'DD MMM · hh:mm A',
            )}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {hasError ? (
          <XCircle className="h-4 w-4 text-rose-500" />
        ) : sent ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground/25" />
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CampaignContactDetailsSheetProps {
  campaignId: string;
  selectedContact: CampaignContactData | null;
  channelOrder?: ChannelOrderItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignContactDetailsSheet({
  campaignId: _campaignId,
  selectedContact,
  channelOrder = [],
  open,
  onOpenChange,
}: CampaignContactDetailsSheetProps) {
  const contact = selectedContact?.contact;
  const responseConfig = getResponseStatusConfig(selectedContact?.responseStatus ?? null);

  const steps = channelOrder.filter((item) => item.enabled);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-sm p-0">
        {/* ── Header ── */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b">
          <div className="flex items-start gap-3.5">
            {contact ? (
              <ContactAvatar name={contact.customerName} />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted shrink-0">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              <SheetTitle className="text-sm font-semibold leading-tight truncate">
                {contact?.customerName ?? '—'}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {contact?.mobileNumber || contact?.emailId || '—'}
              </p>
              <div className="mt-2">
                <Badge
                  className={`text-[10px] px-2 py-0.5 border font-medium ${responseConfig.className}`}
                  variant="secondary"
                >
                  {responseConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        {selectedContact && (
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6 pt-4">
            {/* ── Channel Order / Delivery Status ── */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Delivery Status
              </p>
              <div className="flex flex-col gap-2">
                {steps.length > 0 ? (
                  steps.map((step, idx) => (
                    <ChannelStepRow
                      key={`${step.channel}-${idx}`}
                      step={step}
                      stepNumber={idx + 1}
                      channelData={
                        selectedContact[step.channel as keyof CampaignContactData] as Parameters<
                          typeof ChannelStepRow
                        >[0]['channelData']
                      }
                    />
                  ))
                ) : (
                  /* Fallback when no channelOrder — show all three channels */
                  <>
                    <ChannelStepRow
                      step={{ channel: 'email', delayMs: 0, enabled: true, templateId: '' }}
                      stepNumber={1}
                      channelData={selectedContact.email}
                    />
                    <ChannelStepRow
                      step={{ channel: 'whatsapp', delayMs: 0, enabled: true, templateId: '' }}
                      stepNumber={2}
                      channelData={selectedContact.whatsapp}
                    />
                    <ChannelStepRow
                      step={{ channel: 'sms', delayMs: 0, enabled: true, templateId: '' }}
                      stepNumber={3}
                      channelData={selectedContact.sms}
                    />
                  </>
                )}
              </div>
            </div>

            {/* ── Added On ── */}
            <p className="text-[10px] text-muted-foreground text-center">
              Added {dayjs(selectedContact.createdAt).format('DD MMM YYYY · hh:mm A')}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
