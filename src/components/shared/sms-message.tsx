'use client';

import dayjs from 'dayjs';
import { AlertCircle } from 'lucide-react';
import type { ConversationMessage } from './conversation-view';
import { MessageDeliveryStatus } from './message-delivery-status';

export interface SMSMessageProps {
  message: ConversationMessage & {
    deliveredAt?: string | null;
    error?: string | null;
  };
}

export function SMSMessage({ message }: SMSMessageProps) {
  const isOutbound = message.sender === 'agent';

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md rounded-xl px-3 py-2 shadow-sm ${
          isOutbound ? 'bg-muted/50 text-foreground' : 'bg-card border text-card-foreground'
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
          <span className="text-xs opacity-60">
            {dayjs(message.timestamp).format('MMM DD, h:mm A')}
          </span>
          {isOutbound && (
            <MessageDeliveryStatus sent={true} delivered={!!message.deliveredAt} compact />
          )}
        </div>
      </div>
    </div>
  );
}
