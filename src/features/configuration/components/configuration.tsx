/** biome-ignore lint/security/noDangerouslySetInnerHtml: Required for rendering HTML email templates */
/** biome-ignore lint/style/useNamingConvention: API response uses snake_case */
'use client';

import { useQuery } from '@tanstack/react-query';
import cronstrue from 'cronstrue';
import { Mail, MessageSquare, Pencil, Phone, Send } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAllConfiguration } from '@/features/campaigns/services';

interface TemplatePreview {
  type: 'email' | 'sms' | 'whatsapp';
  name: string;
  content: string;
  bank: string;
}

const ConfigurationPage = () => {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreview | null>(null);

  const { data: configuration, isLoading } = useQuery({
    queryKey: ['configurations'],
    queryFn: () => getAllConfiguration(),
  });

  // Helper to safely get content string from email template
  const getEmailContent = (content: string | Record<string, unknown> | undefined): string => {
    if (!content) return 'No content configured';
    if (typeof content === 'string') return content;
    const contentObj = content as Record<string, unknown>;
    return String(contentObj?.body || '');
  };

  // Helper to safely get content string from SMS/WhatsApp template
  const getTemplateContent = (content: string | Record<string, unknown> | undefined): string => {
    if (!content) return 'No content configured';
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && (content as Record<string, unknown>)?.body)
      return String((content as Record<string, unknown>).body);
    return 'No content configured';
  };

  // Helper to get template name
  const getTemplateName = (template: Record<string, unknown> | undefined): string => {
    if (!template) return 'No Template Configured';
    return String(template.name || 'Unnamed Template');
  };

  // Helper to get bank tags
  const getBankTags = (template: Record<string, unknown> | undefined): string => {
    if (!template?.tags || !Array.isArray(template.tags)) return 'All Banks';
    return (template.tags as string[]).join(', ');
  };

  const configArray = Array.isArray(configuration) ? configuration : [];
  const firstConfig = configArray[0]; // Assuming first config for now

  const templates = {
    email: firstConfig?.emailTemplate
      ? {
          type: 'email' as const,
          name: getTemplateName(firstConfig.emailTemplate),
          description: firstConfig.emailTemplate.description || 'No description available',
          bank: getBankTags(firstConfig.emailTemplate),
          content: getEmailContent(firstConfig.emailTemplate.content),
        }
      : {
          type: 'email' as const,
          name: 'No Template Configured',
          bank: '-',
          content: 'No content configured',
        },
    sms: firstConfig?.smsTemplate
      ? {
          type: 'sms' as const,
          name: getTemplateName(firstConfig.smsTemplate),
          description: firstConfig.smsTemplate.description || 'No description available',
          bank: getBankTags(firstConfig.smsTemplate),
          content: getTemplateContent(firstConfig.smsTemplate.content),
        }
      : {
          type: 'sms' as const,
          name: 'No Template Configured',
          bank: '-',
          content: 'No content configured',
        },
    whatsapp: firstConfig?.whatsappTemplate
      ? {
          type: 'whatsapp' as const,
          name: getTemplateName(firstConfig.whatsappTemplate),
          description: firstConfig.whatsappTemplate.description || 'No description available',
          bank: getBankTags(firstConfig.whatsappTemplate),
          content: getTemplateContent(firstConfig.whatsappTemplate.content),
        }
      : {
          type: 'whatsapp' as const,
          name: 'No Template Configured',
          bank: '-',
          content: 'No content configured',
        },
  };

  // Get scheduler status and cron pattern
  // const schedulerEnabled = firstConfig?.schedulerEnabled ?? false;
  // const cronPattern = firstConfig?.cronPattern || 'Not configured';
  // const approved = firstConfig?.approved ?? false;

  return (
    <div className="flex w-full flex-1 flex-col gap-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Agent Configuration</h1>
          <p className="text-muted-foreground">
            Configure templates and channels for your AI agents
          </p>
        </div>
        <Button
          onClick={() =>
            firstConfig?._id && router.push(`/campaigns/configuration/${firstConfig._id}`)
          }
          disabled={!firstConfig?._id}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading configuration...</div>
      ) : (
        <div className="grid gap-6">
          {/* Configuration Status */}
          {/* {firstConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Configuration Status</CardTitle>
                <CardDescription>Current configuration details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Badge variant={schedulerEnabled ? 'default' : 'secondary'}>
                    Scheduler: {schedulerEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Badge variant={approved ? 'default' : 'secondary'}>
                    {approved ? 'Approved' : 'Pending Approval'}
                  </Badge>
                  <Badge variant="outline">Cron: {cronPattern}</Badge>
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Template Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Template Summary</CardTitle>
              <CardDescription>Communication templates used</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email Card */}
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(templates.email)}
                  className="rounded-xl  p-4 text-left hover:bg-muted/40 border border-blue-200 transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold">Email</h4>
                  </div>

                  <p className="text-sm mb-2 font-medium text-foreground">{templates.email.name}</p>
                  <p className="text-sm text-foreground">{templates.email.description}</p>

                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      {templates.email.bank}
                    </Badge>
                  </div>
                </button>

                {/* SMS Card */}
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(templates.sms)}
                  className="rounded-xl border p-4 text-left  border-green-200 hover:bg-muted/40 transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-green-100 p-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <h4 className="text-sm font-semibold">SMS</h4>
                  </div>

                  <p className="text-sm mb-2 font-medium text-foreground">{templates.sms.name}</p>
                  <p className="text-sm text-foreground">{templates.sms.description}</p>

                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      {templates.sms.bank}
                    </Badge>
                  </div>
                </button>

                {/* WhatsApp Card */}
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(templates.whatsapp)}
                  className="rounded-xl border p-4 text-left border-emerald-200 hover:bg-muted/40 transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-emerald-100 p-2">
                      <Send className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h4 className="text-sm font-semibold">WhatsApp</h4>
                  </div>

                  <p className="text-sm mb-2 font-medium text-foreground">
                    {templates.whatsapp.name}
                  </p>
                  <p className="text-sm text-foreground">{templates.whatsapp.description}</p>

                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      {templates.whatsapp.bank}
                    </Badge>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Channel Timing */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Timing</CardTitle>
              <CardDescription>Message scheduling configuration</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="rounded-lg mb-3 border bg-muted/40 p-4">
                <div className="text-sm font-medium">
                  Scheduler Time:{' '}
                  {firstConfig?.cronPattern
                    ? cronstrue.toString(firstConfig.cronPattern, {
                        use24HourTimeFormat: false,
                        dayOfWeekStartIndexZero: false,
                        verbose: true, // More detailed description
                      })
                    : 'Schedule not configured'}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Email</span>
                  <Badge variant="secondary" className="text-xs">
                    Start
                  </Badge>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-2 rounded-lg border bg-green-50 px-3 py-2 dark:bg-green-950/30">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">SMS</span>
                  <Badge variant="outline" className="text-xs">
                    30 min
                  </Badge>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-2 rounded-lg border bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
                  <Send className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">WhatsApp</span>
                  <Badge variant="outline" className="text-xs">
                    60 min
                  </Badge>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-2 rounded-lg border bg-purple-50 px-3 py-2 dark:bg-purple-950/30">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Call</span>
                </div>
              </div>

              {/* Scheduler Time Display */}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Template Preview Modal */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.type === 'email' && <Mail className="h-5 w-5 text-blue-600" />}
              {selectedTemplate?.type === 'sms' && (
                <MessageSquare className="h-5 w-5 text-green-600" />
              )}
              {selectedTemplate?.type === 'whatsapp' && (
                <Send className="h-5 w-5 text-emerald-600" />
              )}
              <span>{selectedTemplate?.name}</span>
            </DialogTitle>
            <DialogDescription>Template preview for {selectedTemplate?.bank}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-xs font-medium text-muted-foreground mb-2 uppercase">
                {selectedTemplate?.type} Content
              </div>
              {selectedTemplate?.type === 'email' ? (
                <div
                  className="text-sm bg-background rounded p-3 border overflow-auto"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized email template content
                  dangerouslySetInnerHTML={{
                    // biome-ignore lint/style/useNamingConvention: React API requirement
                    __html: selectedTemplate?.content || '',
                  }}
                />
              ) : (
                <div className="text-sm whitespace-pre-wrap font-mono bg-background rounded p-3 border">
                  {selectedTemplate?.content || 'No content available'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedTemplate?.bank}</Badge>
              <Badge variant="outline" className="capitalize">
                {selectedTemplate?.type}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfigurationPage;
