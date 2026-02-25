'use client';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Smartphone,
  Star,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  addPhoneNumber,
  connectWaba,
  fetchAvailableFromMeta,
  getAccountById,
  getAllAccounts,
  listPhoneNumbers,
  removePhoneNumber,
  resendOtp,
  sendOtp,
  setDefaultPhone,
  verifyOtp,
} from '../services';
import type { ManagedPhone, PhoneNumber } from '../types';

// ─── Local types ─────────────────────────────────────────────────────────────
type ConnectMethod = 'existing_app' | 'own_number';

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

interface AccountSummary {
  id: string;
  wabaId: string;
  wabaName: string;
  status: string;
}

declare global {
  interface Window {
    // biome-ignore lint/style/useNamingConvention: Facebook SDK
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

// ─── Normalizers ─────────────────────────────────────────────────────────────
function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function parseRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return isObject(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return isObject(value) ? value : {};
}

function readString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return '';
}

function normalizePhoneNumber(input: unknown): PhoneNumber | null {
  if (!isObject(input)) return null;
  const id = String(input.id || '').trim();
  const displayPhoneNumber = String(
    input.displayPhoneNumber || input.display_phone_number || '',
  ).trim();
  const verifiedName = String(input.verifiedName || input.verified_name || '').trim();
  const rawStatus = String(
    input.codeVerificationStatus || input.code_verification_status || 'NOT_VERIFIED',
  );
  const codeVerificationStatus = rawStatus === 'VERIFIED' ? 'VERIFIED' : 'NOT_VERIFIED';
  if (!id || !displayPhoneNumber) return null;
  return { id, displayPhoneNumber, verifiedName, codeVerificationStatus };
}

function mapToListRow(input: unknown): WhatsappListRow | null {
  if (!isObject(input)) return null;
  const phoneNumber = String(
    input.phoneNumber ||
      input.displayNumber ||
      input.displayPhoneNumber ||
      input.display_phone_number ||
      input.display_number ||
      input.e164Number ||
      input.e164_number ||
      input.phone ||
      '',
  ).trim();
  const phoneNumberId = String(
    input.phoneNumberId || input.phone_number_id || input.id || '',
  ).trim();
  const wabaName = String(
    input.wabaName ||
      input.waba_name ||
      input.businessName ||
      input.verifiedName ||
      input.verified_name ||
      input.name ||
      '',
  ).trim();
  const wabaId = String(input.wabaId || input.waba_id || input.accountId || '').trim();
  const status = String(
    input.status || input.codeVerificationStatus || input.code_verification_status || 'unknown',
  ).trim();
  const isVerified =
    Boolean(input.isVerified) ||
    String(input.codeVerificationStatus || input.code_verification_status || '').toUpperCase() ===
      'VERIFIED';
  const quality = String(input.qualityRating || input.quality || (isVerified ? 'High' : 'Unknown'));
  const id = String(
    input.accountId || input.account_id || input.id || `${wabaId}-${phoneNumberId || phoneNumber}`,
  ).trim();
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

function normalizeAccountSummary(input: unknown): AccountSummary | null {
  if (!isObject(input)) return null;
  const source =
    (isObject(input.data) && input.data) ||
    (isObject(input.result) && input.result) ||
    (isObject(input.payload) && input.payload) ||
    input;
  const id = String(source.id || source.accountId || source.account_id || '').trim();
  const wabaId = String(source.wabaId || source.waba_id || source.businessAccountId || id).trim();
  const wabaName = String(
    source.wabaName || source.waba_name || source.name || source.verified_name || 'Unnamed WABA',
  ).trim();
  const status = String(source.status || 'connected').trim();
  if (!id) return null;
  return { id, wabaId, wabaName, status };
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

function normalizeAccountSummaries(response: unknown): AccountSummary[] {
  const rawItems = extractArraySources(response);
  const accountsFromList = rawItems
    .map(normalizeAccountSummary)
    .filter((account): account is AccountSummary => !!account);
  const fallback = normalizeAccountSummary(response);
  const accounts = fallback ? [...accountsFromList, fallback] : accountsFromList;
  const unique = new Map<string, AccountSummary>();
  for (const account of accounts) unique.set(account.id, account);
  return Array.from(unique.values());
}

function createAccountOnlyRow(account: AccountSummary): WhatsappListRow {
  return {
    id: account.id,
    wabaId: account.wabaId,
    wabaName: account.wabaName,
    phoneNumber: '-',
    phoneNumberId: '',
    status: account.status || 'connected',
    isVerified: false,
    quality: 'Unknown',
  };
}

function normalizeManagedPhone(input: unknown): ManagedPhone | null {
  if (!isObject(input)) return null;
  const id = String(input.id || '').trim();
  const phoneNumber = String(
    input.phoneNumber ||
      input.phone ||
      input.displayNumber ||
      input.displayPhoneNumber ||
      input.display_phone_number ||
      input.display_number ||
      input.e164Number ||
      input.e164_number ||
      '',
  ).trim();
  const phoneNumberId = String(input.phoneNumberId || input.id || '').trim();
  if (!id || !phoneNumber) return null;
  return {
    id,
    phoneNumber,
    phoneNumberId: phoneNumberId || id,
    verifiedName:
      String(input.verifiedName || input.verified_name || input.displayName || '').trim() ||
      undefined,
    qualityRating: String(input.qualityRating || input.quality || '').trim() || undefined,
    status:
      String(
        input.status || input.codeVerificationStatus || input.code_verification_status || '',
      ).trim() || undefined,
    isDefault: Boolean(input.isDefault || input.is_default),
  };
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

// ─── PhoneManagementSheet ─────────────────────────────────────────────────────
function PhoneManagementSheet({
  account,
  onClose,
}: {
  account: WhatsappListRow | null;
  onClose: () => void;
}) {
  const [phones, setPhones] = useState<ManagedPhone[]>([]);
  const [loading, setLoading] = useState(false);

  const [addStep, setAddStep] = useState<
    | 'idle'
    | 'loading_available'
    | 'select_available'
    | 'adding'
    | 'send_otp'
    | 'otp_sent'
    | 'verifying'
    | 'done'
    | 'error'
  >('idle');
  const [availablePhones, setAvailablePhones] = useState<PhoneNumber[]>([]);
  const [selectedAvailableId, setSelectedAvailableId] = useState('');
  const [pendingPhoneId, setPendingPhoneId] = useState('');
  const [addOtpCode, setAddOtpCode] = useState('');
  const [addCooldown, setAddCooldown] = useState(0);
  const [addError, setAddError] = useState('');

  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [phoneToRemove, setPhoneToRemove] = useState<ManagedPhone | null>(null);

  const accountId = account?.id ?? '';

  const loadPhones = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const res = await listPhoneNumbers(accountId);
      const raw = extractArraySources(res);
      setPhones(raw.map(normalizeManagedPhone).filter((p): p is ManagedPhone => !!p));
    } catch {
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (account) loadPhones().catch(() => undefined);
    else setPhones([]);
  }, [account, loadPhones]);

  useEffect(() => {
    if (addCooldown <= 0) return;
    const id = setTimeout(() => setAddCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [addCooldown]);

  const resetAddFlow = () => {
    setAddStep('idle');
    setAvailablePhones([]);
    setSelectedAvailableId('');
    setPendingPhoneId('');
    setAddOtpCode('');
    setAddCooldown(0);
    setAddError('');
  };

  const handleSetDefault = async (phone: ManagedPhone) => {
    setSettingDefaultId(phone.id);
    try {
      await setDefaultPhone(accountId, phone.phoneNumberId);
      toast.success(`${phone.phoneNumber} set as default sender`);
      await loadPhones();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to set default');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!phoneToRemove) return;
    setRemovingId(phoneToRemove.id);
    try {
      await removePhoneNumber(accountId, phoneToRemove.phoneNumberId);
      toast.success(`${phoneToRemove.phoneNumber} removed`);
      setPhoneToRemove(null);
      await loadPhones();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove phone');
    } finally {
      setRemovingId(null);
    }
  };

  const handleStartAdd = async () => {
    setAddError('');
    setSelectedAvailableId('');
    setAddStep('loading_available');
    try {
      const res = await fetchAvailableFromMeta(accountId);
      const raw: unknown[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const available = raw.map(normalizePhoneNumber).filter((p): p is PhoneNumber => !!p);
      if (available.length === 0) {
        setAddError('No available phone numbers found in your Meta Business Account.');
        setAddStep('error');
        return;
      }
      setAvailablePhones(available);
      setAddStep('select_available');
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to fetch available phones');
      setAddStep('error');
    }
  };

  const handleAddPhone = async () => {
    if (!selectedAvailableId) return;
    setAddStep('adding');
    try {
      const res = await addPhoneNumber(accountId, selectedAvailableId);
      const addedPhoneId = res?.data?.phoneNumberId || selectedAvailableId;
      if (res?.requiresOtp || res?.data?.status === 'pending_otp') {
        setPendingPhoneId(addedPhoneId);
        setAddStep('send_otp');
      } else {
        toast.success('Phone number added successfully');
        setAddStep('done');
        await loadPhones();
        setTimeout(resetAddFlow, 1500);
      }
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to add phone number');
      setAddStep('error');
    }
  };

  const handleSendAddOtp = async () => {
    setAddOtpCode('');
    setAddCooldown(60);
    try {
      await sendOtp({ accountId, phoneNumberId: pendingPhoneId });
      setAddStep('otp_sent');
      toast.success('OTP sent to your WhatsApp');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send OTP');
      setAddCooldown(0);
    }
  };

  const handleVerifyAddOtp = async () => {
    if (addOtpCode.length < 6) return;
    setAddStep('verifying');
    try {
      await verifyOtp({ accountId, phoneNumberId: pendingPhoneId, code: addOtpCode });
      toast.success('Phone number verified successfully');
      setAddStep('done');
      await loadPhones();
      setTimeout(resetAddFlow, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid OTP. Please try again.');
      setAddStep('otp_sent');
    }
  };

  const handleResendAddOtp = async () => {
    if (addCooldown > 0) return;
    setAddCooldown(60);
    try {
      await resendOtp({ accountId, phoneNumberId: pendingPhoneId });
      toast.success('OTP resent');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to resend OTP');
      setAddCooldown(0);
    }
  };

  const isAddFlowActive = addStep !== 'idle';

  return (
    <>
      <Sheet open={!!account} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Manage Phone Numbers
            </SheetTitle>
            <SheetDescription>
              {account?.wabaName || 'WhatsApp Business Account'}
              {account?.wabaId ? ` · ${account.wabaId}` : ''}
            </SheetDescription>
          </SheetHeader>

          {isAddFlowActive ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetAddFlow}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  ← Back to list
                </button>
                <span className="text-sm font-medium">Add Phone Number</span>
              </div>

              {addStep === 'loading_available' && (
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-sm">Fetching available numbers from Meta…</p>
                </div>
              )}

              {addStep === 'select_available' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Select a phone number to add to this account
                  </p>
                  <div className="space-y-2">
                    {availablePhones.map((phone) => (
                      <button
                        key={phone.id}
                        type="button"
                        onClick={() => setSelectedAvailableId(phone.id)}
                        className={cn(
                          'flex items-center justify-between rounded-lg border px-3 py-2.5 text-left w-full transition',
                          selectedAvailableId === phone.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/30',
                        )}
                      >
                        <div>
                          <p className="font-medium text-sm">{phone.displayPhoneNumber}</p>
                          <p className="text-xs text-muted-foreground">{phone.verifiedName}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {phone.codeVerificationStatus}
                        </Badge>
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleAddPhone().catch(() => undefined)}
                    disabled={!selectedAvailableId}
                    className="w-full"
                  >
                    Add Selected Number
                  </Button>
                </div>
              )}

              {addStep === 'adding' && (
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-sm">Registering phone number…</p>
                </div>
              )}

              {addStep === 'send_otp' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      Phone verification required
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      We need to verify this number. An OTP will be sent to it via WhatsApp.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleSendAddOtp().catch(() => undefined)}
                    className="w-full"
                  >
                    Send OTP via WhatsApp
                  </Button>
                </div>
              )}

              {(addStep === 'otp_sent' || addStep === 'verifying') && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    OTP sent to your WhatsApp. Enter the 6-digit code below.
                  </p>
                  <InputOTP maxLength={6} value={addOtpCode} onChange={setAddOtpCode}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  <Button
                    onClick={() => handleVerifyAddOtp().catch(() => undefined)}
                    disabled={addOtpCode.length < 6 || addStep === 'verifying'}
                    className="w-full"
                  >
                    {addStep === 'verifying' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleResendAddOtp().catch(() => undefined)}
                    disabled={addCooldown > 0}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {addCooldown > 0 ? `Resend in ${addCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              )}

              {addStep === 'done' && (
                <div className="flex flex-col items-center gap-3 py-8 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                  <p className="text-sm font-medium">Phone number added successfully!</p>
                </div>
              )}

              {addStep === 'error' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-medium text-rose-700">Failed to add phone</p>
                    <p className="text-xs text-rose-600 mt-1">{addError}</p>
                  </div>
                  <Button variant="outline" onClick={resetAddFlow} className="w-full">
                    Try again
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : phones.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No phone numbers managed for this account yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {phones.map((phone) => (
                    <div key={phone.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{phone.phoneNumber}</span>
                          {phone.isDefault && (
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs gap-1">
                              <Star className="h-2.5 w-2.5" />
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                      {phone.verifiedName && (
                        <p className="text-xs text-muted-foreground">{phone.verifiedName}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {phone.qualityRating && (
                          <Badge variant="outline" className="text-xs">
                            Quality: {phone.qualityRating}
                          </Badge>
                        )}
                        {phone.status && (
                          <Badge
                            className={cn('text-xs capitalize', statusBadgeClass(phone.status))}
                          >
                            {phone.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        {!phone.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefault(phone).catch(() => undefined)}
                            className="h-7 px-2 text-xs"
                          >
                            {settingDefaultId === phone.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Set Default'
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPhoneToRemove(phone)}
                          className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={() => handleStartAdd().catch(() => undefined)}
                className="w-full gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" /> Add Phone Number
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!phoneToRemove} onOpenChange={(open) => !open && setPhoneToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Phone Number</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {phoneToRemove?.phoneNumber} from this account? The next available number will
              be promoted to default automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => handleRemoveConfirm().catch(() => undefined)}
            >
              {removingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── ConnectWabaDialog ────────────────────────────────────────────────────────
// Exact Plivo flow (confirmed from screenshots):
//
// STEP 1 — Dialog: Two selectable option cards + "Next" button at bottom
//   • "Connect your WhatsApp Business app"  (phone icon)
//   • "Connect your own Number"             (link icon)
//   Selecting a card highlights it; Next is only enabled when one is selected.
//
// STEP 2 — For BOTH options: FB Embedded Signup popup opens immediately on Next.
//   Meta handles everything inside the popup:
//     - Login to Facebook
//     - Select business portfolio + WABA
//     - Add/select phone number (display-name-only OR existing number)
//     - OTP verification (done by Meta, not us)
//     - Review & confirm permissions
//   Your dialog shows a "waiting" background state while popup is open.
//
// STEP 3 — FB popup closes → WA_EMBEDDED_SIGNUP postMessage fires →
//   Backend call to connectWaba() → success toast → dialog closes.

type DialogFlowStep = 'choose' | 'popup_open' | 'connecting' | 'error';

function ConnectWabaDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const embeddedSignupRef = useRef<{ wabaId: string; phoneNumberId: string } | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<ConnectMethod | null>(null);
  const [flowStep, setFlowStep] = useState<DialogFlowStep>('choose');
  const [error, setError] = useState('');

  const extractSignupData = useCallback((message: Record<string, unknown>) => {
    const direct = parseRecord(message.data);
    const sessionInfo = parseRecord(
      message.sessionInfo || direct.sessionInfo || direct.session_info || direct.data,
    );
    const nestedPayload = parseRecord(direct.payload || direct.data || direct.result);
    const candidateSources = [message, direct, nestedPayload, sessionInfo];

    let wabaId = '';
    let phoneNumberId = '';

    for (const source of candidateSources) {
      if (!wabaId) {
        wabaId = readString(source, [
          'waba_id',
          'wabaId',
          'business_account_id',
          'businessAccountId',
          'whatsapp_business_account_id',
        ]);
      }
      if (!phoneNumberId) {
        phoneNumberId = readString(source, [
          'phone_number_id',
          'phoneNumberId',
          'selected_phone_number_id',
          'selectedPhoneNumberId',
        ]);
      }
    }

    if (!phoneNumberId) {
      const phoneNumbers =
        (Array.isArray(direct.phone_numbers) && direct.phone_numbers) ||
        (Array.isArray(direct.phoneNumbers) && direct.phoneNumbers) ||
        (Array.isArray(nestedPayload.phone_numbers) && nestedPayload.phone_numbers) ||
        (Array.isArray(nestedPayload.phoneNumbers) && nestedPayload.phoneNumbers) ||
        [];
      const firstPhone = phoneNumbers.find((item) => isObject(item));
      if (isObject(firstPhone)) {
        phoneNumberId = readString(firstPhone, ['id', 'phone_number_id', 'phoneNumberId']);
      }
    }

    return { wabaId, phoneNumberId };
  }, []);

  // Listen for WA_EMBEDDED_SIGNUP postMessage from Meta popup
  useEffect(() => {
    const allowedOrigins = new Set([
      'https://www.facebook.com',
      'https://facebook.com',
      'https://web.facebook.com',
      'https://m.facebook.com',
      'https://business.facebook.com',
    ]);

    const handleFbMessage = (event: MessageEvent) => {
      if (!allowedOrigins.has(event.origin)) return;
      try {
        const d = parseRecord(event.data);
        if (d.type === 'WA_EMBEDDED_SIGNUP') {
          const signup = extractSignupData(d);
          if (d.event === 'FINISH') {
            embeddedSignupRef.current = signup;
          } else if (d.event === 'CANCEL') {
            embeddedSignupRef.current = null;
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleFbMessage);
    return () => window.removeEventListener('message', handleFbMessage);
  }, [extractSignupData]);

  const reset = useCallback(() => {
    setSelectedMethod(null);
    setFlowStep('choose');
    setError('');
    embeddedSignupRef.current = null;
  }, []);

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) reset();
  };

  const waitForEmbeddedSignup = useCallback(async (timeoutMs = 5000, intervalMs = 100) => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const current = embeddedSignupRef.current;
      if (current?.wabaId?.trim()) return current;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return embeddedSignupRef.current;
  }, []);

  // Called when user clicks "Next" — opens the FB popup for BOTH options
  const handleNext = useCallback(() => {
    if (!selectedMethod) return;

    if (!window.FB) {
      setError('Facebook SDK has not loaded yet. Please refresh and try again.');
      setFlowStep('error');
      return;
    }

    setFlowStep('popup_open');
    setError('');

    window.FB.login(
      (response: FacebookLoginResponse) => {
        if (!response.authResponse) {
          // User closed or cancelled the popup
          setError('The Meta login window was closed. Please try again.');
          setFlowStep('error');
          return;
        }

        const accessToken = response.authResponse.accessToken?.trim() || '';
        if (!accessToken) {
          setError(
            'Meta did not return an access token. Please retry login and grant permissions.',
          );
          setFlowStep('error');
          return;
        }

        // Popup completed — now connect on backend
        setFlowStep('connecting');
        waitForEmbeddedSignup()
          .then((signup) => {
            const wabaId =
              signup?.wabaId?.trim() || (process.env.NEXT_PUBLIC_META_WABA_ID || '').trim();
            if (!wabaId) {
              setError(
                'Could not capture WABA ID from Meta signup. Please complete all popup steps and try again.',
              );
              setFlowStep('error');
              return;
            }

            return connectWaba({
              accessToken,
              wabaId,
              ...(signup?.phoneNumberId ? { phoneNumberId: signup.phoneNumberId } : {}),
            })
              .then(() => {
                embeddedSignupRef.current = null;
                toast.success('WhatsApp number connected successfully!');
                onOpenChange(false);
                reset();
                onSuccess();
              })
              .catch((e: unknown) => {
                setError(e instanceof Error ? e.message : 'Connection failed. Please try again.');
                setFlowStep('error');
              });
          })
          .catch((e: unknown) => {
            setError(e instanceof Error ? e.message : 'Connection failed. Please try again.');
            setFlowStep('error');
          });
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID || '',
        response_type: 'token',
        override_default_response_type: false,
        extras: {
          setup: {},
          // Tell Meta which flow to use based on selected method
          featureType: selectedMethod === 'existing_app' ? 'coexistence' : '',
          sessionInfoVersion: '3',
        },
      },
    );
  }, [selectedMethod, onOpenChange, reset, onSuccess, waitForEmbeddedSignup]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">Connect WhatsApp Number</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-0.5">
            Choose how you would like to onboard with us.
          </DialogDescription>
        </div>

        {/* ── Step: Choose method ── */}
        {(flowStep === 'choose' || flowStep === 'error') && (
          <>
            <div className="px-6 py-5 space-y-3">
              {/* Option A: Connect existing WA Business App */}
              <button
                type="button"
                onClick={() => setSelectedMethod('existing_app')}
                className={cn(
                  'w-full rounded-xl border-2 p-5 text-left transition-all',
                  selectedMethod === 'existing_app'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40',
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'rounded-lg p-2.5 mt-0.5 transition-colors',
                      selectedMethod === 'existing_app'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight">
                      Connect your WhatsApp Business app
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Link your WhatsApp Business App that you use on your phone. You'll continue to
                      use the app as usual.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option B: Connect your own number */}
              <button
                type="button"
                onClick={() => setSelectedMethod('own_number')}
                className={cn(
                  'w-full rounded-xl border-2 p-5 text-left transition-all',
                  selectedMethod === 'own_number'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40',
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'rounded-lg p-2.5 mt-0.5 transition-colors',
                      selectedMethod === 'own_number'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    <Link2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight">Connect your own Number</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Share your WhatsApp Business account with us. You'll still have full access to
                      your WhatsApp Business app and can continue using it.
                    </p>
                  </div>
                </div>
              </button>

              {/* Error message */}
              {flowStep === 'error' && error && (
                <div className="flex items-start gap-2.5 text-sm text-rose-600 rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end">
              <Button onClick={handleNext} disabled={!selectedMethod} className="min-w-20">
                Next
              </Button>
            </div>
          </>
        )}

        {/* ── Step: FB popup is open — show waiting UI ── */}
        {flowStep === 'popup_open' && (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="relative flex items-center justify-center h-16 w-16">
              {/* Outer pulsing ring */}
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20" />
              {/* Inner icon */}
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.533 5.849L0 24l6.335-1.51A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.034-1.388l-.36-.215-3.735.892.942-3.63-.234-.373A9.786 9.786 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z" />
                </svg>
              </span>
            </div>
            <div>
              <p className="font-semibold text-base">Meta login window is open</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Complete the steps in the Meta popup — log in, select your business and WhatsApp
                account, then confirm.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Don't close this window while completing setup.
            </p>
          </div>
        )}

        {/* ── Step: Backend connecting ── */}
        {flowStep === 'connecting' && (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <div>
              <p className="font-semibold text-base">Connecting your account…</p>
              <p className="text-sm text-muted-foreground mt-1">
                This may take a few moments. Please keep this window open.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WhatsappConnect() {
  const [accounts, setAccounts] = useState<WhatsappListRow[]>([]);
  const [search, setSearch] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [connectOpen, setConnectOpen] = useState(false);
  const [managingAccount, setManagingAccount] = useState<WhatsappListRow | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const response = await getAllAccounts();
      const accountSummaries = normalizeAccountSummaries(response);

      const accountRows = await Promise.all(
        accountSummaries.map(async (account) => {
          const [accountDetailResult, phonesResult] = await Promise.allSettled([
            getAccountById(account.id),
            listPhoneNumbers(account.id),
          ]);

          const resolvedAccount =
            accountDetailResult.status === 'fulfilled'
              ? normalizeAccountSummary(accountDetailResult.value) || account
              : account;
          const phonesRaw =
            phonesResult.status === 'fulfilled' ? extractArraySources(phonesResult.value) : [];
          const rows = phonesRaw
            .map((phone) =>
              mapToListRow({
                ...(isObject(phone) ? phone : {}),
                accountId: resolvedAccount.id,
                wabaId: resolvedAccount.wabaId,
                wabaName: resolvedAccount.wabaName,
                status: isObject(phone)
                  ? (phone.status ?? resolvedAccount.status)
                  : resolvedAccount.status,
              }),
            )
            .filter((row): row is WhatsappListRow => !!row);

          return rows.length > 0 ? rows : [createAccountOnlyRow(resolvedAccount)];
        }),
      );

      setAccounts(accountRows.flat());
    } catch {
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts().catch(() => undefined);
  }, [loadAccounts]);

  // Load FB SDK once
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

  return (
    <div className="space-y-6 p-6">
      {/* ── Accounts table ── */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between gap-4 p-4 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by number, WABA or status..."
              className="ps-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadAccounts().catch(() => undefined)}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" onClick={() => setConnectOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Connect WhatsApp Number
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone Number</TableHead>
              <TableHead>WA Business Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Name Status</TableHead>
              <TableHead>Quality Rating</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingAccounts ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading connected numbers...
                </TableCell>
              </TableRow>
            ) : filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No connected WhatsApp numbers yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow key={`${account.id}-${account.phoneNumber}`}>
                  <TableCell className="font-medium">{account.phoneNumber || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {account.wabaName || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs capitalize', statusBadgeClass(account.status))}>
                      {account.status || 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.isVerified ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="h-3.5 w-3.5" /> Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{account.quality}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setManagingAccount(account)}
                      className="h-7 gap-1.5 px-2 text-xs"
                    >
                      Manage Phones
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Phone Management Sheet ── */}
      <PhoneManagementSheet account={managingAccount} onClose={() => setManagingAccount(null)} />

      {/* ── Connect WABA Dialog (Plivo-style flow) ── */}
      <ConnectWabaDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onSuccess={() => loadAccounts().catch(() => undefined)}
      />
    </div>
  );
}
