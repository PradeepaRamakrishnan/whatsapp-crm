'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, Check, FileSpreadsheet, MessageCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { getOverviewCounts } from '../services';

const CHECKLIST = [
  {
    key: 'whatsapp' as const,
    icon: MessageCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    doneBg: 'bg-emerald-500',
    title: 'Connect WhatsApp',
    desc: 'Link your WhatsApp Business account',
    href: '/whatsapp/connect',
    isDone: () => false, // always show as actionable — no API count for WA accounts here
  },
  {
    key: 'files' as const,
    icon: FileSpreadsheet,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    doneBg: 'bg-blue-500',
    title: 'Add Recipients',
    desc: 'Upload a file, import WhatsApp contacts, or enter manually',
    href: '/files/upload',
    isDone: (counts: { totalFiles: number }) => counts.totalFiles > 0,
  },
  {
    key: 'campaigns' as const,
    icon: Briefcase,
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    doneBg: 'bg-violet-500',
    title: 'Create a Campaign',
    desc: 'Set up templates, channels, and launch outreach',
    href: '/campaigns/create',
    isDone: (counts: { totalCampaigns: number }) => counts.totalCampaigns > 0,
  },
  {
    key: 'leads' as const,
    icon: TrendingUp,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    doneBg: 'bg-orange-500',
    title: 'Track Leads',
    desc: 'Monitor interested responses and follow up',
    href: '/leads/list',
    isDone: (counts: { totalLeads: number }) => counts.totalLeads > 0,
  },
];

interface OverviewCounts {
  totalCampaigns: number;
  totalLeads: number;
  conversionRate: string;
  totalFiles: number;
}

export function GettingStarted() {
  const { data: counts } = useQuery<OverviewCounts>({
    queryKey: ['overview-counts'],
    queryFn: () => getOverviewCounts(),
    retry: false,
  });

  const allDone = counts && counts.totalFiles > 0 && counts.totalCampaigns > 0;

  if (allDone) return null;

  const completedCount = counts
    ? [counts.totalFiles > 0, counts.totalCampaigns > 0, counts.totalLeads > 0].filter(Boolean)
        .length + 1 // +1 for whatsapp (assume connected if they're here)
    : 0;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
        <div>
          <h3 className="text-sm font-semibold">Getting Started</h3>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">
            Complete these steps to launch your first campaign
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min((completedCount / 4) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
            {completedCount}/4
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="grid divide-y divide-border/40 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {CHECKLIST.map(({ key, icon: Icon, color, bg, doneBg, title, desc, href, isDone }) => {
          const done = counts ? isDone(counts as OverviewCounts) : false;
          return (
            <Link
              key={key}
              href={done ? '#' : href}
              className={`flex items-start gap-3.5 px-5 py-4 transition-colors ${done ? 'pointer-events-none opacity-60' : 'hover:bg-muted/30'}`}
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${done ? doneBg : bg}`}
              >
                {done ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Icon className={`h-4 w-4 ${color}`} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[12.5px] font-semibold ${done ? 'line-through text-muted-foreground/50' : ''}`}
                >
                  {title}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
