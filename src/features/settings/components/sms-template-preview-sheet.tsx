'use client';

import dayjs from 'dayjs';
import { Calendar, MessageSquare, Tag, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Template } from '../types';

interface SmsTemplatePreviewSheetProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleDefault?: (templateId: string) => void;
}

export function SmsTemplatePreviewSheet({
  template,
  isOpen,
  onClose,
  onToggleDefault,
}: SmsTemplatePreviewSheetProps) {
  const isPublished = template?.status === 'published';

  const handleToggleDefault = () => {
    if (template?.id) {
      onToggleDefault?.(template.id);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col sm:max-w-xl">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 space-y-2">
              <SheetTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                {template?.name || 'SMS Template'}
              </SheetTitle>
              {template && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={isPublished ? 'default' : 'secondary'}
                    className={
                      isPublished
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400'
                        : ''
                    }
                  >
                    {template.status}
                  </Badge>
                  {template.active && (
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {template?.isDefault ? (
                <Badge className="bg-green-600 text-white hover:bg-green-600">Default</Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={handleToggleDefault}>
                  Make Default
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {template && (
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
            {/* Template Info */}
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    Alias
                  </div>
                  <div className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
                    {template.alias}
                  </div>
                </div>

                {template.variables && template.variables.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Variables ({template.variables.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((variable) => (
                        <Badge key={variable.id} variant="outline" className="font-mono">
                          {`{${variable.key}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {template.publishedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Published on {dayjs(template.publishedAt).format('MMMM DD, YYYY [at] h:mm A')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-4">Content Preview</h3>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono relative">
                  {template.text || 'No content available'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
