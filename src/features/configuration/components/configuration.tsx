'use client';

import { useQuery } from '@tanstack/react-query';
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
import type { Configuration } from '@/features/campaigns/types';

interface TemplatePreview {
  type: 'email' | 'sms' | 'whatsapp';
  name: string;
  content: string;
  bank: string;
}

const ConfigurationPage = () => {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreview | null>(null);

  const { data: configuration } = useQuery<Configuration>({
    queryKey: ['configurations'],
    queryFn: () => getAllConfiguration(),
  });

  // Helper to safely get content string
  const getContentString = (content: string | Record<string, unknown>): string => {
    if (typeof content === 'string') return content;
    const contentObj = content as Record<string, unknown>;
    return String(contentObj?.body || '');
  };

  // Map API data to UI structure or use defaults
  // Assuming configuration returns an object with keys like 'email', 'sms', 'whatsapp'
  // or an array we need to find from.
  // For now, let's try to map from the 'configuration' object if it matches the shape,
  // otherwise fallback to the hardcoded structure for safety until we know the shape.

  // If configuration is null/undefined, we might want to show loading or default.
  // But since we prefetched, it should be there or loading.

  const templates = {
    email: configuration?.email
      ? {
          type: 'email' as const,
          name: configuration.email.name || 'Email Template',
          bank: configuration.email.bankTag || 'All Banks',
          content: getContentString(configuration.email.content),
        }
      : {
          type: 'email' as const,
          name: 'No Template Configured',
          bank: '-',
          content: 'No content configured',
        },
    sms: configuration?.sms
      ? {
          type: 'sms' as const,
          name: configuration.sms.name || 'SMS Template',
          bank: configuration.sms.bankTag || 'All Banks',
          content: getContentString(configuration.sms.content),
        }
      : {
          type: 'sms' as const,
          name: 'No Template Configured',
          bank: '-',
          content: 'No content configured',
        },
    whatsapp: configuration?.whatsapp
      ? {
          type: 'whatsapp' as const,
          name: configuration.whatsapp.name || 'WhatsApp Template',
          bank: configuration.whatsapp.bankTag || 'All Banks',
          content: getContentString(configuration.whatsapp.content),
        }
      : {
          type: 'whatsapp' as const,
          name: 'No Template Configured',
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
        <Button onClick={() => router.push('/campaigns/configuration/edit')}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid  gap-6">
        {/* Template Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Template Summary</CardTitle>
            <CardDescription>Communication templates used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Email Template */}
              <button
                type="button"
                className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors w-full text-left"
                onClick={() => setSelectedTemplate(templates.email)}
              >
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground">Email Template</div>
                  <div className="text-sm font-medium mt-0.5">{templates.email.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {templates.email.bank}
                    </Badge>
                  </div>
                </div>
              </button>

              {/* SMS Template */}
              <button
                type="button"
                className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors w-full text-left"
                onClick={() => setSelectedTemplate(templates.sms)}
              >
                <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground">SMS Template</div>
                  <div className="text-sm font-medium mt-0.5">{templates.sms.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {templates.sms.bank}
                    </Badge>
                  </div>
                </div>
              </button>

              {/* WhatsApp Template */}
              <button
                type="button"
                className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors w-full text-left"
                onClick={() => setSelectedTemplate(templates.whatsapp)}
              >
                <Send className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground">WhatsApp Template</div>
                  <div className="text-sm font-medium mt-0.5">{templates.whatsapp.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {templates.whatsapp.bank}
                    </Badge>
                  </div>
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
          </CardContent>
        </Card>
      </div>

      {/* Template Preview Modal */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
              <div className="text-sm whitespace-pre-wrap font-mono bg-background rounded p-3 border">
                {selectedTemplate?.content}
              </div>
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
