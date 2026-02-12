'use client';

import { Mail, MessageSquare, Phone } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TemplatesList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'email';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
          <p className="text-muted-foreground">
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
          {/* Email tab content */}
        </TabsContent>

        <TabsContent value="sms" className="mt-6">
          {/* SMS tab content */}
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          {/* WhatsApp tab content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
