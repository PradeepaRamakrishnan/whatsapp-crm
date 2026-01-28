'use client';

import dayjs from 'dayjs';
import { AlertCircle, Check } from 'lucide-react';
import type { ConversationMessage } from './conversation-view';

export interface WhatsAppMessageCardProps {
  message: ConversationMessage & {
    from?: string;
    to?: string;
    error?: string | null;
  };
}

export function WhatsAppMessageCard({ message }: WhatsAppMessageCardProps) {
  const isInbound = message.sender === 'customer';

  return (
    <div className={`flex mb-1.5 ${isInbound ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`relative max-w-[75%] px-2.5 py-1.5 rounded-lg shadow-sm ${
          isInbound
            ? 'bg-white dark:bg-zinc-800 rounded-tl-none'
            : 'bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none'
        }`}
      >
        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100">
            {message.content}
          </p>
        )}

        {message.error && (
          <div className="flex items-start gap-1.5 mt-1.5 pt-1.5 border-t border-gray-200 dark:border-gray-600">
            <AlertCircle className="h-3 w-3 shrink-0 text-red-500 mt-0.5" />
            <p className="text-[11px] text-red-600 dark:text-red-400">
              {typeof message.error === 'string'
                ? message.error
                : // biome-ignore lint/suspicious/noExplicitAny: Error can be object with message property
                  (message.error as any)?.message || 'Unknown error'}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {dayjs(message.timestamp).format('h:mm A')}
          </span>
          {!isInbound && !message.error && (
            <Check className="h-3 w-3 text-gray-600 dark:text-gray-400" />
          )}
          {!isInbound && message.error && <AlertCircle className="h-3 w-3 text-red-500" />}
        </div>
      </div>
    </div>
  );
}
