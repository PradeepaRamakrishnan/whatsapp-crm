'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { connectEmailAccount } from '../services';
import type { EmailProviderType } from '../types';

interface Provider {
  value: EmailProviderType;
  label: string;
  emoji: string;
  helpUrl: string;
  needsDomain?: boolean;
  placeholder: string;
}

const PROVIDERS: Provider[] = [
  {
    value: 'resend',
    label: 'Resend',
    emoji: '📩',
    helpUrl: 'https://resend.com/api-keys',
    placeholder: 're_xxxxxxxxxxxxxxxxxxxx',
  },
  {
    value: 'sendgrid',
    label: 'SendGrid',
    emoji: '📨',
    helpUrl: 'https://app.sendgrid.com/settings/api_keys',
    placeholder: 'SG.xxxxxxxxxxxx',
  },
  {
    value: 'mailgun',
    label: 'Mailgun',
    emoji: '📬',
    helpUrl: 'https://app.mailgun.com/app/account/security/api_keys',
    needsDomain: true,
    placeholder: 'key-xxxxxxxxxxxx',
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function ConnectProviderSheet({ open, onOpenChange, onConnected }: Props) {
  const [provider, setProvider] = useState<EmailProviderType>('resend');
  const [name, setName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [domain, setDomain] = useState('');
  const [mailgunRegion, setMailgunRegion] = useState<'us' | 'eu'>('eu');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selected = PROVIDERS.find((p) => p.value === provider) ?? PROVIDERS[0];

  const handleConnect = async () => {
    if (!fromEmail || !apiKey) {
      setError('From Email and API Key are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await connectEmailAccount({
        provider,
        name: name || selected.label,
        fromEmail,
        fromName,
        apiKey,
        ...(domain ? { domain } : {}),
        ...(provider === 'mailgun' ? { mailgunRegion } : {}),
      });
      onConnected();
      onOpenChange(false);
      // reset
      setName('');
      setFromEmail('');
      setFromName('');
      setApiKey('');
      setDomain('');
      setMailgunRegion('eu');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect provider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">Connect Email Provider</SheetTitle>
          <SheetDescription>Connect your email provider to send emails.</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-5">
          {/* Provider */}
          <div className="space-y-3">
            <Label>Email Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as EmailProviderType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.emoji} {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <a
              href={selected.helpUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              🔗 Get your {selected.label} API key →
            </a>
          </div>

          {/* Account name */}
          <div className="space-y-2">
            <Label>Account Name (optional)</Label>
            <Input
              placeholder={`e.g. My ${selected.label} Account`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* From Email */}
          <div className="space-y-2">
            <Label>From Email *</Label>
            <Input
              type="email"
              placeholder="noreply@yourdomain.com"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Must be verified/authenticated in your provider dashboard.
            </p>
          </div>

          {/* From Name */}
          <div className="space-y-2">
            <Label>From Name (optional)</Label>
            <Input
              placeholder="Your Company Name"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label>API Key *</Label>
            <Input
              type="password"
              placeholder={selected.placeholder}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          {/* Mailgun Domain + Region */}
          {selected.needsDomain && (
            <>
              <div className="space-y-2">
                <Label>Mailgun Domain *</Label>
                <Input
                  placeholder="mg.yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Mailgun Region *</Label>
                <Select
                  value={mailgunRegion}
                  onValueChange={(v) => setMailgunRegion(v as 'us' | 'eu')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eu">🇪🇺 EU — api.eu.mailgun.net</SelectItem>
                    <SelectItem value="us">🇺🇸 US — api.mailgun.net</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <Button onClick={handleConnect} disabled={loading} className="w-full">
            {loading ? 'Validating & Connecting...' : 'Connect Provider'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
