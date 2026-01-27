'use client';

import dayjs from 'dayjs';
import { AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';
import type { ConversationMessage } from './conversation-view';
// import { MessageDeliveryStatus } from './message-delivery-status';

export interface EmailMessageCardProps {
  message: ConversationMessage & {
    subject?: string | null;
    from?: string;
    to?: string;
    readAt?: string | null;
    openedAt?: string | null;
    clickedAt?: string | null;
    error?: string | null;
  };
}

export function EmailMessageCard({ message }: EmailMessageCardProps) {
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

      {message.subject && (
        <h4 className="text-sm font-semibold mb-2 text-foreground line-clamp-2">
          {message.subject}
        </h4>
      )}

      {(message.from || message.to) && (
        <div className="text-xs text-muted-foreground mb-2 flex flex-wrap gap-x-3 gap-y-0.5">
          {message.from && <span>{message.from}</span>}
          {message.to && <span>→ {message.to}</span>}
        </div>
      )}

      {message.error && (
        <div className="flex items-start gap-1.5 bg-destructive/10 border border-destructive/20 p-2 rounded mb-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive mt-0.5" />
          <p className="text-xs text-destructive">{message.error}</p>
        </div>
      )}

      {message.content && (
        <div className="text-sm leading-relaxed text-foreground/90">
          {message.content.includes('<') ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-full overflow-x-auto"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              // biome-ignore lint/style/useNamingConvention: <explanation>
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      )}
    </div>
  );
}
