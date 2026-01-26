'use client';

import dayjs from 'dayjs';
import { AlertCircle } from 'lucide-react';
import type { ConversationMessage } from './conversation-view';
import { MessageDeliveryStatus } from './message-delivery-status';

export interface WhatsAppMessageProps {
  message: ConversationMessage & {
    deliveredAt?: string | null;
    readAt?: string | null;
    error?: string | null;
  };
}

export function WhatsAppMessage({ message }: WhatsAppMessageProps) {
  const isOutbound = message.sender === 'agent';

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md rounded-xl px-3 py-2 shadow-sm ${
          isOutbound
            ? 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-50'
            : 'bg-card border text-card-foreground'
        }`}
      >
        {!isOutbound && <p className="text-xs font-medium mb-1 opacity-70">{message.senderName}</p>}

        {message.error && (
          <div className="mb-2 flex items-start gap-1.5 rounded-md bg-destructive/20 p-1.5">
            <AlertCircle className="h-3 w-3 shrink-0 text-destructive mt-0.5" />
            <p className="text-xs text-destructive">{message.error}</p>
          </div>
        )}

        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>

        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-xs opacity-60">{dayjs(message.timestamp).format('h:mm A')}</span>
          {isOutbound && (
            <MessageDeliveryStatus
              sent={true}
              delivered={!!message.deliveredAt}
              read={!!message.readAt}
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
}
