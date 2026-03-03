/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
'use client';

import dayjs from 'dayjs';
import { AlertCircle, CheckCheck } from 'lucide-react';
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
    <div className={`flex mb-1 ${isInbound ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`relative max-w-[85%] px-2.5 py-1.5 rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${
          isInbound
            ? 'bg-white dark:bg-zinc-800 rounded-tl-none'
            : 'bg-[#dcf8c6] dark:bg-[#005c4b] rounded-tr-none'
        }`}
      >
        {message.content && (
          <p className="text-[13.5px] leading-[1.4] whitespace-pre-wrap break-words text-[#111b21] dark:text-gray-100 pr-1">
            {message.content}
          </p>
        )}

        {message.error && (
          <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-black/5 dark:border-white/10">
            <AlertCircle className="h-3 w-3 shrink-0 text-red-500 mt-0.5" />
            <p className="text-[11px] text-red-600 dark:text-red-400">
              {typeof message.error === 'string'
                ? message.error
                : (message.error as any)?.message || 'Unknown error'}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-1 mt-0.5 -mr-1">
          <span className="text-[10px] text-[#667781] dark:text-gray-400">
            {dayjs(message.timestamp).format('h:mm A')}
          </span>
          {!isInbound && !message.error && (
            <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb] dark:text-[#aebac1]" />
          )}
          {!isInbound && message.error && <AlertCircle className="h-3 w-3 text-red-500" />}
        </div>
      </div>
    </div>
  );
}
