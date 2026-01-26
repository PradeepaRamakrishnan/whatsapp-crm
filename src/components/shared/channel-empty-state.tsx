'use client';

import { Mail, MessageCircle, Phone } from 'lucide-react';

export type ChannelType = 'email' | 'whatsapp' | 'sms';

export interface ChannelEmptyStateProps {
  channel: ChannelType;
}

const channelConfig = {
  email: {
    icon: Mail,
    title: 'No emails',
    description: 'No email messages to display',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/10',
  },
  whatsapp: {
    icon: MessageCircle,
    title: 'No WhatsApp messages',
    description: 'No WhatsApp conversations to display',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/10',
  },
  sms: {
    icon: Phone,
    title: 'No SMS messages',
    description: 'No SMS conversations to display',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/10',
  },
};

export function ChannelEmptyState({ channel }: ChannelEmptyStateProps) {
  const config = channelConfig[channel];
  const Icon = config.icon;

  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-3 px-6 py-16 ${config.bgColor}`}
    >
      <Icon className={`h-10 w-10 ${config.color} opacity-40`} />
      <div className="text-center">
        <h3 className="text-base font-medium">{config.title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{config.description}</p>
      </div>
    </div>
  );
}
