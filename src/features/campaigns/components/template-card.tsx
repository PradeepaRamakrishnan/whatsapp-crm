'use client';

import dayjs from 'dayjs';
import { Archive, Copy, Edit, Eye, Mail, MessageSquare, Phone } from 'lucide-react';
import truncate from 'truncate-html';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TemplateData } from '../types/template.types';

interface TemplateCardProps {
  template: TemplateData;
  onEdit?: (template: TemplateData) => void;
  onDuplicate?: (template: TemplateData) => void;
  onPreview?: (template: TemplateData) => void;
  onArchive?: (template: TemplateData) => void;
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

const getStatusStyle = (status: TemplateData['status']) => {
  switch (status) {
    case 'approved':
      return {
        variant: 'default' as const,
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800',
      };
    case 'pending':
      return {
        variant: 'secondary' as const,
        className:
          'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800',
      };
    case 'rejected':
      return {
        variant: 'destructive' as const,
        className:
          'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-800',
      };
    case 'draft':
      return {
        variant: 'outline' as const,
        className:
          'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-800',
      };
    default:
      return {
        variant: 'secondary' as const,
        className: '',
      };
  }
};

export function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onPreview,
  onArchive,
}: TemplateCardProps) {
  const ChannelIcon = getChannelIcon(template.channel);
  const statusStyle = getStatusStyle(template.status);

  // console.log(template, 'template in TemplateCard');

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:shadow-slate-900/50">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/0 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-slate-900/0" />

      <CardHeader className="relative pb-4 space-y-3">
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 p-2.5 ring-1 ring-slate-200/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700/50">
              <ChannelIcon className="h-3 w-3 text-slate-700 dark:text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50 truncate">
                {template.name}
              </CardTitle>
            </div>
          </div>
          <Badge
            variant={statusStyle.variant}
            className={cn(
              'capitalize flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-all duration-300',
              statusStyle.className,
            )}
          >
            {template.status}
          </Badge>
        </div>

        {/* Tags */}
        <CardDescription className="flex flex-wrap gap-2 pt-1">
          {template.tags?.map((bank) => (
            <Badge
              key={bank}
              variant="outline"
              className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
            >
              {bank}
            </Badge>
          ))}

          {/* <Badge
            variant="outline"
            className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
          >
            {template.typeTag}
          </Badge> */}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative flex flex-1 flex-col space-y-4 pt-0">
        {/* Content Preview */}
        <div className="space-y-3 flex-1">
          {typeof template.content === 'string' ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {template.content}
            </p>
          ) : (
            <>
              {template.content.subject && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                    {template.content.subject}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {truncate(template.content.body.replace(/<[^>]+>/g, ''), 30, {
                    byWords: true,
                    ellipsis: '...',
                  })}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="font-medium">
            Modified: {dayjs(template.createdAt).format('YYYY-MM-DD')}
          </span>
          <span className="font-medium">By: {template.modifiedBy}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(template)}
            className="flex h-auto p-2 gap-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:border-slate-700 transition-all duration-200"
          >
            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Edit</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate?.(template)}
            className="flex h-auto  gap-1 border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:border-slate-700 transition-all duration-200"
          >
            <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Duplicate
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview?.(template)}
            className="flex h-auto  gap-1 border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:border-slate-700 transition-all duration-200"
          >
            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Preview</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onArchive?.(template)}
            className="flex h-auto  gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 dark:hover:border-red-800 transition-all duration-200"
          >
            <Archive className="h-4 w-4" />
            <span className="text-xs font-medium">Archive</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
