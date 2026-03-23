'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  deleteResendConfig,
  getResendConfig,
  saveResendConfig,
  verifyResendDomain,
} from '@/features/settings/services';
import type { ResendConfig as ResendConfigType, ResendDnsRecord } from '@/features/settings/types';

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_META = {
  not_configured: {
    label: 'Not Configured',
    icon: XCircle,
    className: 'text-muted-foreground',
    bg: 'bg-muted/50',
  },
  pending: {
    label: 'Pending Verification',
    icon: Clock,
    className: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    className: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
  },
  failed: {
    label: 'Verification Failed',
    icon: AlertCircle,
    className: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
} as const;

// ─── DNS records table ───────────────────────────────────────────────────────

function DnsRecordsTable({ records }: { records: ResendDnsRecord[] }) {
  const [open, setOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-sm font-medium"
      >
        <span>DNS Records ({records.length})</span>
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Value</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">TTL</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="px-3 py-2 font-mono text-foreground">{rec.type}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono truncate max-w-[180px]" title={rec.name}>
                        {rec.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(rec.name)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="size-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono truncate max-w-[240px]" title={rec.value}>
                        {rec.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(rec.value)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="size-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{rec.ttl}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        rec.status === 'verified'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                      }`}
                    >
                      {rec.status === 'verified' ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <Clock className="size-3" />
                      )}
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Config form ─────────────────────────────────────────────────────────────

interface FormState {
  apiKey: string;
  fromName: string;
  fromEmail: string;
  domain: string;
}

function ConfigForm({
  existing,
  onSaved,
}: {
  existing: ResendConfigType | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    apiKey: '',
    fromName: existing?.fromName ?? '',
    fromEmail: existing?.fromEmail ?? '',
    domain: existing?.domain ?? '',
  });

  const saveMutation = useMutation({
    mutationFn: saveResendConfig,
    onSuccess: () => {
      toast.success('Resend configuration saved. Add the DNS records to verify your domain.');
      onSaved();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.apiKey.trim()) {
      toast.error('API key is required');
      return;
    }
    saveMutation.mutate(form);
  };

  const field = (
    key: keyof FormState,
    label: string,
    placeholder: string,
    type = 'text',
    hint?: string,
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={key} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={key}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {field(
        'apiKey',
        'Resend API Key',
        're_xxxxxxxxxxxxxxxxxxxx',
        'password',
        existing
          ? `Current key: ${existing.apiKey} — enter a new key only if you want to change it`
          : 'Get your API key from resend.com/api-keys',
      )}
      {field('fromName', 'Sender Name', 'Acme Corp', 'text', 'Display name shown in the inbox')}
      {field(
        'fromEmail',
        'Sender Email',
        'hello@acme.com',
        'email',
        'Must belong to the domain below',
      )}
      {field(
        'domain',
        'Domain',
        'acme.com',
        'text',
        'The domain you want to send from. It will be registered in Resend.',
      )}

      <button
        type="submit"
        disabled={saveMutation.isPending}
        className="mt-1 h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 w-fit"
      >
        {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
        {existing ? 'Update Configuration' : 'Save & Register Domain'}
      </button>
    </form>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ResendConfig() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery<ResendConfigType | null>({
    queryKey: ['resend-config'],
    queryFn: getResendConfig,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyResendDomain,
    onSuccess: (updated) => {
      queryClient.setQueryData(['resend-config'], updated);
      if (updated.domainStatus === 'verified') {
        toast.success('Domain verified! Campaign emails will now send from your domain.');
      } else {
        toast.info(`Domain status: ${updated.domainStatus}. DNS changes can take up to 48 hours.`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResendConfig,
    onSuccess: () => {
      queryClient.setQueryData(['resend-config'], null);
      toast.success('Resend configuration removed.');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['resend-config'] });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const status = config?.domainStatus ?? 'not_configured';
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Resend Email Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your own Resend account so campaign emails are sent from your domain.{' '}
          <a
            href="https://resend.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
          >
            resend.com <ExternalLink className="size-3" />
          </a>
        </p>
      </div>

      {/* Status banner */}
      {config && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${meta.bg}`}>
          <StatusIcon className={`size-5 mt-0.5 shrink-0 ${meta.className}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${meta.className}`}>{meta.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Domain: <span className="font-mono">{config.domain}</span> · From:{' '}
              <span className="font-mono">{config.fromEmail}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {status !== 'verified' && (
              <button
                type="button"
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-md border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                Check Verification
              </button>
            )}
            {status === 'verified' && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <ShieldCheck className="size-4" /> Active
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                if (confirm('Remove Resend configuration?')) deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              title="Remove configuration"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* DNS records (shown when pending/failed) */}
      {config?.dnsRecords && config.dnsRecords.length > 0 && status !== 'verified' && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Step 2 — Add these DNS records</p>
          <p className="text-xs text-muted-foreground">
            Add the records below to your DNS provider, then click "Check Verification". Changes can
            take up to 48 hours to propagate.
          </p>
          <DnsRecordsTable records={config.dnsRecords} />
        </div>
      )}

      {/* Form */}
      <div className="rounded-lg border border-border p-5 space-y-4">
        <p className="text-sm font-medium">
          {config ? 'Update Configuration' : 'Step 1 — Connect Resend'}
        </p>
        <ConfigForm existing={config ?? null} onSaved={invalidate} />
      </div>

      {/* Info box */}
      <div className="rounded-lg bg-muted/40 border border-border p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">How it works</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Enter your Resend API key, sender details, and domain.</li>
          <li>We register the domain with Resend and return DNS records.</li>
          <li>Add those DNS records in your DNS provider (Cloudflare, Route 53, etc.).</li>
          <li>Click "Check Verification" — once verified, all campaign emails use your domain.</li>
        </ol>
      </div>
    </div>
  );
}
