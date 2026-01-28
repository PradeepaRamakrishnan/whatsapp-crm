'use client';

import dayjs from 'dayjs';
import { AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';
import type { ConversationMessage } from './conversation-view';

export interface SMSMessageCardProps {
  message: ConversationMessage & {
    from?: string;
    to?: string;
    error?: string | null;
  };
}

export function SMSMessageCard({ message }: SMSMessageCardProps) {
  const isInbound = message.sender === 'customer';

  return (
    <div className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm truncate">{message.senderName}</span>
          {isInbound ? (
            <ArrowDown className="h-3 w-3 text-muted-foreground shrink-0" />
          ) : (
            <ArrowUp className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {dayjs(message.timestamp).format('MMM DD h:mm A')}
        </span>
      </div>

      {(message.from || message.to) && (
        <div className="text-xs text-muted-foreground mb-2 flex flex-wrap gap-x-3 gap-y-0.5">
          {message.from && <span>{message.from}</span>}
          {message.to && <span>→ {message.to}</span>}
        </div>
      )}

      {message.error && (
        <div className="flex items-start gap-1.5 bg-destructive/10 border border-destructive/20 p-2 rounded mb-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive mt-0.5" />
          <p className="text-xs text-destructive">
            {typeof message.error === 'string'
              ? message.error
              : // biome-ignore lint/suspicious/noExplicitAny: Error can be object with message property
                (message.error as any)?.message || 'Unknown error'}
          </p>
        </div>
      )}

      {message.content && (
        <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
          {message.content}
        </div>
      )}
    </div>
  );
}
