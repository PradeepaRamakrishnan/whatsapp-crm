'use client';

import { useQuery } from '@tanstack/react-query';
import { Mail, MessageSquare, Send, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getAllTemplates } from '@/features/campaigns/services';

// import { mockTemplates } from '@/features/campaigns/lib/templates-data';

interface TemplatesTabProps {
  emailEnabled: boolean;
  setEmailEnabled: (value: boolean) => void;
  smsEnabled: boolean;
  setSmsEnabled: (value: boolean) => void;
  whatsappEnabled: boolean;
  setWhatsappEnabled: (value: boolean) => void;
  emailTemplate: string;
  setEmailTemplate: (value: string) => void;
  smsTemplate: string;
  setSmsTemplate: (value: string) => void;
  whatsappTemplate: string;
  setWhatsappTemplate: (value: string) => void;
  errors?: Record<string, string>;
}

export default function Templates({
  emailEnabled,
  setEmailEnabled,
  smsEnabled,
  setSmsEnabled,
  whatsappEnabled,
  setWhatsappEnabled,
  emailTemplate,
  setEmailTemplate,
  smsTemplate,
  setSmsTemplate,
  whatsappTemplate,
  setWhatsappTemplate,
  errors = {},
}: TemplatesTabProps) {
  // Fetch templates from API
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => getAllTemplates(),
  });

  interface Template {
    id: string;
    _id?: string;
    status: string;
    type: string;
    name: string;
    content: string | { subject?: string; body?: string };
    tags?: string[];
    createdAt: string;
  }

  // Ensure templatesData is an array
  const allTemplates = Array.isArray(templatesData) ? (templatesData as Template[]) : [];
  const emailTemplates = allTemplates.filter(
    (t: Template) => t.status === 'approved' && t.type === 'email',
  );
  const smsTemplates = allTemplates.filter(
    (t: Template) => t.status === 'approved' && t.type === 'sms',
  );
  const whatsappTemplates = allTemplates.filter(
    (t: Template) => t.status === 'approved' && t.type === 'whatsapp',
  );

  const selectedEmailData = allTemplates.find((t: Template) => t.id === emailTemplate);
  const selectedSmsData = allTemplates.find((t: Template) => t.id === smsTemplate);
  const selectedWhatsappData = allTemplates.find((t: Template) => t.id === whatsappTemplate);

  const atLeastOneChannelEnabled = emailEnabled || smsEnabled || whatsappEnabled;

  const getBankTags = (template: Template | undefined): string => {
    if (!template?.tags || !Array.isArray(template.tags)) return 'All Banks';
    return template.tags.join(', ');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  // Helper to get content from template (handles both string and object)
  const getTemplateContent = (content: string | Record<string, unknown> | undefined): string => {
    if (!content) return 'No content';
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && (content as Record<string, unknown>)?.body)
      return String((content as Record<string, unknown>).body);
    return 'No content';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Select Templates</h3>
        <p className="text-sm text-muted-foreground">
          Enable channels and choose templates for your agent
        </p>
      </div>

      {!atLeastOneChannelEnabled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="flex gap-3">
            <div className="rounded-full bg-amber-500 p-1 h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                No channels enabled
              </p>
              <p className="text-amber-800 dark:text-amber-300">
                Please enable at least one communication channel to continue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Templates */}
      <Card className="border-blue-200 p-4 ">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2.5 shrink-0">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold">Email Template</h4>
                {emailEnabled && (
                  <Badge variant="secondary" className="text-xs">
                    Enabled
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Enable Channel</span>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>
          </div>

          {emailEnabled && (
            <>
              {/* Show preview if email template value exists */}
              {emailTemplate && selectedEmailData ? (
                <div className="rounded-lg mt-4 border bg-background p-5 shadow-sm relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setEmailTemplate('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold">Email Preview</span>
                  </div>
                  <div className="space-y-3">
                    {typeof selectedEmailData.content === 'string' ? (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                          <p className="text-sm font-medium">{selectedEmailData.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Content:</p>
                          <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedEmailData.content}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                          <p className="text-sm font-medium">
                            {selectedEmailData.content?.subject || selectedEmailData.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Body:</p>
                          <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed">
                            {selectedEmailData.content?.body
                              ?.replace(/<[^>]+>/g, ' ')
                              .replace(/\s+/g, ' ')
                              .trim() || 'No content'}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t">
                      <span>Created: {formatDate(selectedEmailData.createdAt)}</span>
                      <span>•</span>
                      <span>Status: {selectedEmailData.status}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {getBankTags(selectedEmailData)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                /* Show select dropdown if no value */
                <div className="mt-4 space-y-4">
                  <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Select email template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((template: Template) => (
                        <SelectItem
                          key={template._id || template.id}
                          value={template._id || template.id}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-medium">{template.name}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {getBankTags(template)}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {template.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.emailTemplate && (
                    <p className="text-sm font-medium text-destructive mt-1.5 animate-in fade-in-50">
                      {errors.emailTemplate}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* SMS Templates */}
      <Card className="border-green-200 p-4 ">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-600 p-2.5 shrink-0">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold">SMS Template</h4>
                {smsEnabled && (
                  <Badge variant="secondary" className="text-xs">
                    Enabled
                  </Badge>
                )}
              </div>
            </div>
            <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
          </div>

          {smsEnabled && (
            <>
              {/* Show preview if SMS template value exists */}
              {smsTemplate && selectedSmsData ? (
                <div className="rounded-md mt-4 border bg-background p-4 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setSmsTemplate('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="text-sm leading-relaxed pr-8 whitespace-pre-wrap">
                    {getTemplateContent(selectedSmsData.content)}
                  </p>
                  <div className="mt-3 flex flex-col gap-1 pt-3 border-t text-xs text-muted-foreground">
                    <span>Created: {formatDate(selectedSmsData.createdAt)}</span>
                    <span>Status: {selectedSmsData.status}</span>
                  </div>
                </div>
              ) : (
                /* Show select dropdown if no value */
                <div className="mt-4 space-y-4">
                  <Select value={smsTemplate} onValueChange={setSmsTemplate}>
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Select SMS template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {smsTemplates.map((template: Template) => (
                        <SelectItem
                          key={template._id || template.id}
                          value={template._id || template.id}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-medium">{template.name}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {getBankTags(template)}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {template.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.smsTemplate && (
                    <p className="text-sm font-medium text-destructive mt-1.5 animate-in fade-in-50">
                      {errors.smsTemplate}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* WhatsApp Templates */}
      <Card className="border-emerald-200 p-4">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-600 p-2.5 shrink-0">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold">WhatsApp Template</h4>
                {whatsappEnabled && (
                  <Badge variant="secondary" className="text-xs">
                    Enabled
                  </Badge>
                )}
              </div>
            </div>
            <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
          </div>

          {whatsappEnabled && (
            <>
              {/* Show preview if WhatsApp template value exists */}
              {whatsappTemplate && selectedWhatsappData ? (
                <div className="rounded-md mt-4 border bg-background p-4 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setWhatsappTemplate('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="text-sm leading-relaxed pr-8 whitespace-pre-wrap">
                    {getTemplateContent(selectedWhatsappData.content)}
                  </p>
                  <div className="mt-3 flex flex-col gap-1 pt-3 border-t text-xs text-muted-foreground">
                    <span>Created: {formatDate(selectedWhatsappData.createdAt)}</span>
                    <span>Status: {selectedWhatsappData.status}</span>
                  </div>
                </div>
              ) : (
                /* Show select dropdown if no value */
                <div className="mt-4 space-y-4">
                  <Select value={whatsappTemplate} onValueChange={setWhatsappTemplate}>
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Select WhatsApp template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {whatsappTemplates.map((template: Template) => (
                        <SelectItem
                          key={template._id || template.id}
                          value={template._id || template.id}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-medium">{template.name}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {getBankTags(template)}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {template.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.whatsappTemplate && (
                    <p className="text-sm font-medium text-destructive mt-1.5 animate-in fade-in-50">
                      {errors.whatsappTemplate}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
