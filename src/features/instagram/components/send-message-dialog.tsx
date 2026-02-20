'use client';

import { Instagram, Loader2, Send } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { sendInstagramMessage } from '../services';
import type { InstagramAccount } from '../types';

interface SendMessageSheetProps {
  account: InstagramAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillTo?: string;
}

export function SendMessageDialog({
  account,
  open,
  onOpenChange,
  prefillTo = '',
}: SendMessageSheetProps) {
  const [to, setTo] = React.useState(prefillTo);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setTo(prefillTo);
      setMessage('');
      setError(null);
      setSuccess(false);
    }
    onOpenChange(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!to.trim()) {
      setError('Recipient ID is required');
      return;
    }
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setIsPending(true);
    try {
      await sendInstagramMessage(account.id, to, message);
      setSuccess(true);
      setTimeout(() => handleOpenChange(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsPending(false);
    }
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
              <SheetTitle>Send Instagram Message</SheetTitle>
              <SheetDescription>
                From <span className="font-medium">{account.username || account.instagramId}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="recipient-id">Recipient PSID / IGSID</Label>
            <Input
              id="recipient-id"
              placeholder="e.g. 1234567890123456"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="message-body">Message</Label>
            <Textarea
              id="message-body"
              placeholder="Type your message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600">
              Message sent successfully!
            </p>
          )}

          <div className="flex items-center justify-between border-t pt-4 mt-auto">
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || success}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </span>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
