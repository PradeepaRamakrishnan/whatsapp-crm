'use client';

import { Building2, Mail, MessageSquare, Phone, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTemplates } from '../lib/templates-data';
import type { TemplateChannel } from '../types/template.types';
import { TemplateCard } from './template-card';

export function TemplatesList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | TemplateChannel | 'by-bank'>('all');

  const filteredTemplates =
    activeTab === 'all'
      ? mockTemplates
      : activeTab === 'by-bank'
        ? mockTemplates.filter((t) => t.bankTag && t.bankTag !== 'All Banks')
        : mockTemplates.filter((t) => t.channel === activeTab);

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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
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
          <TabsTrigger value="by-bank">
            <Building2 className="h-4 w-4" />
            By Bank
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Templates Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="rounded-full bg-muted p-4">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Get started by creating your first template.
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
