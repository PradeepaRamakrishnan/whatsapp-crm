'use client';

import { Archive, Copy, Edit, Eye, Mail, MessageSquare, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TemplateData } from '../types/template.types';

interface TemplateCardProps {
  template: TemplateData;
}

const getChannelIcon = (channel: TemplateData['channel']) => {
  switch (channel) {
    case 'email':
      return Mail;
    case 'sms':
      return Phone;
    case 'whatsapp':
      return MessageSquare;
    default:
      return Mail;
  }
};

const getStatusColor = (
  status: TemplateData['status'],
): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string } => {
  switch (status) {
    case 'approved':
      return {
        variant: 'default',
        className:
          'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800',
      };
    case 'pending':
      return {
        variant: 'secondary',
        className:
          'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800',
      };
    case 'rejected':
      return { variant: 'destructive' };
    case 'draft':
      return { variant: 'outline' };
    default:
      return { variant: 'secondary' };
  }
};

export function TemplateCard({ template }: TemplateCardProps) {
  const ChannelIcon = getChannelIcon(template.channel);
  const statusStyle = getStatusColor(template.status);

  return (
    <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-muted p-2">
              <ChannelIcon className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold leading-tight">
              {template.title}
            </CardTitle>
          </div>
          <Badge {...statusStyle} className={cn('capitalize', statusStyle.className)}>
            {template.status}
          </Badge>
        </div>
        <CardDescription className="flex flex-wrap gap-1.5 pt-2">
          {template.bankTag && (
            <Badge variant="outline" className="text-xs">
              {template.bankTag}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {template.typeTag}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        {/* Preview Text */}
        <p className="line-clamp-3 text-sm text-muted-foreground">{template.content}</p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Modified: {template.modifiedDate}</span>
          <span>By: {template.modifiedBy}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2 border-t pt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Archive className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
