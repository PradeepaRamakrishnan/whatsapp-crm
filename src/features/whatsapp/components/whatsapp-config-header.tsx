'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function WhatsAppConfigHeader() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Numbers', href: '/whatsapp/list' },
    { label: 'Templates', href: '/whatsapp/templates' },
  ];

  return (
    <div className="mb-6 border-b">
      <h1 className="text-3xl font-bold tracking-tight">WhatsApp Configuration</h1>
      <p className="mt-1 text-muted-foreground">Manage your WABA profiles, numbers and templates</p>

      <div className="mt-6 flex items-center gap-8">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'pb-3 text-sm font-semibold border-b-2 transition-colors',
                active
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
