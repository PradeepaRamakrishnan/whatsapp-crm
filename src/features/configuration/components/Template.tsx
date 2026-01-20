'use client';

import { Mail, MessageSquare, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { mockTemplates } from '@/features/campaigns/lib/templates-data';

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
}

export default function TemplatesTab({
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
}: TemplatesTabProps) {
  const emailTemplates = mockTemplates.filter(
    (t) => t.status === 'approved' && t.channel === 'email',
  );
  const smsTemplates = mockTemplates.filter((t) => t.status === 'approved' && t.channel === 'sms');
  const whatsappTemplates = mockTemplates.filter(
    (t) => t.status === 'approved' && t.channel === 'whatsapp',
  );

  const selectedEmailData = mockTemplates.find((t) => t.id === emailTemplate);
  const selectedSmsData = mockTemplates.find((t) => t.id === smsTemplate);
  const selectedWhatsappData = mockTemplates.find((t) => t.id === whatsappTemplate);

  const atLeastOneChannelEnabled = emailEnabled || smsEnabled || whatsappEnabled;

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
            <div className="mt-4 space-y-4">
              <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="Select email template..." />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="font-medium">{template.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {template.bankTag}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{template.type}</span>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEmailData && (
                <div className="rounded-lg border bg-background p-5 shadow-sm">
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
                            {selectedEmailData.content.subject || selectedEmailData.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Body:</p>
                          <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedEmailData.content.body}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t">
                      <span>Modified: {selectedEmailData.createdAt}</span>
                      <span>•</span>
                      <span>By: {selectedEmailData.modifiedBy}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedEmailData.bankTag}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            <div className="mt-4 space-y-4">
              <Select value={smsTemplate} onValueChange={setSmsTemplate}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="Select SMS template..." />
                </SelectTrigger>
                <SelectContent>
                  {smsTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="font-medium">{template.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {template.bankTag}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{template.type}</span>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSmsData && (
                <div className="rounded-md border bg-background p-4">
                  <p className="text-sm leading-relaxed">
                    {typeof selectedSmsData.content === 'string'
                      ? selectedSmsData.content
                      : selectedSmsData.content.body}
                  </p>
                  <div className="mt-3 flex flex-col gap-1 pt-3 border-t text-xs text-muted-foreground">
                    <span>Modified: {selectedSmsData.createdAt}</span>
                    <span>By: {selectedSmsData.modifiedBy}</span>
                  </div>
                </div>
              )}
            </div>
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
            <div className="mt-4 space-y-4">
              <Select value={whatsappTemplate} onValueChange={setWhatsappTemplate}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="Select WhatsApp template..." />
                </SelectTrigger>
                <SelectContent>
                  {whatsappTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="font-medium">{template.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {template.bankTag}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{template.type}</span>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedWhatsappData && (
                <div className="rounded-md border bg-background p-4">
                  <p className="text-sm leading-relaxed">
                    {typeof selectedWhatsappData.content === 'string'
                      ? selectedWhatsappData.content
                      : selectedWhatsappData.content.body}
                  </p>
                  <div className="mt-3 flex flex-col gap-1 pt-3 border-t text-xs text-muted-foreground">
                    <span>Modified: {selectedWhatsappData.createdAt}</span>
                    <span>By: {selectedWhatsappData.modifiedBy}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
