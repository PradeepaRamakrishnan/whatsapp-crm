'use client';

import dayjs from 'dayjs';
import { Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface MessageDeliveryStatusProps {
  sent?: boolean;
  delivered?: boolean;
  read?: boolean;
  opened?: boolean;
  clicked?: boolean;
  compact?: boolean;
  timestamps?: {
    sent?: string | null;
    delivered?: string | null;
    read?: string | null;
    opened?: string | null;
    clicked?: string | null;
  };
}

export function MessageDeliveryStatus({
  sent = false,
  delivered = false,
  read = false,
  opened = false,
  clicked = false,
  compact = false,
  timestamps = {},
}: MessageDeliveryStatusProps) {
  const statusInfo = {
    sent: {
      label: 'Sent',
      icon: <Check className={compact ? 'h-3 w-3' : 'h-4 w-4'} />,
      timestamp: timestamps.sent,
    },
    delivered: {
      label: 'Delivered',
      icon: (
        <div className="flex gap-0.5">
          <Check className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          <Check className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        </div>
      ),
      timestamp: timestamps.delivered,
    },
    read: {
      label: 'Read',
      icon: (
        <div className="flex gap-0.5">
          <Check className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-blue-500`} />
          <Check className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-blue-500`} />
        </div>
      ),
      timestamp: timestamps.read,
    },
    opened: {
      label: 'Opened',
      icon: <div className={compact ? 'text-xs font-semibold' : 'text-sm font-semibold'}>O</div>,
      timestamp: timestamps.opened,
    },
    clicked: {
      label: 'Clicked',
      icon: <div className={compact ? 'text-xs font-semibold' : 'text-sm font-semibold'}>C</div>,
      timestamp: timestamps.clicked,
    },
  };

  const getStatus = () => {
    if (clicked) return statusInfo.clicked;
    if (opened) return statusInfo.opened;
    if (read) return statusInfo.read;
    if (delivered) return statusInfo.delivered;
    if (sent) return statusInfo.sent;
    return null;
  };

  const currentStatus = getStatus();
  if (!currentStatus) return null;

  const tooltipContent = currentStatus.timestamp
    ? `${currentStatus.label} at ${dayjs(currentStatus.timestamp).format('MMM DD, h:mm A')}`
    : currentStatus.label;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={<div className="flex items-center justify-center text-muted-foreground" />}
        >
          {currentStatus.icon}
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
