'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { label: 'Accounts', value: 'accounts' },
  { label: 'Templates', value: 'templates' },
  { label: 'Automation', value: 'automation' },
];

interface InstagramConfigHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function InstagramConfigHeader({ activeTab, onTabChange }: InstagramConfigHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">Instagram Configuration</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your Instagram Business accounts and message templates
      </p>

      <Tabs value={activeTab} onValueChange={onTabChange} className="mt-6">
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
