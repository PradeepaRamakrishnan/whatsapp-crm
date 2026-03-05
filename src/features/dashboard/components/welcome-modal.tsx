'use client';

import { Briefcase, FileSpreadsheet, MessageCircle, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const STEPS = [
  {
    step: 1,
    icon: MessageCircle,
    color: 'bg-emerald-500',
    title: 'Connect WhatsApp',
    desc: 'Link your WhatsApp Business account to start sending messages to recipients.',
    href: '/whatsapp/connect',
    action: 'Connect Now',
  },
  {
    step: 2,
    icon: FileSpreadsheet,
    color: 'bg-blue-500',
    title: 'Add Recipients',
    desc: 'Upload a CSV file, import from WhatsApp contacts, or enter recipients manually.',
    href: '/files/upload',
    action: 'Upload File',
  },
  {
    step: 3,
    icon: Briefcase,
    color: 'bg-violet-500',
    title: 'Create a Campaign',
    desc: 'Set up message templates, schedule timing, and launch your first outreach campaign.',
    href: '/campaigns/create',
    action: 'Create Campaign',
  },
  {
    step: 4,
    icon: TrendingUp,
    color: 'bg-orange-500',
    title: 'Track Leads',
    desc: 'Monitor responses, mark interested leads, and manage follow-ups from the dashboard.',
    href: '/leads/list',
    action: 'View Leads',
  },
];

const STORAGE_KEY = 'samatva_welcome_seen';

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-linear-to-br from-primary to-primary/80 px-6 py-5 text-primary-foreground">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-4 top-4 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70 mb-1">
            Welcome to Samatva CRM
          </p>
          <h2 className="text-xl font-bold leading-tight">Get started in 4 steps</h2>
          <p className="mt-1 text-sm opacity-75">
            Follow these steps to launch your first campaign.
          </p>
        </div>

        {/* Steps */}
        <div className="divide-y divide-border/50">
          {STEPS.map(({ step, icon: Icon, color, title, desc, href, action }) => (
            <div key={step} className="flex items-start gap-4 px-6 py-4">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color} text-white text-[11px] font-bold`}
              >
                {step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[13px] font-semibold">{title}</p>
                </div>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
              <Link
                href={href}
                onClick={dismiss}
                className="shrink-0 rounded-md border border-border/60 px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted/50"
              >
                {action}
              </Link>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 px-6 py-3 bg-muted/20">
          <p className="text-[11px] text-muted-foreground/60">
            You can revisit this guide from the dashboard anytime.
          </p>
          <Button size="sm" className="h-8 px-4 text-xs" onClick={dismiss}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
