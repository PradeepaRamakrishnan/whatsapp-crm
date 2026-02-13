'use client';

import dayjs from 'dayjs';
import { Calendar, CheckCircle2, MessageSquare, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WhatsAppTemplate } from '../types';

interface WhatsAppTemplateCardProps {
  template: WhatsAppTemplate;
  onClick?: () => void;
}

export function WhatsAppTemplateCard({ template, onClick }: WhatsAppTemplateCardProps) {
  const isApproved = template.status === 'APPROVED';
  const headerComponent = template.components.find((c) => c.type === 'HEADER');
  const bodyComponent = template.components.find((c) => c.type === 'BODY');
  const buttonsComponent = template.components.find((c) => c.type === 'BUTTONS');

  return (
    <Card
      className={`transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-950/30">
              <MessageSquare className="h-4 w-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{template.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={isApproved ? 'default' : 'secondary'}
                  className={
                    isApproved
                      ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400'
                      : ''
                  }
                >
                  {isApproved && <CheckCircle2 className="mr-1 h-3 w-3" />}
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
          <span className="truncate font-mono text-xs">{template.name}</span>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Category</div>
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Language</div>
          <div className="text-sm font-medium">{template.language}</div>
        </div>

        {headerComponent && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Header</div>
            <div className="text-sm font-medium line-clamp-1">
              {headerComponent.format || headerComponent.text}
            </div>
          </div>
        )}

        {bodyComponent && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Body Preview</div>
            <div className="text-sm line-clamp-2">{bodyComponent.text}</div>
          </div>
        )}

        {buttonsComponent?.buttons && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">
              Buttons: {buttonsComponent.buttons.length}
            </div>
            <div className="flex flex-wrap gap-1">
              {buttonsComponent.buttons.slice(0, 2).map((button) => (
                <Badge key={`${button.type}-${button.text}`} variant="outline" className="text-xs">
                  {button.text}
                </Badge>
              ))}
              {buttonsComponent.buttons.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{buttonsComponent.buttons.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3.5 w-3.5" />
          <span>Updated {dayjs(template.updatedAt).format('MMM DD, YYYY')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
