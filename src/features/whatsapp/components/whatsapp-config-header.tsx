'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { label: 'Numbers', value: 'numbers', href: '/whatsapp/list' },
  { label: 'Templates', value: 'templates', href: '/whatsapp/templates' },
];

export function WhatsAppConfigHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathname.includes('/whatsapp/templates') ? 'templates' : 'numbers';

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">WhatsApp Configuration</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your WhatsApp Business accounts, phone numbers, and message templates
      </p>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          const tab = tabs.find((t) => t.value === v);
          if (tab) router.push(tab.href);
        }}
        className="mt-6"
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
