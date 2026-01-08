'use client';

import Image from 'next/image';
import { useSidebar } from '@/components/ui/sidebar';

export function SidebarLogo() {
  const { state } = useSidebar();

  return (
    <div
      className={
        state === 'collapsed'
          ? 'flex justify-center px-2 py-1'
          : 'flex items-center gap-2 px-2 py-1'
      }
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        <Image
          src="/assets/images/samatvalogo.png"
          alt="Samatva CRM"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      </div>
      {state !== 'collapsed' && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">Samatva CRM</span>
          <span className="text-xs text-muted-foreground">Fintech Platform</span>
        </div>
      )}
    </div>
  );
}
