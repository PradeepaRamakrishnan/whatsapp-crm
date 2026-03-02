'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, Mail, MessageSquare, Phone, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAllEmailTemplates,
  getAllWhatsAppTemplates,
  syncResendTemplates,
  syncWhatsAppTemplates,
  toggleEmailTemplateDefault,
  toggleWhatsAppTemplateDefault,
} from '../services';
import type { WhatsAppTemplate } from '../types';
import { EmailTemplateCard } from './email-template-card';
import { EmailTemplatePreviewSheet } from './email-template-preview-sheet';
import { WhatsAppTemplateCard } from './whatsapp-template-card';
import { WhatsAppTemplatePreviewSheet } from './whatsapp-template-preview-sheet';

export function TemplatesList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'email';
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedWhatsAppTemplate, setSelectedWhatsAppTemplate] = useState<WhatsAppTemplate | null>(
    null,
  );

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`?${params.toString()}`);
  };

  const {
    data: emailTemplates,
    isLoading: isLoadingEmail,
    error: emailError,
  } = useQuery({
    queryKey: ['email-templates'],
    queryFn: getAllEmailTemplates,
  });

  const { mutate: syncTemplates, isPending: isSyncing } = useMutation({
    mutationFn: syncResendTemplates,
    onMutate: () => {
      toast.loading('Syncing email templates...', { id: 'sync-templates' });
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Email templates synced successfully', {
        id: 'sync-templates',
      });
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sync email templates', { id: 'sync-templates' });
    },
  });

  const {
    data: whatsappTemplates,
    isLoading: isLoadingWhatsApp,
    error: whatsappError,
  } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: getAllWhatsAppTemplates,
  });

  const { mutate: syncWhatsApp, isPending: isSyncingWhatsApp } = useMutation({
    mutationFn: syncWhatsAppTemplates,
    onMutate: () => {
      toast.loading('Syncing WhatsApp templates...', { id: 'sync-whatsapp-templates' });
    },
    onSuccess: (data) => {
      toast.success(data.message || 'WhatsApp templates synced successfully', {
        id: 'sync-whatsapp-templates',
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sync WhatsApp templates', {
        id: 'sync-whatsapp-templates',
      });
    },
  });

  const { mutate: toggleEmailDefault } = useMutation({
    mutationFn: toggleEmailTemplateDefault,
    onMutate: () => {
      toast.loading('Updating default template...', { id: 'toggle-email-default' });
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Default template updated successfully', {
        id: 'toggle-email-default',
      });
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update default template', {
        id: 'toggle-email-default',
      });
    },
  });

  const { mutate: toggleWhatsAppDefault } = useMutation({
    mutationFn: toggleWhatsAppTemplateDefault,
    onMutate: () => {
      toast.loading('Updating default template...', { id: 'toggle-whatsapp-default' });
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Default template updated successfully', {
        id: 'toggle-whatsapp-default',
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update default template', {
        id: 'toggle-whatsapp-default',
      });
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Template Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage message templates for all communication channels
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {emailTemplates?.data
                  ? `${emailTemplates.data.length} email template${emailTemplates.data.length !== 1 ? 's' : ''}`
                  : 'Loading templates...'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncTemplates()}
                disabled={isLoadingEmail || isSyncing}
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isLoadingEmail && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {emailError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {emailError instanceof Error
                    ? emailError.message
                    : 'Failed to load email templates'}
                </AlertDescription>
              </Alert>
            )}

            {!isLoadingEmail && emailTemplates?.data && emailTemplates.data.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No email templates found</h3>
                <p className="text-sm text-muted-foreground">
                  Email templates will appear here once they are created.
                </p>
              </div>
            )}

            {!isLoadingEmail && emailTemplates?.data && emailTemplates.data.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {emailTemplates.data.map((template) => (
                  <EmailTemplateCard
                    key={template.id}
                    template={template}
                    onClick={() => setSelectedTemplateId(template.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sms" className="mt-6">
          {/* SMS tab content */}
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {whatsappTemplates?.data
                  ? `${whatsappTemplates.data.length} WhatsApp template${whatsappTemplates.data.length !== 1 ? 's' : ''}`
                  : 'Loading templates...'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncWhatsApp()}
                disabled={isLoadingWhatsApp || isSyncingWhatsApp}
              >
                <RefreshCw className={`h-4 w-4 ${isSyncingWhatsApp ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isLoadingWhatsApp && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {whatsappError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {whatsappError instanceof Error
                    ? whatsappError.message
                    : 'Failed to load WhatsApp templates'}
                </AlertDescription>
              </Alert>
            )}

            {!isLoadingWhatsApp &&
              whatsappTemplates?.data &&
              whatsappTemplates.data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No WhatsApp templates found</h3>
                  <p className="text-sm text-muted-foreground">
                    WhatsApp templates will appear here once they are created.
                  </p>
                </div>
              )}

            {!isLoadingWhatsApp && whatsappTemplates?.data && whatsappTemplates.data.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {whatsappTemplates.data.map((template) => (
                  <WhatsAppTemplateCard
                    key={template.id}
                    template={template}
                    onClick={() => setSelectedWhatsAppTemplate(template)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Email Template Preview Sheet */}
      <EmailTemplatePreviewSheet
        templateId={selectedTemplateId}
        isOpen={!!selectedTemplateId}
        onClose={() => setSelectedTemplateId(null)}
        onToggleDefault={toggleEmailDefault}
      />

      {/* WhatsApp Template Preview Sheet */}
      <WhatsAppTemplatePreviewSheet
        template={selectedWhatsAppTemplate}
        isOpen={!!selectedWhatsAppTemplate}
        onClose={() => setSelectedWhatsAppTemplate(null)}
        onToggleDefault={toggleWhatsAppDefault}
      />
    </div>
  );
}
