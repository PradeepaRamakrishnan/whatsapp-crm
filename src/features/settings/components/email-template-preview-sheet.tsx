'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AlertCircle, Calendar, Loader2, Mail, Tag, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEmailTemplateById } from '../services';

interface EmailTemplatePreviewSheetProps {
  templateId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleDefault?: (templateId: string) => void;
}

export function EmailTemplatePreviewSheet({
  templateId,
  isOpen,
  onClose,
  onToggleDefault,
}: EmailTemplatePreviewSheetProps) {
  const {
    data: template,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['email-template', templateId],
    queryFn: () => getEmailTemplateById(templateId as string),
    enabled: !!templateId,
  });

  const isPublished = template?.status === 'published';

  const handleToggleDefault = () => {
    if (template?.id) {
      onToggleDefault?.(template.id);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col sm:max-w-3xl">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 space-y-2">
              <SheetTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                {template?.name || 'Email Template'}
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

        {isLoading && (
          <div className="flex flex-1 items-center justify-center px-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load template'}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!isLoading && template && (
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

                <div className="space-y-1.5">
                  <div className="text-sm text-muted-foreground">From</div>
                  <div className="text-sm font-medium">{template.from}</div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm text-muted-foreground">Subject</div>
                  <div className="text-sm font-medium">{template.subject}</div>
                </div>

                {template.replyTo && (
                  <div className="space-y-1.5">
                    <div className="text-sm text-muted-foreground">Reply To</div>
                    <div className="text-sm font-medium">{template.replyTo}</div>
                  </div>
                )}

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

            {/* Preview Tabs */}
            {(template.html || template.text) && (
              <div className="border-t pt-4">
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="html" disabled={!template.html}>
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="text" disabled={!template.text}>
                      Plain Text
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-4">
                    {template.html ? (
                      <div className="border rounded-lg bg-white dark:bg-gray-50 p-4">
                        <div
                          className="email-preview"
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: Template HTML is from trusted source
                          // biome-ignore lint/style/useNamingConvention: React requires __html property name
                          dangerouslySetInnerHTML={{ __html: template.html }}
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No HTML content available
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="html" className="mt-4">
                    {template.html ? (
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                          <code>{template.html}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No HTML content available
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="text" className="mt-4">
                    {template.text ? (
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap font-mono">{template.text}</pre>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No plain text content available
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
