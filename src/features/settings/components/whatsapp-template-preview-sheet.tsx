'use client';

import dayjs from 'dayjs';
import { Calendar, MessageSquare, Tag, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { WhatsAppTemplate } from '../types';

interface WhatsAppTemplatePreviewSheetProps {
  template: WhatsAppTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleDefault?: (templateId: string) => void;
}

export function WhatsAppTemplatePreviewSheet({
  template,
  isOpen,
  onClose,
  onToggleDefault,
}: WhatsAppTemplatePreviewSheetProps) {
  const isApproved = template?.status === 'APPROVED';

  const headerComponent = template?.components.find((c) => c.type === 'HEADER');
  const bodyComponent = template?.components.find((c) => c.type === 'BODY');
  const footerComponent = template?.components.find((c) => c.type === 'FOOTER');
  const buttonsComponent = template?.components.find((c) => c.type === 'BUTTONS');

  const handleToggleDefault = () => {
    if (template?.id) {
      onToggleDefault?.(template.id);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col sm:max-w-2xl">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 space-y-2">
              <SheetTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                {template?.name || 'WhatsApp Template'}
              </SheetTitle>
              {template && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={isApproved ? 'default' : 'secondary'}
                    className={
                      isApproved
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
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
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
                    Template Name
                  </div>
                  <div className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
                    {template.name}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm text-muted-foreground">External ID</div>
                  <div className="text-sm font-mono">{template.externalId}</div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm text-muted-foreground">Language</div>
                  <div className="text-sm font-medium">{template.language}</div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Last updated {dayjs(template.updatedAt).format('MMMM DD, YYYY [at] h:mm A')}
                  </span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-4">Template Preview</h3>
              <div className="rounded-lg p-6" style={{ backgroundColor: '#E5DDD5' }}>
                {/* WhatsApp Message Bubble */}
                <div className="max-w-sm mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Header */}
                  {headerComponent && (
                    <div className="px-4 pt-3">
                      {headerComponent.format === 'IMAGE' && (
                        <div className="bg-gray-100 h-40 flex items-center justify-center rounded-t-lg -mx-4 -mt-3 mb-2">
                          <span className="text-sm text-gray-500">[Image Header]</span>
                        </div>
                      )}
                      {headerComponent.format === 'TEXT' && headerComponent.text && (
                        <div className="font-semibold text-base mb-2">{headerComponent.text}</div>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  {bodyComponent && (
                    <div className="px-4 py-2">
                      <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900">
                        {bodyComponent.text}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  {footerComponent?.text && (
                    <div className="px-4 pb-2">
                      <div className="text-xs text-gray-500">{footerComponent.text}</div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="px-4 pb-2 flex justify-end">
                    <span className="text-xs text-gray-400">
                      {new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </span>
                  </div>

                  {/* Buttons */}
                  {buttonsComponent?.buttons && (
                    <div className="border-t border-gray-100">
                      {buttonsComponent.buttons.map((button) => (
                        <button
                          key={`${button.type}-${button.text}`}
                          type="button"
                          className="w-full py-3 text-sm font-medium text-blue-500 hover:bg-gray-50 transition-colors text-center border-b border-gray-100 last:border-b-0 flex items-center justify-center gap-2"
                        >
                          {button.type === 'URL' ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <title>External Link</title>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <title>Reply</title>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                              />
                            </svg>
                          )}
                          {button.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Components Details */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-4">Template Components</h3>
              <div className="space-y-3">
                {template.components.map((component) => (
                  <div
                    key={`${component.type}-${component.text || component.format}`}
                    className="bg-muted p-3 rounded-lg space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {component.type}
                      </Badge>
                      {component.format && (
                        <Badge variant="secondary" className="text-xs">
                          {component.format}
                        </Badge>
                      )}
                    </div>
                    {component.text && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Text: </span>
                        <span className="whitespace-pre-wrap">{component.text}</span>
                      </div>
                    )}
                    {component.buttons && (
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Buttons:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {component.buttons.map((button) => (
                            <div key={`${button.type}-${button.text}`} className="text-xs">
                              <Badge variant="outline">
                                {button.type === 'URL' ? '🔗 ' : '⚡ '}
                                {button.text}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
