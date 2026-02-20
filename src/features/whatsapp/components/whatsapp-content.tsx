'use client';

import {
  CheckCircle2,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Smartphone,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { connectWaba, getAllAccounts, getPhoneNumbers, registerPhone } from '../services';
import type { PhoneNumber } from '../types';

type FlowStep = 'choose' | 'connecting' | 'select_phone' | 'registering' | 'error';
type ConnectMethod = 'business_app' | 'own_number';

// biome-ignore lint/style/useNamingConvention: Facebook API uses snake_case
interface FacebookAuthResponse {
  accessToken?: string;
  code?: string;
}

interface FacebookLoginResponse {
  authResponse: FacebookAuthResponse | null;
  status: 'connected' | 'not_authorized' | 'unknown';
}

interface WhatsappListRow {
  id: string;
  wabaId: string;
  wabaName: string;
  phoneNumber: string;
  phoneNumberId: string;
  status: string;
  isVerified: boolean;
  quality: string;
}

declare global {
  interface Window {
    // biome-ignore lint/style/useNamingConvention: Facebook SDK uses uppercase
    FB: {
      init: (options: Record<string, unknown>) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit: () => void;
  }
}

function normalizePhoneNumber(input: unknown): PhoneNumber | null {
  if (!isObject(input)) return null;

  const id = String(input.id || '').trim();
  const displayPhoneNumber = String(
    input.displayPhoneNumber || input['display_phone_number'] || '',
  ).trim();
  const verifiedName = String(input.verifiedName || input['verified_name'] || '').trim();
  const rawStatus = String(
    input.codeVerificationStatus || input['code_verification_status'] || 'NOT_VERIFIED',
  );
  const codeVerificationStatus = rawStatus === 'VERIFIED' ? 'VERIFIED' : 'NOT_VERIFIED';

  if (!id || !displayPhoneNumber) return null;

  return {
    id,
    displayPhoneNumber,
    verifiedName,
    codeVerificationStatus,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function mapToListRow(input: unknown): WhatsappListRow | null {
  if (!isObject(input)) return null;

  const phoneNumber = String(
    input.phoneNumber || input['display_phone_number'] || input.phone || '',
  ).trim();
  const phoneNumberId = String(
    input.phoneNumberId || input['phone_number_id'] || input.id || '',
  ).trim();
  const wabaName = String(
    input.wabaName || input['waba_name'] || input['verified_name'] || input.name || '',
  ).trim();
  const wabaId = String(input.wabaId || input['waba_id'] || input.accountId || '').trim();
  const status = String(input.status || input['code_verification_status'] || 'unknown').trim();
  const isVerified =
    Boolean(input.isVerified) ||
    String(input['code_verification_status'] || '').toUpperCase() === 'VERIFIED';
  const quality = String(input.qualityRating || input.quality || (isVerified ? 'High' : 'Unknown'));
  const id = String(input.id || `${wabaId}-${phoneNumberId || phoneNumber}`).trim();

  if (!id || !phoneNumber) return null;

  return {
    id,
    wabaId,
    wabaName: wabaName || 'Unnamed WABA',
    phoneNumber,
    phoneNumberId,
    status,
    isVerified,
    quality,
  };
}

function extractArraySources(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  if (!isObject(response)) return [];

  const containerCandidates = [response, response.data, response.result, response.payload].filter(
    isObject,
  );
  const listKeys = [
    'accounts',
    'data',
    'items',
    'rows',
    'results',
    'phoneNumbers',
    'numbers',
  ] as const;

  for (const container of containerCandidates) {
    for (const key of listKeys) {
      const value = container[key];
      if (Array.isArray(value)) return value;
    }
  }

  return [];
}

function normalizeAccounts(response: unknown): WhatsappListRow[] {
  const rawItems = extractArraySources(response);
  const rows = rawItems.flatMap((item) => {
    const primary = mapToListRow(item);
    if (primary) return [primary];

    if (!isObject(item) || !Array.isArray(item.phoneNumbers)) return [];
    return item.phoneNumbers
      .map((number) =>
        mapToListRow({
          ...number,
          wabaId: item.wabaId || item['waba_id'] || item.id,
          wabaName: item.wabaName || item['waba_name'] || item.name,
          status: item.status || number?.status,
        }),
      )
      .filter((row): row is WhatsappListRow => !!row);
  });

  const unique = new Map<string, WhatsappListRow>();
  for (const row of rows) {
    unique.set(`${row.id}-${row.phoneNumber}`, row);
  }
  return Array.from(unique.values());
}

function statusBadgeClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'connected':
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'error':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case 'pending_otp':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}

export default function WhatsappConnect() {
  const [accounts, setAccounts] = useState<WhatsappListRow[]>([]);
  const [search, setSearch] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [open, setOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>('choose');
  const [connectMethod, setConnectMethod] = useState<ConnectMethod>('own_number');
  const [flowError, setFlowError] = useState('');

  const [accountId, setAccountId] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const response = await getAllAccounts();
      setAccounts(normalizeAccounts(response));
    } catch {
      // Keep previous rows if refresh fails.
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts().catch(() => undefined);
  }, [loadAccounts]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v21.0',
      });
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return accounts;

    return accounts.filter((account) => {
      const phone = account.phoneNumber?.toLowerCase() || '';
      const name = account.wabaName?.toLowerCase() || '';
      const status = account.status?.toLowerCase() || '';
      return phone.includes(query) || name.includes(query) || status.includes(query);
    });
  }, [accounts, search]);

  const resetFlow = useCallback(() => {
    setFlowStep('choose');
    setFlowError('');
    setAccountId('');
    setPhoneNumbers([]);
    setSelectedPhoneId('');
    setConnectMethod('own_number');
  }, []);

  const handleDialogOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetFlow();
  };

  const handleConnectClick = useCallback(() => {
    if (!window.FB) {
      setFlowStep('error');
      setFlowError('Facebook SDK has not loaded yet. Please refresh and try again.');
      return;
    }

    setFlowError('');
    setFlowStep('connecting');

    window.FB.login(
      (response: FacebookLoginResponse) => {
        if (!response.authResponse) {
          setFlowStep('error');
          setFlowError('Meta login was cancelled. Please try again.');
          return;
        }

        const metaAccessToken =
          response.authResponse.code ?? response.authResponse.accessToken ?? '';
        if (!metaAccessToken) {
          setFlowStep('error');
          setFlowError('Meta access token not received. Please try again.');
          return;
        }

        (async () => {
          try {
            const connected = await connectWaba(metaAccessToken);
            const currentAccountId = connected.data?.id || connected.account?.id || '';
            setAccountId(currentAccountId);

            const numbers = (connected.phoneNumbers || connected.data?.phoneNumbers || [])
              .map((item: unknown) => normalizePhoneNumber(item))
              .filter((item: PhoneNumber | null): item is PhoneNumber => !!item);
            if (numbers.length > 0) {
              setPhoneNumbers(numbers);
              setFlowStep('select_phone');
              return;
            }

            const phoneData = await getPhoneNumbers(currentAccountId);
            const fallbackNumbers = (phoneData.data || [])
              .map((item: unknown) => normalizePhoneNumber(item))
              .filter((item: PhoneNumber | null): item is PhoneNumber => !!item);
            if (fallbackNumbers.length === 0) {
              throw new Error('No phone numbers found. Please add one in Meta Business Manager.');
            }

            setPhoneNumbers(fallbackNumbers);
            setFlowStep('select_phone');
          } catch (error: unknown) {
            setFlowStep('error');
            setFlowError(error instanceof Error ? error.message : 'Connection failed.');
          }
        })().catch(() => undefined);
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID || '',
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: '3' },
      },
    );
  }, []);

  const handleRegisterPhone = useCallback(async () => {
    if (!selectedPhoneId || !accountId) return;

    setFlowStep('registering');
    try {
      const result = await registerPhone(accountId, selectedPhoneId);
      const number = result.data?.phoneNumber || '';
      const fallbackSelectedPhone = phoneNumbers.find((phone) => phone.id === selectedPhoneId);
      const newlyConnected = mapToListRow({
        ...(result.data || {}),
        phoneNumber: result.data?.phoneNumber || fallbackSelectedPhone?.displayPhoneNumber,
        phoneNumberId: result.data?.phoneNumberId || fallbackSelectedPhone?.id,
        verifiedName: fallbackSelectedPhone?.verifiedName,
      });

      if (newlyConnected) {
        setAccounts((prev) => {
          const next = prev.filter((row) => row.phoneNumber !== newlyConnected.phoneNumber);
          return [newlyConnected, ...next];
        });
      }

      setSuccessMessage(
        number ? `Connected ${number} successfully.` : 'WhatsApp number connected.',
      );
      setOpen(false);
      resetFlow();
      await loadAccounts();
    } catch (error: unknown) {
      setFlowStep('error');
      setFlowError(error instanceof Error ? error.message : 'Registration failed.');
    }
  }, [accountId, loadAccounts, phoneNumbers, resetFlow, selectedPhoneId]);

  return (
    <div className="space-y-4">
      {successMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by number, WABA or status..."
              className="ps-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => loadAccounts().catch(() => undefined)}>
              <RefreshCw className={cn('h-4 w-4', loadingAccounts && 'animate-spin')} />
              Refresh
            </Button>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Connect WhatsApp Number
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>WA Business Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Name Status</TableHead>
                <TableHead>Quality Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAccounts ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading connected numbers...
                    </span>
                  </TableCell>
                </TableRow>
              ) : filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No connected WhatsApp numbers yet.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.phoneNumber || '-'}</TableCell>
                    <TableCell>{account.wabaName || '-'}</TableCell>
                    <TableCell>
                      <Badge className={cn('capitalize', statusBadgeClass(account.status))}>
                        {account.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.isVerified ? 'Verified' : 'Pending'}</TableCell>
                    <TableCell>{account.quality}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden" showCloseButton>
          <DialogHeader className="border-b px-6 pt-6 pb-4">
            <DialogTitle>Connect WhatsApp Number</DialogTitle>
            <DialogDescription>
              Choose how you want to onboard your WhatsApp Business account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            {flowStep === 'choose' ? (
              <>
                <button
                  type="button"
                  onClick={() => setConnectMethod('business_app')}
                  className={cn(
                    'w-full rounded-xl border p-5 text-left transition',
                    connectMethod === 'business_app'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/30',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Connect your WhatsApp Business app</p>
                      <p className="text-sm text-muted-foreground">
                        Link the WhatsApp Business App you already use on phone.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConnectMethod('own_number')}
                  className={cn(
                    'w-full rounded-xl border p-5 text-left transition',
                    connectMethod === 'own_number'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/30',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Connect your own Number</p>
                      <p className="text-sm text-muted-foreground">
                        Share your WhatsApp Business account through Meta Embedded Signup.
                      </p>
                    </div>
                  </div>
                </button>
              </>
            ) : null}

            {flowStep === 'connecting' || flowStep === 'registering' ? (
              <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border bg-muted/20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">
                  {flowStep === 'connecting'
                    ? 'Connecting your account...'
                    : 'Registering number...'}
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take a few moments. Please keep this window open.
                </p>
              </div>
            ) : null}

            {flowStep === 'select_phone' ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">Select a phone number to connect</p>
                <div className="grid max-h-72 gap-2 overflow-auto rounded-lg border p-2">
                  {phoneNumbers.map((phone) => (
                    <button
                      type="button"
                      key={phone.id}
                      onClick={() => setSelectedPhoneId(phone.id)}
                      className={cn(
                        'flex items-center justify-between rounded-lg border px-3 py-2 text-left transition',
                        selectedPhoneId === phone.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/30',
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium">{phone.displayPhoneNumber}</p>
                        <p className="text-xs text-muted-foreground">{phone.verifiedName}</p>
                      </div>
                      <Badge variant="outline">{phone.codeVerificationStatus}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {flowStep === 'error' ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-center gap-2 text-rose-700">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Connection failed</span>
                </div>
                <p className="mt-2 text-xs text-rose-700">{flowError}</p>
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t px-6 py-4">
            {flowStep === 'choose' ? (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnectClick} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Next
                </Button>
              </>
            ) : null}

            {flowStep === 'select_phone' ? (
              <>
                <Button variant="outline" onClick={resetFlow}>
                  Back
                </Button>
                <Button
                  onClick={() => handleRegisterPhone().catch(() => undefined)}
                  disabled={!selectedPhoneId}
                >
                  Confirm
                </Button>
              </>
            ) : null}

            {flowStep === 'error' ? (
              <>
                <Button variant="outline" onClick={resetFlow}>
                  Back
                </Button>
                <Button onClick={handleConnectClick}>Try again</Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
