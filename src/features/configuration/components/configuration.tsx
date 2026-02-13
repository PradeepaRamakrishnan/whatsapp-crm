'use client';

import { useQuery } from '@tanstack/react-query';
import cronstrue from 'cronstrue';
import { Mail, MessageSquare, Pencil, Phone, Send } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import React, { useState } from 'react';
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
import { getAllConfiguration } from '@/features/settings/services';

// import { ChannelOrderItem } from '@/features/campaigns/types';

interface TemplatePreview {
  type: 'email' | 'sms' | 'whatsapp';
  name: string;
  content: string;
  bank: string;
}

const channelConfig: Record<
  string,
  { icon: any; label: string; bgColor: string; textColor: string; iconColor: string }
> = {
  email: {
    icon: Mail,
    label: 'Email',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    textColor: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-600',
  },
  sms: {
    icon: MessageSquare,
    label: 'SMS',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    textColor: 'text-green-900 dark:text-green-100',
    iconColor: 'text-green-600',
  },
  whatsapp: {
    icon: Send,
    label: 'WhatsApp',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    textColor: 'text-emerald-900 dark:text-emerald-100',
    iconColor: 'text-emerald-600',
  },
  phone: {
    icon: Phone,
    label: 'Call',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    textColor: 'text-purple-900 dark:text-purple-100',
    iconColor: 'text-purple-600',
  },
  call: {
    icon: Phone,
    label: 'Call',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    textColor: 'text-purple-900 dark:text-purple-100',
    iconColor: 'text-purple-600',
  },
};

const formatDelay = (ms: number) => {
  if (ms === 0) return 'Start';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
};

const ConfigurationPage = () => {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreview | null>(null);

  const { data: configurationResponse, isLoading } = useQuery({
    queryKey: ['configurations'],
    queryFn: () => getAllConfiguration(),
  });

  // console.log('Configuration Response:', configurationResponse);

  const config = configurationResponse?.data?.[0];

  const getEmailContent = (content: { subject?: string; body?: string } | undefined): string => {
    if (!content) return 'No content configured';
    return content.body || 'No content configured';
  };

  const getTemplateContent = (content: { subject?: string; body?: string } | undefined): string => {
    if (!content) return 'No content configured';
    return content.body || 'No content configured';
  };

  const templates = {
    email: config?.emailTemplate
      ? {
          type: 'email' as const,
          name: config.emailTemplate.name,
          description: config.emailTemplate.description,
          bank: config.emailTemplate.tags.join(', '),
          content: getEmailContent(config.emailTemplate.content),
        }
      : {
          type: 'email' as const,
          name: 'No Template Configured',
          description: 'No description available',
          bank: '-',
          content: 'No content configured',
        },
    sms: config?.smsTemplate
      ? {
          type: 'sms' as const,
          name: config.smsTemplate.name,
          description: config.smsTemplate.description,
          bank: config.smsTemplate.tags.join(', '),
          content: getTemplateContent(config.smsTemplate.content),
        }
      : {
          type: 'sms' as const,
          name: 'No Template Configured',
          description: 'No description available',
          bank: '-',
          content: 'No content configured',
        },
    whatsapp: config?.whatsappTemplate
      ? {
          type: 'whatsapp' as const,
          name: config.whatsappTemplate.name,
          description: config.whatsappTemplate.description,
          bank: config.whatsappTemplate.tags.join(', '),
          content: getTemplateContent(config.whatsappTemplate.content),
        }
      : {
          type: 'whatsapp' as const,
          name: 'No Template Configured',
          description: 'No description available',
          bank: '-',
          content: 'No content configured',
        },
  };

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
          onClick={() => {
            if (config?.id) {
              router.push(`/campaigns/configuration/${config.id}`);
            }
          }}
          disabled={!config || isLoading}
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
          {/* {config && (
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
                  {config?.cronPattern
                    ? cronstrue.toString(config.cronPattern, {
                        use24HourTimeFormat: false,
                        dayOfWeekStartIndexZero: false,
                        verbose: true, // More detailed description
                      })
                    : 'Schedule not configured'}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {config?.channelOrder &&
                config.channelOrder.filter((item) => item.enabled).length > 0 ? (
                  config.channelOrder
                    .filter((item) => item.enabled)
                    .map((item, index: number, filtered) => {
                      const channelInfo = channelConfig[
                        item.channel as keyof typeof channelConfig
                      ] || {
                        icon: MessageSquare,
                        label: item.channel,
                        bgColor: 'bg-gray-50 dark:bg-gray-900/30',
                        textColor: 'text-gray-900 dark:text-gray-100',
                        iconColor: 'text-gray-600',
                      };
                      const Icon = channelInfo.icon;

                      return (
                        <React.Fragment key={item.channel}>
                          <div
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${channelInfo.bgColor}`}
                          >
                            <Icon className={`h-4 w-4 ${channelInfo.iconColor}`} />
                            <span className={`text-sm font-medium ${channelInfo.textColor}`}>
                              {channelInfo.label}
                            </span>
                            <Badge
                              variant={index === 0 ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {index === 0 ? 'Start' : formatDelay(item.delayMs)}
                            </Badge>
                          </div>
                          {index < filtered.length - 1 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                        </React.Fragment>
                      );
                    })
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border bg-blue-50 px-3 py-2 dark:bg-blue-950/30 opacity-60">
                    <span className="text-sm text-muted-foreground italic">
                      No channel sequence configured
                    </span>
                  </div>
                )}

                {/* {!config?.channelOrder?.some((c: ChannelOrderItem) => c.channel === 'phone') && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <div className="flex items-center gap-2 rounded-lg border bg-purple-50 px-3 py-2 dark:bg-purple-950/30">
                      <Phone className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Call</span>
                    </div>
                  </>
                )} */}
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
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedTemplate?.bank}</Badge>
              {/* <Badge variant="outline" className="capitalize">
                {selectedTemplate?.type}
              </Badge> */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfigurationPage;
