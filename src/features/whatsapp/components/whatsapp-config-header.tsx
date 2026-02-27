'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Numbers', href: '/whatsapp/list' },
  { label: 'Templates', href: '/whatsapp/templates' },
];

export function WhatsAppConfigHeader() {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b">
      <h1 className="text-2xl font-bold tracking-tight">WhatsApp Configuration</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your WhatsApp Business accounts, phone numbers, and message templates
      </p>

      <div className="mt-6 flex items-center gap-6 pb-px">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'shrink-0 border-b-2 pb-3 text-sm font-semibold transition-colors',
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
