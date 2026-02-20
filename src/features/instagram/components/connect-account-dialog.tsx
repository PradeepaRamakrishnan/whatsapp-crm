'use client';

import { ExternalLink, Instagram, Loader2 } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { connectInstagramAccount } from '../services';

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
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle>Connect Instagram Account</SheetTitle>
              <SheetDescription>Link your Instagram Business account via Meta</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 py-6">
          <p className="text-sm text-muted-foreground">
            Click below to open the Meta login popup. Grant the requested Instagram permissions and
            your account will be connected automatically.
          </p>

          <Button
            className="w-full gap-2 bg-[#1877F2] hover:bg-[#1864d9] text-white"
            onClick={handleMetaLogin}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {isPending ? 'Connecting…' : 'Continue with Meta'}
          </Button>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
