'use client';

import Image from 'next/image';
import { useSidebar } from '@/components/ui/sidebar';

export function SidebarLogo() {
  const { state } = useSidebar();

  return (
    <div className="flex justify-center px-4 py-3">
      {state === 'collapsed' ? (
        // Collapsed: show small icon in box
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
          <Image
            src="/assets/images/samatvalogo.png"
            alt="Samatva CRM"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        </div>
      ) : (
        // Expanded: show full horizontal logo
        <Image
          src="/assets/images/samatvalogo.png"
          alt="Samatva CRM"
          width={144}
          height={48}
          className="max-w-36 h-auto object-contain"
        />
      )}
    </div>
  );
}
