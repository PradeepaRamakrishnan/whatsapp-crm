'use client';

import dayjs from 'dayjs';
import { AlertCircle, CheckCheck } from 'lucide-react';
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
    <div className={`flex mb-2 ${isInbound ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`relative max-w-[85%] px-3 py-2 rounded-2xl shadow-xs ${
          isInbound
            ? 'bg-muted dark:bg-zinc-800 text-foreground rounded-bl-sm'
            : 'bg-gray-100 rounded-br-sm'
        }`}
      >
        {!isInbound && (
          <div className="text-[10px] opacity-70 mb-1 font-medium flex items-center gap-1">
            <span>SMS</span>
          </div>
        )}

        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {message.error && (
          <div
            className={`flex items-start gap-1.5 mt-2 pt-2 border-t ${isInbound ? 'border-foreground/10' : 'border-white/20'}`}
          >
            <AlertCircle
              className={`h-3 w-3 shrink-0 mt-0.5 ${isInbound ? 'text-rose-500' : 'text-white'}`}
            />
            <p
              className={`text-[11px] ${isInbound ? 'text-rose-600 dark:text-rose-400' : 'text-white'}`}
            >
              {typeof message.error === 'string'
                ? message.error
                : (message.error as any)?.message || 'Unknown error'}
            </p>
          </div>
        )}

        <div
          className={`flex items-center justify-end gap-1 mt-1 ${isInbound ? 'text-muted-foreground' : 'text-white/70'}`}
        >
          <span className="text-[10px]">{dayjs(message.timestamp).format('h:mm A')}</span>
          {!isInbound && !message.error && <CheckCheck className="h-3 w-3" />}
          {!isInbound && message.error && <AlertCircle className="h-3 w-3 text-white" />}
        </div>
      </div>
    </div>
  );
}
