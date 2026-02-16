'use client';

import dayjs from 'dayjs';
import { Clock, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ConversationMessage } from './conversation-view';

export interface CallMessageCardProps {
  message: ConversationMessage & {
    callDuration?: number | null;
    callOutcome?: string | null;
    callNotes?: string | null;
  };
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  return `${m}m ${s}s`;
}

export function CallMessageCard({ message }: CallMessageCardProps) {
  const isInbound = message.sender === 'customer';
  const duration = message.callDuration || 0;
  const outcome = message.callOutcome?.toLowerCase() || 'unknown';

  let Icon = Phone;
  if (outcome === 'missed') Icon = PhoneMissed;
  else if (isInbound) Icon = PhoneIncoming;
  else Icon = PhoneOutgoing;

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-full ${isInbound ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {isInbound ? 'Incoming Call' : 'Outgoing Call'}
            </span>
            <span className="text-xs text-muted-foreground">
              {dayjs(message.timestamp).format('MMM DD, h:mm A')}
            </span>
          </div>
        </div>

        {message.callOutcome && (
          <Badge variant="outline" className="capitalize">
            {message.callOutcome.replace('_', ' ')}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>Duration: {formatDuration(duration)}</span>
        </div>
        <div>{isInbound ? `From: ${message.senderName}` : `By: ${message.senderName}`}</div>
      </div>

      {message.callNotes && (
        <div className=" rounded-md p-3 text-sm border border-border/50">
          {/* <p className="font-medium text-xs text-muted-foreground mb-1">Notes</p> */}
          <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
            {message.callNotes}
          </p>
        </div>
      )}
    </div>
  );
}
