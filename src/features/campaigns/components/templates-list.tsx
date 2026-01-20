'use client';

import { useQuery } from '@tanstack/react-query';
import { Mail, MessageSquare, Phone, Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllTemplates } from '../services';
import type { TemplateChannel } from '../types/template.types';
import { TemplateCard } from './template-card';

export function TemplatesList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get('activeTab') as TemplateChannel | 'all' | 'by-bank') || 'all';
  const type = searchParams.get('type');

  const updateActiveTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('activeTab', tab);
      params.delete('type'); // Clear type filter when switching tabs
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleTypeClick = useCallback(
    (typeTag: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (type === typeTag) {
        params.delete('type');
      } else {
        params.set('type', typeTag);
      }
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router, type],
  );

  const {
    data: templates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['templates', activeTab],
    queryFn: () => getAllTemplates(activeTab),
    placeholderData: (previousData) => previousData,
  });

  const filteredTemplates = templates.filter((t) => {
    if (activeTab !== 'all' && activeTab !== 'by-bank') {
      if (t.type !== activeTab) {
        return false;
      }
    }

    if (activeTab === 'by-bank') {
      if (!t.bankTag || t.bankTag === 'All Banks') {
        return false;
      }
    }

    if (type) {
      return t.type === type;
    }

    return true;
  });

  // console.log(filteredTemplates, 'filteredTemplates');

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
          <p className="text-muted-foreground">
            Manage message templates for all communication channels
          </p>
        </div>
        <Button onClick={() => router.push('/campaigns/templates/create')}>
          <Plus className="h-4 w-4" />
          Create New Template
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={updateActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms">
            <Phone className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">Loading templates...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8">
              <div className="rounded-full bg-destructive/20 p-4">
                <Mail className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Failed to load templates</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          )}

          {/* Templates Grid */}
          {!isLoading && !error && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} onTypeClick={handleTypeClick} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredTemplates.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="rounded-full bg-muted p-4">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {activeTab !== 'all'
                  ? `No ${activeTab} templates available${type ? ` with type "${type}"` : ''}.`
                  : 'Get started by creating your first template.'}
              </p>
              <Button onClick={() => router.push('/campaigns/templates/create')}>
                <Plus className="h-4 w-4" />
                Create New Template
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
