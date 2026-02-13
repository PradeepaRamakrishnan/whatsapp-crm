'use client';

import dayjs from 'dayjs';
import { Calendar, CheckCircle2, Mail, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Template } from '../types';

interface EmailTemplateCardProps {
  template: Template;
  onClick?: () => void;
}

export function EmailTemplateCard({ template, onClick }: EmailTemplateCardProps) {
  const isPublished = template.status === 'published';

  return (
    <Card
      className={`transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/30">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{template.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={isPublished ? 'default' : 'secondary'}
                  className={
                    isPublished
                      ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400'
                      : ''
                  }
                >
                  {isPublished && <CheckCircle2 className="mr-1 h-3 w-3" />}
                  {template.status}
                </Badge>
                {template.active && (
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="h-3.5 w-3.5" />
          <span className="truncate font-mono text-xs">{template.alias}</span>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">From:</div>
          <div className="text-sm font-medium truncate">{template.from}</div>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Subject:</div>
          <div className="text-sm font-medium line-clamp-2">{template.subject}</div>
        </div>

        {template.variables && template.variables.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">
              Variables: {template.variables.length}
            </div>
            <div className="flex flex-wrap gap-1">
              {template.variables.slice(0, 3).map((variable) => (
                <Badge key={variable.id} variant="outline" className="text-xs font-mono">
                  {`{${variable.key}}`}
                </Badge>
              ))}
              {template.variables.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.variables.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {template.publishedAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="h-3.5 w-3.5" />
            <span>Published {dayjs(template.publishedAt).format('MMM DD, YYYY')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
