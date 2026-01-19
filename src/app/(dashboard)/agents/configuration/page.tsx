'use client';

import { Pencil } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Channels from '@/features/configuration/components/Channels';
import TemplatesTab from '@/features/configuration/components/Template';

export default function AgentConfigurationPage() {
  const router = useRouter();
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [smsEnabled, setSmsEnabled] = useState<boolean>(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(true);
  const [emailTemplate, setEmailTemplate] = useState<string>('');
  const [smsTemplate, setSmsTemplate] = useState<string>('');
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('');

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
        <Button onClick={() => router.push('/agents/configuration/edit')}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Configuration
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <TemplatesTab
            emailEnabled={emailEnabled}
            setEmailEnabled={setEmailEnabled}
            smsEnabled={smsEnabled}
            setSmsEnabled={setSmsEnabled}
            whatsappEnabled={whatsappEnabled}
            setWhatsappEnabled={setWhatsappEnabled}
            emailTemplate={emailTemplate}
            setEmailTemplate={setEmailTemplate}
            smsTemplate={smsTemplate}
            setSmsTemplate={setSmsTemplate}
            whatsappTemplate={whatsappTemplate}
            setWhatsappTemplate={setWhatsappTemplate}
          />
        </TabsContent>
        {/* Channels Tab */}
        <TabsContent value="channels" className="mt-6">
          <Channels
            emailEnabled={emailEnabled}
            smsEnabled={smsEnabled}
            whatsappEnabled={whatsappEnabled}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
