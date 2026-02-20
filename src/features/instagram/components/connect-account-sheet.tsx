/** biome-ignore-all assist/source/organizeImports: <> */
'use client';

import React from 'react';
import { Instagram, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { connectInstagramAccount } from '../services';
import { cn } from '@/lib/utils';

interface ConnectAccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? '';
const PERMISSIONS = 'instagram_basic,instagram_manage_messages,pages_show_list,pages_messaging';
const CALLBACK_PATH = '/instagram/auth/callback';

function openOAuthPopup(): Window | null {
  const redirectUri = encodeURIComponent(`${window.location.origin}${CALLBACK_PATH}`);
  const scope = encodeURIComponent(PERMISSIONS);
  const url = `https://www.facebook.com/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token`;
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  return window.open(
    url,
    'instagram_oauth',
    `width=${width},height=${height},left=${left},top=${top}`,
  );
}

export function ConnectAccountSheet({ open, onOpenChange, onSuccess }: ConnectAccountSheetProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [isSelected, setIsSelected] = React.useState(true); // Default to selected since there's only one option

  const handleOpenChange = (value: boolean) => {
    if (!value) setError(null);
    onOpenChange(value);
  };

  const handleMetaLogin = () => {
    setError(null);

    const popup = openOAuthPopup();
    if (!popup) {
      setError('Popup was blocked. Please allow popups for this site and try again.');
      return;
    }

    setIsPending(true);

    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'INSTAGRAM_OAUTH_TOKEN') return;

      window.removeEventListener('message', onMessage);

      const { accessToken } = event.data as { accessToken: string };
      try {
        await connectInstagramAccount(accessToken);
        handleOpenChange(false);
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect account');
      } finally {
        setIsPending(false);
      }
    };

    window.addEventListener('message', onMessage);

    // Clean up if user closes the popup manually
    const pollClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollClosed);
        window.removeEventListener('message', onMessage);
        setIsPending(false);
      }
    }, 500);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="p-0 overflow-hidden gap-0 flex flex-col sm:max-w-[700px]">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-semibold text-[#1e293b]">
                Connect Instagram Account
              </SheetTitle>
              <SheetDescription className="text-sm text-[#64748b]">
                Choose how you would like to connect your Instagram account.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setIsSelected(true)}
                className={cn(
                  'group relative flex w-full flex-col items-start rounded-xl border-2 p-5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20',
                  isSelected
                    ? 'border-primary bg-primary/[0.02]'
                    : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#f8fafc]',
                )}
              >
                <div
                  className={cn(
                    'mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    isSelected ? 'bg-primary/10 text-primary' : 'bg-[#f1f5f9] text-[#64748b]',
                  )}
                >
                  <Instagram className="h-5 w-5" />
                </div>
                <h3
                  className={cn(
                    'text-base font-semibold transition-colors',
                    isSelected ? 'text-[#1e293b]' : 'text-[#475569]',
                  )}
                >
                  Connect your Professional account
                </h3>
                <p className="mt-1 text-sm text-[#64748b] leading-relaxed">
                  Link your Instagram Professional account via Meta. You'll be able to manage your
                  messages and automation here.
                </p>
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto border-t bg-[#f8fafc] px-6 py-4 flex justify-end">
          <Button
            className="px-8 font-medium"
            onClick={handleMetaLogin}
            disabled={isPending || !isSelected}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
